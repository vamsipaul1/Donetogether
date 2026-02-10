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
    const [replyTo, setReplyTo] = useState<MessageWithSender | null>(null);

    const getOrCreateRoom = async () => {
        if (!projectId) {
            return null;
        }

        try {
            // Try to find existing room
            const { data: rooms, error: selectError } = await supabase
                .from('chat_rooms')
                .select('id')
                .eq('project_id', projectId)
                .maybeSingle();

            if (rooms) {
                return rooms.id;
            }

            // Room doesn't exist, create it
            const { data: newRoom, error: createError } = await supabase
                .from('chat_rooms')
                .insert({ project_id: projectId })
                .select()
                .single();

            if (newRoom) {
                return newRoom.id;
            }
        } catch (err) {
            console.error('❌ useChat: getOrCreateRoom exception:', err);
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
            console.log('🔍 Fetching messages for room:', roomId);
            setIsLoading(true);


            try {
                // Fetch messages with basic relationships (simplified to avoid 409 errors)
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
                    console.error("❌ Fetch messages error:", error);
                    toast.error(`Failed to load messages: ${error.message}`);
                } else {
                    console.log(`✅ Fetched ${data?.length || 0} messages from database`);

                    // Try to fetch reactions separately (won't break if relationship is broken)
                    try {
                        const messageIds = data?.map(m => m.id) || [];
                        if (messageIds.length > 0) {
                            const { data: reactions } = await supabase
                                .from('message_reactions')
                                .select('*, user:profiles(*)')
                                .in('message_id', messageIds);

                            // Fetch replied messages separately
                            const replyToIds = data?.filter(m => m.reply_to).map(m => m.reply_to).filter(Boolean) || [];
                            let repliedMessagesMap: Record<string, any> = {};

                            if (replyToIds.length > 0) {
                                try {
                                    const { data: repliedMessages } = await supabase
                                        .from('messages')
                                        .select('id, content, sender:profiles(display_name, avatar_url)')
                                        .in('id', replyToIds);

                                    // Create a map for quick lookup
                                    repliedMessagesMap = (repliedMessages || []).reduce((acc, msg) => {
                                        acc[msg.id] = msg;
                                        return acc;
                                    }, {} as Record<string, any>);
                                } catch (replyError) {
                                    console.warn("⚠️ Could not fetch replied messages:", replyError);
                                }
                            }

                            // Attach reactions AND replied messages to messages
                            const messagesWithReactions = data?.map(msg => ({
                                ...msg,
                                reactions: reactions?.filter(r => r.message_id === msg.id) || [],
                                replied_message: msg.reply_to ? repliedMessagesMap[msg.reply_to] : null
                            }));

                            setMessages(prev => {
                                const params = messagesWithReactions as any[] || [];
                                const temps = prev.filter(m => m.id.startsWith('temp-'));
                                console.log(`📊 Setting messages: ${params.length} from DB + ${temps.length} temp`);
                                return [...params, ...temps];
                            });
                        } else {
                            setMessages(prev => {
                                const params = data as any[] || [];
                                const temps = prev.filter(m => m.id.startsWith('temp-'));
                                console.log(`📊 Setting messages: ${params.length} from DB + ${temps.length} temp`);
                                return [...params, ...temps];
                            });
                        }
                    } catch (reactionError) {
                        console.warn("⚠️ Could not fetch reactions (table may not exist yet):", reactionError);
                        // Still set messages without reactions
                        setMessages(prev => {
                            const params = data as any[] || [];
                            const temps = prev.filter(m => m.id.startsWith('temp-'));
                            return [...params, ...temps];
                        });
                    }
                }
            } catch (error) {
                console.error("❌ Fatal error fetching messages:", error);
                toast.error("Failed to load chat");
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
                        // Resilient column handling: DB might use sender_id or user_id
                        const senderId = payload.new.sender_id || payload.new.user_id;
                        const roomIdFromPayload = payload.new.room_id || payload.new.chat_room_id;

                        // Verify it belongs to this room
                        if (roomIdFromPayload !== roomId) return;

                        // Fetch the sender details for the new message
                        const { data: senderData } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', senderId)
                            .maybeSingle();

                        const newMessage = {
                            ...payload.new,
                            sender_id: senderId, // Ensure we have common field names
                            room_id: roomIdFromPayload,
                            sender: senderData || {
                                id: senderId,
                                display_name: 'Team Member',
                                avatar_url: null
                            },
                            reads: []
                        } as unknown as MessageWithSender;

                        setMessages(prev => {
                            // Deduplicate: Compare by content AND sender, or by ID if already exists
                            const isOptimisticMatch = (m: any) =>
                                m.id.startsWith('temp-') &&
                                m.content === newMessage.content &&
                                m.sender_id === newMessage.sender_id;

                            const filtered = prev.filter(m => !isOptimisticMatch(m));

                            // Prevent duplicates by ID
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
            // Listen for reactions (inserts/deletes into message_reactions)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'message_reactions'
                },
                async (payload) => {
                    // Refetch reactions for the affected message
                    const messageId = (payload.new as any)?.message_id || (payload.old as any)?.message_id;
                    if (messageId) {
                        const { data: reactions } = await supabase
                            .from('message_reactions')
                            .select('*, user:profiles(*)')
                            .eq('message_id', messageId);

                        setMessages(prev => prev.map(msg =>
                            msg.id === messageId
                                ? { ...msg, reactions: reactions || [] }
                                : msg
                        ));
                    }
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

    const sendMessage = async (content: string, attachmentData?: { url: string; name: string; size: number; type: string }, replyToId?: string) => {
        console.log('💬 useChat.sendMessage: START', { content, attachmentData, roomId, projectId });
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

        if (!activeRoomId || (!content.trim() && !attachmentData)) {
            console.warn("Cannot send message: No Room ID or empty content", { activeRoomId, content, attachmentData });
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
            media_url: attachmentData?.url || null,
            created_at: new Date().toISOString(),
            is_deleted: false,
            is_edited: false,
            sender: {
                id: user.data.user.id,
                display_name: 'Me',
                avatar_url: null,
            } as any,
            reads: [],
            // Add attachment fields for optimistic rendering
            ...(attachmentData && {
                attachment_url: attachmentData.url,
                attachment_name: attachmentData.name,
                attachment_size: attachmentData.size,
                attachment_type: attachmentData.type,
            })
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            console.log('💬 useChat.sendMessage: Inserting to DB...');
            const { error, data } = await supabase
                .from('messages')
                .insert({
                    room_id: activeRoomId,
                    sender_id: user.data.user.id,
                    content: content || (attachmentData ? '' : ''),
                    media_url: attachmentData?.url,
                    attachment_url: attachmentData?.url,
                    attachment_name: attachmentData?.name,
                    attachment_size: attachmentData?.size,
                    attachment_type: attachmentData?.type,
                    reply_to: replyToId || null,  // Now enabled - make sure SQL migration is run!
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

    const editMessage = async (messageId: string, newContent: string) => {
        if (!newContent.trim()) {
            toast.error('Message cannot be empty');
            return;
        }

        try {
            const { error } = await supabase
                .from('messages')
                .update({
                    content: newContent,
                    is_edited: true
                })
                .eq('id', messageId);

            if (error) {
                console.error('Edit message error:', error);
                toast.error('Failed to edit message');
            } else {
                toast.success('Message edited');
            }
        } catch (err) {
            console.error('Edit message exception:', err);
            toast.error('Failed to edit message');
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_deleted: true })
                .eq('id', messageId);

            if (error) {
                console.error('Delete message error:', error);
                toast.error('Failed to delete message');
            } else {
                toast.success('Message deleted');
            }
        } catch (err) {
            console.error('Delete message exception:', err);
            toast.error('Failed to delete message');
        }
    };

    const addReaction = async (messageId: string, emoji: string) => {
        if (!currentUserId) return;

        try {
            const { error } = await supabase
                .from('message_reactions')
                .insert({
                    message_id: messageId,
                    user_id: currentUserId,
                    emoji
                });

            if (error && error.code !== '23505') { // Ignore duplicate error
                console.error('Add reaction error:', error);
                toast.error('Failed to add reaction');
            }
        } catch (err) {
            console.error('Add reaction exception:', err);
        }
    };

    const removeReaction = async (messageId: string, emoji: string) => {
        if (!currentUserId) return;

        // Optimistic Removal
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                return {
                    ...msg,
                    reactions: (msg.reactions || []).filter(r => !(r.user_id === currentUserId && r.emoji === emoji))
                };
            }
            return msg;
        }));

        try {
            const { error } = await supabase
                .from('message_reactions')
                .delete()
                .eq('message_id', messageId)
                .eq('user_id', currentUserId)
                .eq('emoji', emoji);

            if (error) {
                console.error('Remove reaction error:', error);
                // Revert on error if needed, but usually real-time will sync it back
            }
        } catch (err) {
            console.error('Remove reaction exception:', err);
        }
    };

    const clearChatHistory = async () => {
        if (!roomId) return;

        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('room_id', roomId);

            if (error) {
                console.error('Clear chat history error:', error);
                toast.error('Failed to clear chat history');
            } else {
                setMessages([]);
                toast.success('Chat history cleared');
            }
        } catch (err) {
            console.error('Clear chat history exception:', err);
            toast.error('Failed to clear chat history');
        }
    };

    return {
        messages,
        isLoading,
        isConnected,
        sendMessage,
        sendTyping,
        markAsRead,
        editMessage,
        deleteMessage,
        addReaction,
        removeReaction,
        clearChatHistory,
        typingUsers,
        roomId,
        replyTo,
        setReplyTo
    };
};
