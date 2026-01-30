import { motion, AnimatePresence } from 'framer-motion';
import { MessageWithSender } from '@/types/database';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/lib/avatarUtils';
import { Check, CheckCheck, Clock, FileText, Download, Reply, Smile, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

interface MessageBubbleProps {
    message: MessageWithSender;
    isOwnMessage: boolean;
    onVisible?: (id: string) => void;
    totalProjectMembers?: number;
    isSequence?: boolean;
}

// Message status enum
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export const MessageBubble = ({
    message,
    isOwnMessage,
    onVisible,
    totalProjectMembers = 1,
    isSequence = false
}: MessageBubbleProps) => {

    const [status, setStatus] = useState<MessageStatus>('sending');

    useEffect(() => {
        // Determine message status
        if (message.id.startsWith('temp-')) {
            setStatus('sending');
        } else {
            const readCount = message.reads?.length || 0;
            const isReadByAll = totalProjectMembers > 1 && readCount >= (totalProjectMembers - 1);

            if (isReadByAll) {
                setStatus('read');
            } else if (readCount > 0) {
                setStatus('delivered');
            } else {
                setStatus('sent');
            }
        }
    }, [message.reads, totalProjectMembers, message.id]);

    useEffect(() => {
        if (!isOwnMessage && onVisible && !message.id.startsWith('temp-')) {
            const timer = setTimeout(() => {
                onVisible(message.id);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [message.id, isOwnMessage, onVisible]);

    if (message.is_deleted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "flex w-full px-4 mb-2",
                    isOwnMessage ? "justify-end" : "justify-start"
                )}
            >
                <div className="bg-zinc-100/50 dark:bg-zinc-800/20 px-4 py-2 rounded-xl text-xs italic text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    <span className="opacity-60">🗑️ This message was deleted</span>
                </div>
            </motion.div>
        );
    }

    // Parse Content for Attachments
    const attachmentMatch = message.content.match(/^\[Attachment: (.*?) \((.*?)\)\] \n(.*)/s) || message.content.match(/^\[Attachment: (.*?) \((.*?)\)\]/);

    let contentDisplay = message.content;
    let attachmentObj = null;

    if (attachmentMatch) {
        attachmentObj = {
            name: attachmentMatch[1],
            size: attachmentMatch[2]
        };
        contentDisplay = attachmentMatch[3] || "";
    }

    // Function to render text with mentions/hashes/tasks
    const renderContent = (text: string) => {
        if (!text) return null;
        return text.split(' ').map((word, i) => {
            // @mentions
            if (word.startsWith('@')) {
                return <span key={i} className="font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded cursor-pointer hover:bg-emerald-500/20 transition-colors">{word} </span>;
            }
            // #hashtags
            if (word.startsWith('#') && !word.match(/^#\d+$/)) {
                return <span key={i} className="font-bold text-blue-400 bg-blue-500/10 px-1 rounded cursor-pointer hover:bg-blue-500/20 transition-colors">{word} </span>;
            }
            // #task-id (numbers only)
            if (word.match(/^#\d+$/)) {
                return (
                    <span key={i} className="inline-flex items-center gap-1 font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md cursor-pointer hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        {word}
                    </span>
                );
            }
            return <span key={i}>{word} </span>;
        });
    };

    // Format time
    const formatTime = (date: string) => {
        const d = new Date(date);
        if (isToday(d)) return format(d, 'h:mm a');
        if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
        return format(d, 'MMM d, h:mm a');
    };

    // Status icon component
    const StatusIcon = () => {
        if (!isOwnMessage) return null;

        switch (status) {
            case 'sending':
                return <Clock className="w-3.5 h-3.5 text-zinc-400 animate-pulse" strokeWidth={2.5} />;
            case 'sent':
                return <Check className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2.5} />;
            case 'delivered':
                return <CheckCheck className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2.5} />;
            case 'read':
                return <CheckCheck className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "flex w-full px-4 group relative",
                isOwnMessage ? "justify-end" : "justify-start",
                isSequence ? "mb-1" : "mb-4 mt-3"
            )}
        >
            {/* Avatar for other users */}
            {!isOwnMessage && (
                <div className="w-9 flex flex-col justify-end mr-3">
                    {!isSequence ? (
                        <Avatar className="h-9 w-9 shadow-lg ring-2 ring-white dark:ring-black">
                            <AvatarImage src={message.sender?.avatar_url} />
                            <AvatarFallback className={cn(
                                "text-xs font-black text-white shadow-inner",
                                getAvatarColor(message.sender_id)
                            )}>
                                {getInitials(message.sender?.display_name || '')}
                            </AvatarFallback>
                        </Avatar>
                    ) : <div className="w-9" />}
                </div>
            )}

            <div className={cn(
                "flex max-w-[75%] md:max-w-[65%] flex-col relative",
                isOwnMessage ? "items-end" : "items-start"
            )}>
                {/* Sender Name & Time */}
                {!isOwnMessage && !isSequence && (
                    <div className="flex items-center gap-2 mb-1.5 ml-1 px-1">
                        <span className="text-xs font-black text-zinc-500 dark:text-zinc-400">
                            {message.sender?.display_name || 'Unknown User'}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400">
                            {formatTime(message.created_at)}
                        </span>
                    </div>
                )}

                <ContextMenu>
                    <ContextMenuTrigger>
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className={cn(
                                "relative px-4 py-2.5 text-[15px] leading-relaxed transition-all shadow-lg flex flex-col gap-2 backdrop-blur-sm",
                                isOwnMessage
                                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-[18px] rounded-tr-md shadow-emerald-500/25"
                                    : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 rounded-[18px] rounded-tl-md shadow-zinc-200/20 dark:shadow-zinc-900/40"
                            )}
                        >
                            {/* Attachment Card */}
                            {attachmentObj && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl mb-1 transition-colors",
                                        isOwnMessage
                                            ? "bg-white/15 border border-white/25 hover:bg-white/20"
                                            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    <div className={cn(
                                        "h-11 w-11 rounded-lg flex items-center justify-center shrink-0",
                                        isOwnMessage ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                    )}>
                                        <FileText className="h-5 w-5" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{attachmentObj.name}</p>
                                        <p className={cn(
                                            "text-[11px] font-medium mt-0.5",
                                            isOwnMessage ? "text-white/70" : "text-zinc-500"
                                        )}>{attachmentObj.size} • Document</p>
                                    </div>
                                    <button className={cn(
                                        "h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110",
                                        isOwnMessage ? "hover:bg-white/20" : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    )}>
                                        <Download className="h-4 w-4" strokeWidth={2.5} />
                                    </button>
                                </motion.div>
                            )}

                            {/* Text Content */}
                            {contentDisplay && (
                                <div className="font-medium select-text">
                                    {renderContent(contentDisplay)}
                                </div>
                            )}

                            {/* Edited indicator */}
                            {message.is_edited && (
                                <span className={cn(
                                    "text-[10px] font-medium mt-1",
                                    isOwnMessage ? "text-white/60" : "text-zinc-400"
                                )}>
                                    (edited)
                                </span>
                            )}
                        </motion.div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-2xl">
                        <ContextMenuItem className="gap-2 text-sm font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                            <Reply className="w-4 h-4" /> Reply
                        </ContextMenuItem>
                        <ContextMenuItem className="gap-2 text-sm font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Copy className="w-4 h-4" /> Copy
                        </ContextMenuItem>
                        <ContextMenuItem className="gap-2 text-sm font-semibold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20">
                            <Smile className="w-4 h-4" /> React
                        </ContextMenuItem>
                        {isOwnMessage && (
                            <ContextMenuItem className="gap-2 text-sm font-semibold text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Check className="w-4 h-4" /> Delete
                            </ContextMenuItem>
                        )}
                    </ContextMenuContent>
                </ContextMenu>

                {/* Status / Time for own message */}
                {isOwnMessage && (
                    <div className={cn(
                        "flex items-center gap-1.5 justify-end mt-1 mr-1 text-[11px] transition-all duration-200",
                        isSequence ? "opacity-0 group-hover:opacity-100 h-0 group-hover:h-auto" : "opacity-60 group-hover:opacity-100"
                    )}>
                        <span className="font-bold text-zinc-500 dark:text-zinc-400">
                            {formatTime(message.created_at)}
                        </span>
                        <StatusIcon />
                    </div>
                )}
            </div>
        </motion.div>
    );
};
