import { motion } from 'framer-motion';
import { MessageWithSender } from '@/types/database';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageBubbleProps {
    message: MessageWithSender;
    isOwnMessage: boolean;
    onVisible?: (id: string) => void;
    totalProjectMembers?: number;
}

export const MessageBubble = ({ message, isOwnMessage, onVisible, totalProjectMembers = 1 }: MessageBubbleProps) => {

    useEffect(() => {
        if (!isOwnMessage && onVisible) {
            const timer = setTimeout(() => {
                onVisible(message.id);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [message.id, isOwnMessage, onVisible]);

    if (message.is_deleted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "flex w-full mb-4 px-4",
                    isOwnMessage ? "justify-end" : "justify-start"
                )}
            >
                <div className="bg-zinc-100 dark:bg-zinc-800/50 px-4 py-2 rounded-lg text-sm italic text-zinc-400">
                    This message was deleted
                </div>
            </motion.div>
        );
    }

    const readCount = message.reads?.length || 0;
    const isReadByEveryone = totalProjectMembers > 1 && readCount >= (totalProjectMembers - 1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "flex w-full mb-4 px-4 group gap-3",
                isOwnMessage ? "justify-end" : "justify-start"
            )}
        >
            {/* Avatar for other users */}
            {!isOwnMessage && (
                <Avatar className="h-8 w-8 mt-1 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <AvatarImage src={message.sender?.avatar_url} />
                    <AvatarFallback className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {message.sender?.display_name?.slice(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={cn(
                "flex max-w-[75%] md:max-w-[60%] flex-col",
                isOwnMessage ? "items-end" : "items-start"
            )}>
                {!isOwnMessage && (
                    <span className="text-[11px] font-semibold text-zinc-500 mb-1 ml-1 px-1">
                        {message.sender?.display_name || 'Unknown'} <span className="text-[10px] font-normal opacity-70 ml-1">{format(new Date(message.created_at), 'h:mm a')}</span>
                    </span>
                )}

                <div className={cn(
                    "relative px-5 py-3 shadow-sm text-[14px] leading-relaxed",
                    isOwnMessage
                        ? "bg-emerald-500 text-white rounded-2xl rounded-tr-sm shadow-emerald-500/10"
                        : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-sm shadow-zinc-200/50 dark:shadow-none"
                )}>
                    {message.content}
                </div>

                {/* Metadata line for OWN message (bottom right) */}
                {isOwnMessage && (
                    <div className="flex items-center gap-1 justify-end mt-1 mr-1 text-[10px] text-zinc-400">
                        {message.is_edited && <span>(edited)</span>}
                        <span>{format(new Date(message.created_at), 'h:mm a')}</span>
                        <span className="font-medium mx-1">You</span>

                        <span title={isReadByEveryone ? "Read by everyone" : "Delivered"}>
                            <CheckCheck
                                className={cn(
                                    "w-3.5 h-3.5 ml-0.5",
                                    isReadByEveryone ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-600"
                                )}
                                strokeWidth={1.5}
                            />
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
