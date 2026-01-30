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

    const getOrCreateRoom = async () => {
        if (!projectId) {
            console.error('❌ getOrCreateRoom: No projectId provided');
            return null;
        }

        console.log('🔍 getOrCreateRoom: Starting for projectId:', projectId);

        try {
            // Try to find existing room
            console.log('🔍 getOrCreateRoom: SELECT query...');
            const { data: rooms, error: selectError } = await supabase
                .from('chat_rooms')
                .select('id')
                .eq('project_id', projectId)
                .single();

            console.log('🔍 getOrCreateRoom: SELECT result:', { rooms, selectError });

            if (rooms) {
                console.log('✅ getOrCreateRoom: Found existing room:', rooms.id);
                return rooms.id;
            }

            if (selectError && selectError.code !== 'PGRST116') {
                // PGRST116 = no rows returned, which is fine
                console.error('❌ getOrCreateRoom: SELECT error:', {
                    code: selectError.code,
                    message: selectError.message,
                    details: selectError.details,
                    hint: selectError.hint,
                    full: selectError
                });
            }

            // Room doesn't exist, create it
            console.log('🔨 getOrCreateRoom: Creating new room for project:', projectId);
            const { data: newRoom, error: createError } = await supabase
                .from('chat_rooms')
                .insert({ project_id: projectId })
                .select()
                .single();

            console.log('🔨 getOrCreateRoom: INSERT result:', { newRoom, createError });

            if (createError) {
                console.error('❌ getOrCreateRoom: INSERT error:', {
                    code: createError.code,
                    message: createError.message,
                    details: createError.details,
                    hint: createError.hint,
                    full: createError
                });
                return null;
            }

            if (newRoom) {
                console.log('✅ getOrCreateRoom: Created new room:', newRoom.id);
                return newRoom.id;
            }
        } catch (err) {
            console.error('❌ getOrCreateRoom: EXCEPTION:', err);
        }
        return null;
    };

    // Fetch or create chat room for the project
    useEffect(() => {
        const init = async () => {
            const id = await getOrCreateRoom();
            if (id) setRoomId(id);
        };
        init();
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
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Fetch messages error", error);
            } else {
                setMessages(prev => {
                    const params = data as any[] || [];
                    const temps = prev.filter(m => m.id.startsWith('temp-'));
                    // Dedup just in case
                    return [...params, ...temps];
                });
            }
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

                        setMessages(prev => {
                            // Deduplicate: Remove optimistic message if it matches content/sender
                            const filtered = prev.filter(m =>
                                !(m.id.startsWith('temp-') && m.content === newMessage.content && m.sender_id === newMessage.sender_id)
                            );
                            // Also ensure we don't add the SAME real ID twice
                            if (filtered.some(m => m.id === newMessage.id)) return filtered;
                            return [...filtered, newMessage];
                        });
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
                            const currentReads = msg.reads || [];
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
        console.log('💬 useChat.sendMessage: START', { content, mediaUrl, roomId, projectId });
        let activeRoomId = roomId;

        // JIT Room Creation/Fetching if missing
        if (!activeRoomId && projectId) {
            console.log('💬 useChat.sendMessage: No roomId, creating...');
            const id = await getOrCreateRoom();
            if (id) {
                activeRoomId = id;
                setRoomId(id);
                console.log('💬 useChat.sendMessage: Room created:', id);
            } else {
                console.error('💬 useChat.sendMessage: Failed to create room');
            }
        }

        if (!activeRoomId || !content.trim()) {
            console.warn("Cannot send message: No Room ID or empty content", { activeRoomId, content });
            return;
        }

        const user = await supabase.auth.getUser();
        if (!user.data.user) {
            console.error("Cannot send message: No authenticated user");
            return;
        }

        // Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: MessageWithSender = {
            id: tempId,
            room_id: activeRoomId,
            sender_id: user.data.user.id,
            content,
            media_url: mediaUrl || null,
            created_at: new Date().toISOString(),
            is_deleted: false,
            is_edited: false,
            sender: {
                id: user.data.user.id,
                display_name: 'Me',
                avatar_url: null,
            } as any,
            reads: []
        };

        console.log('💬 useChat.sendMessage: Adding optimistic message', optimisticMessage);
        setMessages(prev => {
            const newMessages = [...prev, optimisticMessage];
            console.log('💬 useChat.sendMessage: New messages array length:', newMessages.length);
            return newMessages;
        });

        try {
            console.log('💬 useChat.sendMessage: Inserting to DB...');
            const { error, data } = await supabase
                .from('messages')
                .insert({
                    room_id: activeRoomId,
                    sender_id: user.data.user.id,
                    content,
                    media_url: mediaUrl
                })
                .select();

            if (error) {
                console.error("Message insert error:", error);
                setMessages(prev => prev.filter(m => m.id !== tempId));
                toast.error('Failed to send message');
                throw error;
            } else {
                console.log('💬 useChat.sendMessage: DB insert SUCCESS', data);
            }
        } catch (error) {
            console.error('💬 useChat.sendMessage: EXCEPTION', error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
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
        if (!currentUserId || !messageId) return;

        try {
            const { error } = await supabase
                .from('message_reads')
                .insert({
                    message_id: messageId,
                    user_id: currentUserId
                });

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
