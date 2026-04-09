import { motion, AnimatePresence } from 'framer-motion';
import { MessageWithSender } from '@/types/database';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/lib/avatarUtils';
import { Check, CheckCheck, Clock, FileText, Download, Reply, Smile, Copy, Trash2, Image as ImageIcon, ExternalLink, Play, Pause, Volume2, CheckSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { toast } from 'sonner';
import { downloadFile, formatFileSize, isImageFile } from '@/lib/fileUpload';

interface MessageBubbleProps {
    message: MessageWithSender;
    isOwnMessage: boolean;
    currentUserId: string;
    onVisible?: (id: string) => void;
    onEdit?: (messageId: string, newContent: string) => void;
    onDelete?: (messageId: string) => void;
    onReact?: (messageId: string, emoji: string) => void;
    onRemoveReaction?: (messageId: string, emoji: string) => void;
    onReply?: () => void;
    totalProjectMembers?: number;
    isSequence?: boolean;
}

// Message status enum
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export const MessageBubble = ({
    message,
    isOwnMessage,
    currentUserId,
    onVisible,
    onEdit,
    onDelete,
    onReact,
    onRemoveReaction,
    onReply,
    totalProjectMembers = 1,
    isSequence = false
}: MessageBubbleProps) => {

    const [status, setStatus] = useState<MessageStatus>('sending');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    // Determine message status
    useEffect(() => {
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
            <div className={cn(
                "flex w-full px-4 mb-1",
                isOwnMessage ? "justify-end" : "justify-start"
            )}>
                <div className="bg-zinc-100/30 dark:bg-zinc-800/20 px-4 py-1.5 rounded-2xl text-[12px] italic text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                    Message deleted
                </div>
            </div>
        );
    }

    const hasNewAttachment = !!(message as any).attachment_url;
    const oldAttachmentMatch = message.content?.match(/^\[Attachment: (.*?) \((.*?)\)\](?:\s*\n(.*))?$/s);

    let attachmentData = null;
    let contentDisplay = message.content;

    if (hasNewAttachment) {
        attachmentData = {
            url: (message as any).attachment_url,
            name: (message as any).attachment_name || 'File',
            size: (message as any).attachment_size || 0,
            type: (message as any).attachment_type || 'document'
        };
    } else if (oldAttachmentMatch) {
        const fileName = oldAttachmentMatch[1];
        const fileSize = oldAttachmentMatch[2];
        contentDisplay = oldAttachmentMatch[3] || '';

        let fileType = 'document';
        if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName)) fileType = 'image';
        else if (/\.(wav|mp3|ogg|webm|m4a)$/i.test(fileName)) fileType = 'audio';

        attachmentData = {
            url: '#',
            name: fileName,
            size: 0,
            type: fileType,
            isLegacy: true
        };
    }

    const [isPlaying, setIsPlaying] = useState(false);
    const [audioProgress, setAudioProgress] = useState(0);

    const togglePlay = () => {
        const audio = document.getElementById(`audio-${message.id}`) as HTMLAudioElement;
        if (!audio) return;
        if (isPlaying) audio.pause();
        else audio.play();
        setIsPlaying(!isPlaying);
    };

    const renderContent = (text: string) => {
        if (!text) return null;
        return text.split(' ').map((word, i) => {
            if (word.startsWith('@')) {
                return <span key={i} className="text-blue-500 font-bold hover:underline cursor-pointer">{word} </span>;
            }
            if (word.startsWith('#')) {
                return <span key={i} className="text-zinc-400 font-bold hover:text-zinc-600 cursor-pointer">{word} </span>;
            }
            return <span key={i}>{word} </span>;
        });
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
                return <CheckCheck className="w-3.5 h-3.5 text-zinc-900 dark:text-white" strokeWidth={2.5} />;
        }
    };

    // Context menu handlers
    const handleReply = () => {
        if (onReply) {
            onReply();
            toast.success('Replying to message');
        } else {
            toast.info('Reply feature coming soon!');
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            toast.success('Message copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy message');
        }
    };

    const handleSaveEdit = () => {
        if (onEdit && editContent.trim()) {
            onEdit(message.id, editContent);
            setIsEditing(false);
        }
    };

    const handleDelete = () => {
        if (onDelete && isOwnMessage) {
            if (confirm('Are you sure you want to delete this message?')) {
                onDelete(message.id);
            }
        }
    };

    const formatTimeShort = (date: string) => {
        return format(new Date(date), 'h:mm a');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "flex w-full px-6 group relative",
                isOwnMessage ? "justify-end" : "justify-start",
                isSequence ? "mt-[4px]" : "mt-[16px]"
            )}
        >
            {/* AVATAR COLUMN - Fixed Width */}
            <div className="w-[44px] flex flex-col justify-end">
                {!isOwnMessage && !isSequence && (
                    <Avatar className="h-9 w-9 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                        <AvatarImage src={message.sender?.avatar_url} />
                        <AvatarFallback className={cn("text-[10px] font-black text-white", getAvatarColor(message.sender_id))}>
                            {getInitials(message.sender?.display_name || '?')}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>

            <div className={cn(
                "flex flex-col relative max-w-[70%]",
                isOwnMessage ? "items-end" : "items-start ml-2"
            )}>
                {/* SENDER NAME */}
                {!isOwnMessage && !isSequence && (
                    <span className="text-[12px] font-bold text-zinc-900 dark:text-zinc-100 mb-1 ml-1 font-satoshi capitalize">
                        {message.sender?.display_name || 'Partner'}
                    </span>
                )}

                <ContextMenu>
                    <ContextMenuTrigger>
                        <div className={cn(
                            "relative px-4 py-2.5 rounded-[22px] transition-all",
                            isOwnMessage 
                                ? "bg-white text-indigo-950 rounded-tr-[4px] border border-indigo-50 shadow-sm"
                                : "bg-indigo-600 text-white rounded-tl-[4px] shadow-sm"
                        )}>
                            {/* ATTACHMENT */}
                            {attachmentData && (
                                <div className="mb-2">
                                    {attachmentData.type === 'image' && (
                                        <div className="rounded-xl overflow-hidden mb-2 border border-black/5">
                                            <img src={attachmentData.url} alt="" className="max-w-xs h-auto" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "flex items-center gap-3 p-2 rounded-xl",
                                        isOwnMessage ? "bg-white/10" : "bg-zinc-50"
                                    )}>
                                        <FileText className="w-4 h-4" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">{attachmentData.name}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TEXT */}
                            {isEditing ? (
                                <textarea
                                    className="bg-transparent border-0 ring-0 focus:ring-0 w-full resize-none text-[15px]"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    onBlur={handleSaveEdit}
                                    autoFocus
                                />
                            ) : (
                                <p className="text-[14.5px] font-medium leading-[1.6] antialiased whitespace-pre-wrap font-inter">
                                    {renderContent(contentDisplay)}
                                </p>
                            )}

                            {/* TIME - Only shows on hover or as tiny detail */}
                            <div className={cn(
                                "absolute bottom-1 right-2 opacity-0 group-hover:opacity-40 transition-opacity text-[9px] uppercase font-black",
                                isOwnMessage ? "text-white" : "text-zinc-400"
                            )}>
                                {formatTimeShort(message.created_at)}
                            </div>
                        </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent className="w-56 p-2 rounded-2xl shadow-2xl border-zinc-100">
                        <ContextMenuItem onClick={onReply} className="gap-2 font-bold rounded-xl px-4 py-2.5">
                            <Reply className="w-4 h-4" /> Reply
                        </ContextMenuItem>
                        
                        <ContextMenuItem onClick={() => toast.success("Converted to Task")} className="gap-2 font-bold rounded-xl px-4 py-2.5 text-zinc-900 border-t border-zinc-50 mt-1">
                            <CheckSquare className="w-4 h-4 text-emerald-500" /> Convert to Task
                        </ContextMenuItem>
                        
                        <ContextMenuItem onClick={() => toast.success("Message Pinned")} className="gap-2 font-bold rounded-xl px-4 py-2.5">
                            <Play className="w-4 h-4 rotate-[-45deg]" /> Pin Message
                        </ContextMenuItem>

                        <div className="h-px bg-zinc-50 my-1" />

                        <ContextMenuItem onClick={handleCopy} className="gap-2 font-bold rounded-xl px-4 py-2.5">
                            <Copy className="w-4 h-4" /> Copy Text
                        </ContextMenuItem>
                        
                        {isOwnMessage && (
                            <ContextMenuItem onClick={handleDelete} className="gap-2 font-bold rounded-xl px-4 py-2.5 text-rose-500">
                                <Trash2 className="w-4 h-4" /> Delete
                            </ContextMenuItem>
                        )}
                    </ContextMenuContent>
                </ContextMenu>

                {/* STATUS FOR OWN MESSAGE */}
                {isOwnMessage && !isSequence && (
                    <div className="flex items-center gap-1 mt-1 mr-1">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                            {formatTimeShort(message.created_at)}
                        </span>
                        <div className="w-3 flex items-center justify-center">
                            {status === 'read' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-zinc-900" strokeWidth={3} />
                            ) : (
                                <Check className="w-3.5 h-3.5 text-zinc-300" strokeWidth={3} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

