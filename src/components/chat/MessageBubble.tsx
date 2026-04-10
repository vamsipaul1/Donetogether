import { MessageWithSender } from '@/types/database';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/lib/avatarUtils';
import { Check, CheckCheck, Clock, FileText, Download, Reply, Smile, Copy, Trash2, Image as ImageIcon, ExternalLink, Play, Pause } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { toast } from 'sonner';
import { downloadFile, formatFileSize } from '@/lib/fileUpload';

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
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (message.id.startsWith('temp-')) {
            setStatus('sending');
        } else {
            const readCount = message.reads?.length || 0;
            const isReadByAll = totalProjectMembers > 1 && readCount >= (totalProjectMembers - 1);
            setStatus(isReadByAll ? 'read' : readCount > 0 ? 'delivered' : 'sent');
        }
    }, [message.reads, totalProjectMembers, message.id]);

    useEffect(() => {
        if (!isOwnMessage && onVisible && !message.id.startsWith('temp-')) {
            const timer = setTimeout(() => onVisible(message.id), 500);
            return () => clearTimeout(timer);
        }
    }, [message.id, isOwnMessage, onVisible]);

    const formatTime = (date: string) => {
        const d = new Date(date);
        if (isToday(d)) return format(d, 'h:mm a');
        if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
        return format(d, 'MMM d, h:mm a');
    };

    const StatusIcon = () => {
        if (!isOwnMessage) return null;
        switch (status) {
            case 'sending': return <Clock className="w-3 h-3 text-zinc-400 animate-pulse" />;
            case 'sent': return <Check className="w-3 h-3 text-zinc-400" />;
            case 'delivered': return <CheckCheck className="w-3 h-3 text-zinc-400" />;
            case 'read': return <CheckCheck className="w-3 h-3 text-blue-500" />;
        }
    };

    const attachmentUrl = (message as any).attachment_url;
    const attachmentType = (message as any).attachment_type;
    const attachmentName = (message as any).attachment_name || 'File';

    if (message.is_deleted) {
        return (
            <div className={cn("flex w-full mb-1 px-4", isOwnMessage ? "justify-end" : "justify-start")}>
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 py-1.5 px-4 rounded-xl text-[12px] italic text-zinc-400">
                    Message deleted
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "flex w-full px-4 relative group",
            isOwnMessage ? "justify-end" : "justify-start",
            isSequence ? "mt-0.5" : "mt-6"
        )}>
            {!isOwnMessage && !isSequence && (
                <div className="mr-3 shrink-0">
                    <Avatar className="h-8 w-8 border border-zinc-100 dark:border-white/5 shadow-sm">
                        <AvatarImage src={message.sender?.avatar_url} />
                        <AvatarFallback className={cn("text-[9px] font-black text-white uppercase", getAvatarColor(message.sender_id))}>
                            {getInitials(message.sender?.display_name || 'Team Member')}
                        </AvatarFallback>
                    </Avatar>
                </div>
            )}
            {/* If sequence but not own, add spacer */}
            {!isOwnMessage && isSequence && <div className="w-11 shrink-0" />}

            <div className={cn("max-w-[70%] flex flex-col", isOwnMessage ? "items-end" : "items-start")}>
                {!isSequence && !isOwnMessage && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-300">
                            {message.sender?.display_name || 'Team Member'}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-400">{formatTime(message.created_at)}</span>
                    </div>
                )}

                <ContextMenu>
                    <ContextMenuTrigger className="w-full">
                        <div className={cn(
                            "px-4 py-2.5 text-sm font-medium leading-[1.5] shadow-sm select-none",
                            isOwnMessage 
                                ? "bg-purple-600 text-white rounded-2xl rounded-tr-none" 
                                : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 text-zinc-900 dark:text-zinc-100 rounded-2xl rounded-tl-none",
                            isSequence && (isOwnMessage ? "rounded-tr-2xl" : "rounded-tl-2xl")
                        )}>
                            {/* Attachments UI */}
                            {attachmentUrl && (
                                <div className="mb-2 space-y-2">
                                    {attachmentType === 'image' ? (
                                        <div className="rounded-xl overflow-hidden cursor-pointer shadow-sm border border-black/5" onClick={() => window.open(attachmentUrl, '_blank')}>
                                            <img src={attachmentUrl} alt={attachmentName} className="max-w-xs h-auto max-h-64 object-cover" />
                                        </div>
                                    ) : (
                                        <div className={cn(
                                            "flex items-center gap-3 p-2.5 rounded-xl border transition-colors",
                                            isOwnMessage ? "bg-white/10 border-white/10 hover:bg-white/15" : "bg-zinc-50 dark:bg-black/20 border-zinc-100 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-black/30"
                                        )}>
                                            <div className="h-10 w-10 shrink-0 bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="text-[12px] font-black truncate leading-tight uppercase tracking-tight">{attachmentName}</p>
                                                <p className="text-[10px] opacity-70 mt-1 uppercase font-bold tracking-tighter">{formatFileSize((message as any).attachment_size || 0)}</p>
                                            </div>
                                            <button onClick={() => downloadFile(attachmentUrl, attachmentName)} className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-transform active:scale-90">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isEditing ? (
                                <div className="min-w-[200px] space-y-2 py-1">
                                    <textarea 
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none font-medium p-0"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                                        <button onClick={() => setIsEditing(false)} className="text-[10px] uppercase font-black px-2 py-1 opacity-70">Cancel</button>
                                        <button onClick={() => { onEdit?.(message.id, editContent); setIsEditing(false); }} className="text-[10px] uppercase font-black px-3 py-1 bg-white/10 rounded-lg">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                            )}
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-2xl">
                        <ContextMenuItem onClick={() => onReply?.()} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5">
                            <Reply className="w-4 h-4 text-zinc-400" /> <span className="text-xs font-bold">Reply</span>
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => { navigator.clipboard.writeText(message.content); toast.success('Copied'); }} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5">
                            <Copy className="w-4 h-4 text-zinc-400" /> <span className="text-xs font-bold">Copy text</span>
                        </ContextMenuItem>
                        {isOwnMessage && (
                            <ContextMenuItem onClick={() => setIsEditing(true)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5">
                                <span className="text-xs font-bold pl-7">Edit message</span>
                            </ContextMenuItem>
                        )}
                        <div className="h-px bg-zinc-100 dark:bg-white/5 my-1 mx-2" />
                        {isOwnMessage && (
                            <ContextMenuItem onClick={() => onDelete?.(message.id)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/10 text-rose-500">
                                <Trash2 className="w-4 h-4" /> <span className="text-xs font-bold">Delete</span>
                            </ContextMenuItem>
                        )}
                    </ContextMenuContent>
                </ContextMenu>

                {/* Reactions Display */}
                {(message as any).reactions && (message as any).reactions.length > 0 && (
                    <div className={cn("flex flex-wrap gap-1 mt-1", isOwnMessage ? "justify-end mr-1" : "justify-start ml-1")}>
                        {Object.entries((message as any).reactions.reduce((acc: any, r: any) => {
                            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                            return acc;
                        }, {})).map(([emoji, count]: [string, any]) => (
                            <button key={emoji} onClick={() => onReact?.(message.id, emoji)} className="px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-[11px] font-bold flex items-center gap-1 active:scale-90 transition-all">
                                <span>{emoji}</span>
                                {count > 1 && <span className="opacity-60">{count}</span>}
                            </button>
                        ))}
                    </div>
                )}

                {/* Status Bar */}
                {isOwnMessage && (
                    <div className="h-4 mt-1 flex items-center gap-1.5 px-0.5 select-none transition-opacity opacity-0 group-hover:opacity-100">
                        <span className="text-[10px] font-bold text-zinc-400">{formatTime(message.created_at)}</span>
                        <StatusIcon />
                    </div>
                )}
            </div>

            {/* Hover Actions Bar (Simple) */}
            <div className={cn(
                "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-sm rounded-lg flex items-center p-1 z-10",
                isOwnMessage ? "right-full mr-2" : "left-full ml-2"
            )}>
                <button onClick={() => onReply?.()} className="p-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white"><Reply className="w-3.5 h-3.5" /></button>
                <button onClick={() => setShowReactionPicker(!showReactionPicker)} className="p-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white"><Smile className="w-3.5 h-3.5" /></button>
            </div>

            {showReactionPicker && (
                <div className={cn("absolute bottom-full mb-2 z-20 flex gap-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-xl shadow-2xl", isOwnMessage ? "right-4" : "left-4")}>
                    {['👍', '❤️', '😂', '🔥', '🚀'].map(e => <button key={e} onClick={() => { onReact?.(message.id, e); setShowReactionPicker(false); }} className="p-1.5 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-lg text-lg transition-transform hover:scale-125">{e}</button>)}
                </div>
            )}
        </div>
    );
};
