import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Message, MessageWithSender, ChatRoom } from '@/types/database';
import { toast } from 'sonner';

export const useChat = (projectId: string | undefined, currentUserId?: string) => {
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    // Fetch or create chat room for the project
    useEffect(() => {
        if (!projectId) return;

        const fetchRoom = async () => {
            try {
                // Try to find existing room
                const { data: rooms, error } = await supabase
                    .from('chat_rooms')
                    .select('id')
                    .eq('project_id', projectId)
                    .single();

                if (rooms) {
                    setRoomId(rooms.id);
                } else if (!rooms && !error) {
                    // Create if not exists (handled by SQL usually or logic here)
                    const { data: newRoom, error: createError } = await supabase
                        .from('chat_rooms')
                        .insert({ project_id: projectId })
                        .select()
                        .single();

                    if (newRoom) setRoomId(newRoom.id);
                    if (createError && createError.code !== '23505') { // Ignore unique constraint error
                        console.error('Error creating room:', createError);
                    }
                }
            } catch (err) {
                console.error('Error fetching chat room:', err);
            }
        };

        fetchRoom();
    }, [projectId]);

    // Fetch messages and subscribe
    useEffect(() => {
        if (!roomId) return;

        const fetchMessages = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:profiles(*),
                    reads:message_reads(user_id)
                `)
                .eq('room_id', roomId)
                .order('created_at', { ascending: true }); // Oldest first for chat

            if (error) {
                toast.error('Failed to load messages');
                return;
            }

            setMessages(data as any[] || []);
            setIsLoading(false);
        };

        fetchMessages();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${roomId}`
                },
                async (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // Fetch the sender details for the new message
                        const { data: senderData } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', payload.new.sender_id)
                            .single();

                        const newMessage = {
                            ...payload.new,
                            sender: senderData,
                            reads: []
                        } as unknown as MessageWithSender;

                        setMessages(prev => [...prev, newMessage]);
                    } else if (payload.eventType === 'UPDATE') {
                        setMessages(prev => prev.map(msg =>
                            msg.id === payload.new.id
                                ? { ...msg, ...payload.new } // Merge updates
                                : msg
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
                    }
                }
            )
            // Listen for read receipts (inserts into message_reads)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'message_reads'
                },
                (payload) => {
                    setMessages(prev => prev.map(msg => {
                        if (msg.id === payload.new.message_id) {
                            // Add the new read to the message's reads array
                            const currentReads = msg.reads || [];
                            // Check duplication just in case
                            if (!currentReads.some(r => r.user_id === payload.new.user_id)) {
                                return {
                                    ...msg,
                                    reads: [...currentReads, { user_id: payload.new.user_id } as any]
                                };
                            }
                        }
                        return msg;
                    }));
                }
            )
            // Typing indicators via Broadcast
            .on('broadcast', { event: 'typing' }, (payload) => {
                if (payload.payload.userId !== currentUserId) {
                    setTypingUsers(prev => {
                        const newSet = new Set(prev);
                        newSet.add(payload.payload.username);
                        return newSet;
                    });

                    // Clear typing status after timeout
                    setTimeout(() => {
                        setTypingUsers(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(payload.payload.username);
                            return newSet;
                        });
                    }, 3000);
                }
            })
            .subscribe((status) => {
                setIsConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, currentUserId]);

    const sendMessage = async (content: string, mediaUrl?: string) => {
        if (!roomId || !content.trim()) return;

        try {
            const user = await supabase.auth.getUser();
            if (!user.data.user) return;

            const { error } = await supabase
                .from('messages')
                .insert({
                    room_id: roomId,
                    sender_id: user.data.user.id,
                    content,
                    media_url: mediaUrl
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const sendTyping = async (username: string) => {
        if (!roomId || !isConnected) return;

        await supabase.channel(`room:${roomId}`).send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: currentUserId, username }
        });
    };

    const markAsRead = async (messageId: string) => {
        if (!currentUserId) return;

        try {
            // Check if already read to avoid error spam? Or rely on unique constraint?
            // SQL "ON CONFLICT DO NOTHING" is best, but pure insert is fine if we ignore error.
            const { error } = await supabase
                .from('message_reads')
                .insert({
                    message_id: messageId,
                    user_id: currentUserId
                });

            // Ignore duplicate key error (code 23505)
            if (error && error.code !== '23505') {
                console.error("Error marking read:", error);
            }
        } catch (err) {
            // silent fail
        }
    };

    return {
        messages,
        isLoading,
        isConnected,
        sendMessage,
        sendTyping,
        markAsRead,
        typingUsers,
        roomId
    };
};
