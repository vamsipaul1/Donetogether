import { motion, AnimatePresence } from 'framer-motion';
import { MessageWithSender } from '@/types/database';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/lib/avatarUtils';
import { Check, CheckCheck, Clock, FileText, Download, Reply, Smile, Copy, Trash2, Image as ImageIcon, ExternalLink } from 'lucide-react';
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

    // Close reaction picker when clicking outside
    useEffect(() => {
        if (showReactionPicker) {
            const handleClickOutside = () => setShowReactionPicker(false);
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showReactionPicker]);

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

    // Check for actual attachment data from database (new format)
    const hasNewAttachment = !!(message as any).attachment_url;

    // Also check for old text-based format: [Attachment: filename (size)]
    const oldAttachmentMatch = message.content?.match(/^\[Attachment: (.*?) \((.*?)\)\](?:\s*\n(.*))?$/s);

    let attachmentData = null;
    let contentDisplay = message.content;

    if (hasNewAttachment) {
        // New database format
        attachmentData = {
            url: (message as any).attachment_url,
            name: (message as any).attachment_name || 'File',
            size: (message as any).attachment_size || 0,
            type: (message as any).attachment_type || 'document'
        };
    } else if (oldAttachmentMatch) {
        // Old text-based format - parse it and create a clean display
        const fileName = oldAttachmentMatch[1];
        const fileSize = oldAttachmentMatch[2];
        contentDisplay = oldAttachmentMatch[3] || '';

        // Determine file type from extension
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(fileName);
        const isPdf = /\.pdf$/i.test(fileName);
        const isDoc = /\.(doc|docx)$/i.test(fileName);
        const isSpreadsheet = /\.(xls|xlsx|csv)$/i.test(fileName);
        const isPresentation = /\.(ppt|pptx)$/i.test(fileName);

        let fileType = 'document';
        if (isImage) fileType = 'image';
        else if (isPdf || isDoc || isSpreadsheet || isPresentation) fileType = 'document';

        // Convert size string to bytes (approximate)
        const sizeMatch = fileSize.match(/([\d.]+)\s*(KB|MB|GB|Bytes?)/i);
        let sizeInBytes = 0;
        if (sizeMatch) {
            const num = parseFloat(sizeMatch[1]);
            const unit = sizeMatch[2].toUpperCase();
            if (unit.startsWith('KB')) sizeInBytes = num * 1024;
            else if (unit.startsWith('MB')) sizeInBytes = num * 1024 * 1024;
            else if (unit.startsWith('GB')) sizeInBytes = num * 1024 * 1024 * 1024;
            else sizeInBytes = num;
        }

        attachmentData = {
            url: '#', // No real URL for old format
            name: fileName,
            size: sizeInBytes,
            type: fileType,
            isLegacy: true // Mark as legacy format
        };
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

    const handleEdit = () => {
        if (onEdit && isOwnMessage) {
            setIsEditing(true);
        }
    };

    const handleSaveEdit = () => {
        if (onEdit && editContent.trim()) {
            onEdit(message.id, editContent);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditContent(message.content);
        setIsEditing(false);
    };

    const handleReact = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setShowReactionPicker(!showReactionPicker);
    };

    const handleEmojiSelect = (emoji: string) => {
        const reactions = (message as any).reactions || [];
        const userReacted = reactions.some((r: any) => r.user_id === currentUserId && r.emoji === emoji);

        if (userReacted) {
            onRemoveReaction?.(message.id, emoji);
        } else if (onReact) {
            onReact(message.id, emoji);
        }
        setShowReactionPicker(false);
    };

    const handleDelete = () => {
        if (onDelete && isOwnMessage) {
            if (confirm('Are you sure you want to delete this message?')) {
                onDelete(message.id);
            }
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
                        <Avatar className="h-9 w-9 shadow-sm transition-transform hover:scale-110 active:scale-95 border-2 border-white dark:border-zinc-900">
                            <AvatarImage src={message.sender?.avatar_url} />
                            <AvatarFallback className={cn(
                                "text-[10px] font-black text-white",
                                getAvatarColor(message.sender_id)
                            )}>
                                {getInitials(message.sender?.display_name || 'Team Member')}
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
                    <div className="flex items-center gap-2 mb-1 ml-1">
                        <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase">
                            {message.sender?.display_name || 'Team Member'}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 opacity-70">
                            {formatTime(message.created_at)}
                        </span>
                    </div>
                )}

                <ContextMenu>
                    <ContextMenuTrigger>
                        <motion.div
                            whileHover={{ scale: 1.002 }}
                            className={cn(
                                "relative px-4 py-2.5 rounded-[22px] text-[14px] md:text-[15px] font-medium leading-[1.6] transition-all flex flex-col gap-2",
                                isOwnMessage
                                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-tr-none shadow-md"
                                    : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-tl-none shadow-sm"
                            )}
                        >
                            {/* Depth Effect for Own Messages */}
                            {isOwnMessage && (
                                <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-tr from-white/15 to-transparent pointer-events-none" />
                            )}
                            {/* Attachment Card - Clean Icon-Based Design */}
                            {attachmentData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-2"
                                >
                                    {/* Image Preview - Full Width with Rounded Corners */}
                                    {attachmentData.type === 'image' && !attachmentData.isLegacy && (
                                        <div
                                            className="relative group cursor-pointer rounded-2xl overflow-hidden mb-2 shadow-lg"
                                            onClick={() => window.open(attachmentData.url, '_blank')}
                                        >
                                            <img
                                                src={attachmentData.url}
                                                alt={attachmentData.name}
                                                className="w-full max-w-xs h-auto max-h-96 object-cover"
                                                loading="lazy"
                                            />
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="absolute bottom-3 right-3 flex gap-2">
                                                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                                                        <ExternalLink className="h-4 w-4 text-zinc-900" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Card - Compact Design with Icon */}
                                    <div className={cn(
                                        "group flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border",
                                        isOwnMessage
                                            ? "bg-white/10 hover:bg-white/15 border-white/20 hover:border-white/30"
                                            : "bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border-zinc-200/60 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600"
                                    )}>
                                        {/* File Type Icon */}
                                        <div className={cn(
                                            "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                            attachmentData.type === 'image'
                                                ? (isOwnMessage ? "bg-purple-500/20 text-purple-300" : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400")
                                                : attachmentData.name.endsWith('.pdf')
                                                    ? (isOwnMessage ? "bg-red-500/20 text-red-300" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400")
                                                    : attachmentData.name.match(/\.(doc|docx)$/)
                                                        ? (isOwnMessage ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400")
                                                        : attachmentData.name.match(/\.(xls|xlsx)$/)
                                                            ? (isOwnMessage ? "bg-green-500/20 text-green-300" : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400")
                                                            : (isOwnMessage ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400")
                                        )}>
                                            {attachmentData.type === 'image' ? (
                                                <ImageIcon className="h-5 w-5" strokeWidth={2.5} />
                                            ) : attachmentData.name.endsWith('.pdf') ? (
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                </svg>
                                            ) : attachmentData.name.match(/\.(doc|docx)$/) ? (
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                                    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                                </svg>
                                            ) : (
                                                <FileText className="h-5 w-5" strokeWidth={2.5} />
                                            )}
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "font-semibold text-sm truncate leading-tight",
                                                isOwnMessage ? "text-white" : "text-zinc-900 dark:text-zinc-100"
                                            )}>
                                                {attachmentData.name}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className={cn(
                                                    "text-xs font-medium",
                                                    isOwnMessage ? "text-white/70" : "text-zinc-500 dark:text-zinc-400"
                                                )}>
                                                    {formatFileSize(attachmentData.size)}
                                                </p>
                                                <span className={cn(
                                                    "text-xs",
                                                    isOwnMessage ? "text-white/50" : "text-zinc-400"
                                                )}>•</span>
                                                <p className={cn(
                                                    "text-xs font-medium uppercase",
                                                    isOwnMessage ? "text-white/70" : "text-zinc-500 dark:text-zinc-400"
                                                )}>
                                                    {attachmentData.name.split('.').pop()?.toUpperCase() || 'FILE'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Download Button */}
                                        {!attachmentData.isLegacy && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadFile(attachmentData.url, attachmentData.name);
                                                }}
                                                className={cn(
                                                    "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95",
                                                    isOwnMessage
                                                        ? "hover:bg-white/20 text-white"
                                                        : "hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                                )}
                                                title="Download file"
                                            >
                                                <Download className="h-4.5 w-4.5" strokeWidth={2.5} />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Replied Message Preview */}
                            {(message as any).replied_message && (
                                <div className={cn(
                                    "mb-2 pl-3 border-l-4 rounded-r-lg p-2 cursor-pointer transition-all hover:scale-[1.02]",
                                    isOwnMessage
                                        ? "border-white/50 bg-white/10 hover:bg-white/15"
                                        : "border-emerald-500 bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/50"
                                )}>
                                    <div className={cn(
                                        "text-xs font-black",
                                        isOwnMessage
                                            ? "text-white/80"
                                            : "text-emerald-600 dark:text-emerald-400"
                                    )}>
                                        {(message as any).replied_message.sender?.display_name || 'Someone'}
                                    </div>
                                    <div className={cn(
                                        "text-sm truncate mt-0.5",
                                        isOwnMessage
                                            ? "text-white/70"
                                            : "text-zinc-600 dark:text-zinc-400"
                                    )}>
                                        {(message as any).replied_message.content || '📎 Attachment'}
                                    </div>
                                </div>
                            )}

                            {/* Text Content or Edit Mode */}
                            {isEditing ? (
                                <div className="w-full space-y-2">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className={cn(
                                            "w-full min-h-[60px] p-3 rounded-lg resize-none font-medium text-sm",
                                            "border-2 focus:outline-none focus:ring-2",
                                            isOwnMessage
                                                ? "bg-white/20 border-white/30 focus:border-white/50 focus:ring-white/20 text-white placeholder-white/50"
                                                : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-100"
                                        )}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSaveEdit();
                                            }
                                            if (e.key === 'Escape') {
                                                handleCancelEdit();
                                            }
                                        }}
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={handleCancelEdit}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                                isOwnMessage
                                                    ? "bg-white/10 hover:bg-white/20 text-white"
                                                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                                            )}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveEdit}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                contentDisplay && (
                                    <div className="font-medium select-text">
                                        {renderContent(contentDisplay)}
                                    </div>
                                )
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
                    <ContextMenuContent className="w-64 p-2 rounded-[2rem] bg-white/90 dark:bg-zinc-900/95 backdrop-blur-3xl border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-300">
                        <ContextMenuItem
                            onClick={handleReply}
                            className="gap-3 px-4 py-3.5 text-sm font-black rounded-[1.2rem] hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-all active:scale-95"
                        >
                            <Reply className="w-4 h-4" /> Reply
                        </ContextMenuItem>
                        <ContextMenuItem
                            onClick={handleCopy}
                            className="gap-3 px-4 py-3.5 text-sm font-black rounded-[1.2rem] hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all active:scale-95"
                        >
                            <Copy className="w-4 h-4" /> Copy
                        </ContextMenuItem>
                        {isOwnMessage && (
                            <ContextMenuItem
                                onClick={handleEdit}
                                className="gap-3 px-4 py-3.5 text-sm font-black rounded-[1.2rem] hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-all active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </ContextMenuItem>
                        )}
                        <ContextMenuItem
                            onClick={handleReact}
                            className="gap-3 px-4 py-3.5 text-sm font-black rounded-[1.2rem] hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-all active:scale-95"
                        >
                            <Smile className="w-4 h-4" /> React
                        </ContextMenuItem>

                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-3" />

                        {isOwnMessage && (
                            <ContextMenuItem
                                onClick={handleDelete}
                                className="gap-3 px-4 py-3.5 text-sm font-black text-red-500 rounded-[1.2rem] hover:bg-red-500/10 cursor-pointer transition-all active:scale-95"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </ContextMenuItem>
                        )}
                    </ContextMenuContent>
                </ContextMenu>

                {/* Emoji Reaction Picker */}
                {showReactionPicker && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "absolute z-20 mt-2 p-2 rounded-xl shadow-2xl border backdrop-blur-md",
                            "bg-white/95 dark:bg-zinc-900/95 border-zinc-200 dark:border-zinc-700",
                            isOwnMessage ? "right-0" : "left-0"
                        )}
                    >
                        <div className="flex gap-1">
                            {['👍', '❤️', '😂', '🎉', '🔥', '👏', '🚀', '✨'].map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleEmojiSelect(emoji)}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all hover:scale-125 text-xl"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Reactions Display - Modern Tactile Design */}
                {(message as any).reactions && (message as any).reactions.length > 0 && (
                    <div className={cn(
                        "absolute -bottom-2.5 flex flex-wrap gap-1 z-10",
                        isOwnMessage ? "right-1" : "left-1"
                    )}>
                        {Object.entries(
                            (message as any).reactions.reduce((acc: Record<string, any[]>, reaction: any) => {
                                if (!acc[reaction.emoji]) acc[reaction.emoji] = [];
                                acc[reaction.emoji].push(reaction);
                                return acc;
                            }, {})
                        ).map(([emoji, reactions]: [string, any[]]) => {
                            const userReacted = reactions.some((r) => r.user_id === currentUserId);
                            return (
                                <motion.button
                                    key={emoji}
                                    initial={{ scale: 0, y: 5 }}
                                    animate={{ scale: 1, y: 0 }}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (userReacted) {
                                            onRemoveReaction?.(message.id, emoji);
                                        } else {
                                            onReact?.(message.id, emoji);
                                        }
                                    }}
                                    className={cn(
                                        "px-2 py-0.5 rounded-full text-sm font-semibold flex items-center gap-1 transition-all shadow-md border-2",
                                        userReacted
                                            ? "bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                            : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                                    )}
                                    title={reactions.map(r => r.user?.display_name || 'Partner').join(', ')}
                                >
                                    <span>{emoji}</span>
                                    {reactions.length > 1 && (
                                        <span className="text-[10px] font-bold">{reactions.length}</span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                )}

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
