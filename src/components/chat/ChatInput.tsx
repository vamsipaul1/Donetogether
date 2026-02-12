import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile, Image as ImageIcon, Mic, Plus, FileText, X, CheckSquare, Loader2, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { uploadFile, formatFileSize, FileUploadResult } from '@/lib/fileUpload';
import { toast } from 'sonner';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatInputProps {
    onSendMessage: (content: string, attachmentData?: FileUploadResult, replyToId?: string) => void;
    isLoading?: boolean;
    projectId?: string;
    replyTo?: any;
    setReplyTo?: (msg: any) => void;
}

// Simple curated emoji list to avoid large deps
const EMOJIS = ["👍", "👋", "🔥", "❤️", "😂", "😮", "😢", "😡", "🎉", "👀", "🚀", "💯", "✅", "✨", "🤔", "🙌", "💀", "💩", "🥳", "🤖", "👻", "🎃", "💪", "🙏", "🤝", "💅", "🎈", "🎂", "🎁", "🏆", "🥇", "⭐", "🌟", "💡", "💣", "💤", "💬", "📅", "📎", "📌"];

export const ChatInput = ({ onSendMessage, isLoading, projectId, replyTo, setReplyTo }: ChatInputProps) => {
    const [message, setMessage] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<FileUploadResult | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Task autocomplete state
    const [showTaskSuggestions, setShowTaskSuggestions] = useState(false);
    const [taskSuggestions, setTaskSuggestions] = useState<any[]>([]);
    const [taskQuery, setTaskQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);

    // Fetch tasks when # is typed
    useEffect(() => {
        if (!projectId || !showTaskSuggestions) return;

        const fetchTasks = async () => {
            try {
                const { data, error } = await supabase
                    .from('tasks')
                    .select('id, task_number, title, status, priority')
                    .eq('project_id', projectId)
                    .order('task_number', { ascending: false })
                    .limit(10);

                if (error) throw error;

                // Filter by query if exists
                let filtered = data || [];
                if (taskQuery) {
                    filtered = filtered.filter(task =>
                        task.title.toLowerCase().includes(taskQuery.toLowerCase()) ||
                        task.task_number?.toString().includes(taskQuery)
                    );
                }

                setTaskSuggestions(filtered);
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            }
        };

        fetchTasks();
    }, [projectId, showTaskSuggestions, taskQuery]);

    const handleSend = () => {
        if ((!message.trim() && !uploadedFile) || isLoading || isUploading) return;

        console.log('🚀 ChatInput: Sending message:', {
            text: message,
            hasAttachment: !!uploadedFile,
            attachment: uploadedFile,
            replyToId: replyTo?.id
        });

        // Send message with optional attachment data and reply ID
        onSendMessage(message, uploadedFile || undefined, replyTo?.id);

        // Clear state
        setMessage('');
        setUploadedFile(null);
        setShowTaskSuggestions(false);
        if (setReplyTo) setReplyTo(null); // Clear reply context
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !showTaskSuggestions) {
            e.preventDefault();
            handleSend();
        }

        // Navigate task suggestions with arrow keys
        if (showTaskSuggestions) {
            if (e.key === 'Escape') {
                setShowTaskSuggestions(false);
            }
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart || 0;
        setMessage(value);
        setCursorPosition(cursorPos);

        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;

        // Detect # for task mentions
        const textBeforeCursor = value.substring(0, cursorPos);
        const hashMatch = textBeforeCursor.match(/#(\w*)$/);

        if (hashMatch) {
            setShowTaskSuggestions(true);
            setTaskQuery(hashMatch[1] || '');
        } else {
            setShowTaskSuggestions(false);
            setTaskQuery('');
        }
    };

    const insertTaskMention = (task: any) => {
        const textBeforeCursor = message.substring(0, cursorPosition);
        const textAfterCursor = message.substring(cursorPosition);

        // Remove the partial # query and insert task mention using task title for visibility
        // User requested "task text can be visible, not id"
        const beforeWithoutHash = textBeforeCursor.replace(/#(\w*)$/, '');

        // Use title formatted as hashtag (spaces to dashes)
        const taskLabel = task.title.trim().replace(/\s+/g, '-');

        // If title is empty/missing, fall back to number/id
        const finalLabel = taskLabel || task.task_number || task.id;

        const newMessage = `${beforeWithoutHash}#${finalLabel} ${textAfterCursor}`;

        setMessage(newMessage);
        setShowTaskSuggestions(false);
        setTaskQuery('');

        // Focus back on textarea
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 0);
    };

    const addEmoji = (emoji: string) => {
        setMessage(prev => prev + emoji);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Clear the input so the same file can be selected again
        e.target.value = '';

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('File is too large. Maximum size is 50MB.');
            return;
        }

        // Show upload progress
        setIsUploading(true);
        toast.loading(`Uploading ${file.name}...`, { id: 'file-upload' });

        try {
            // Upload file to Supabase Storage
            const uploadResult = await uploadFile(file, 'chat-files', projectId);

            setUploadedFile(uploadResult);
            toast.success(`${file.name} uploaded successfully!`, { id: 'file-upload' });

            console.log('✅ File uploaded:', uploadResult);
        } catch (error: any) {
            console.error('❌ File upload error:', error);
            toast.error(`Upload failed: ${error.message}`, { id: 'file-upload' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-6 pt-2 z-40">
            <div className="max-w-5xl mx-auto relative">
                {/* Reply Context Bar */}
                {replyTo && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-2 px-1"
                    >
                        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-l-4 border-zinc-900 dark:border-zinc-600 rounded-r-xl shadow-sm">
                            <Reply className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                                    Replying to {replyTo.sender?.display_name || 'Partner'}
                                </div>
                                <div className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                                    {replyTo.content || '📎 Attachment'}
                                </div>
                            </div>
                            <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors">
                                <X className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Task Suggestions Popup */}
                {showTaskSuggestions && taskSuggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute bottom-full mb-3 left-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-80 overflow-hidden z-50 flex flex-col"
                    >
                        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Suggested Tasks</span>
                            <span className="text-[9px] bg-zinc-200 dark:bg-zinc-700 px-1.5 rounded text-zinc-500 dark:text-zinc-300">ESC to close</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                            {taskSuggestions.map((task, i) => (
                                <button
                                    key={task.id}
                                    onClick={() => insertTaskMention(task)}
                                    className={cn(
                                        "w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start gap-3 group",
                                        i === 0 ? "bg-zinc-50 dark:bg-zinc-800/60" : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    <div className="shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover:bg-white dark:group-hover:bg-zinc-700 group-hover:scale-105 transition-all">
                                        #{task.task_number || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate mb-0.5 transition-colors">
                                            {task.title}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                                                task.priority === 'high' ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                                                    task.priority === 'medium' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                                                        "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                            )}>
                                                {task.priority}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 capitalize">
                                                {task.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <CheckSquare className="w-3.5 h-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                    <div className="absolute -top-12 left-4 px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-700 flex items-center gap-2 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Uploading...</span>
                    </div>
                )}

                {/* Refined Minimal Input Capsule */}
                <div className={cn(
                    "flex items-end gap-3 p-1.5 px-3 rounded-[24px] transition-all duration-300 shadow-sm",
                    isFocused
                        ? "bg-white dark:bg-zinc-900 ring-2 ring-zinc-900/10 dark:ring-zinc-700/50"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/50"
                )}>
                    {/* Attach Button */}
                    <div className="pb-0.5">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="h-9 w-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="start" className="w-56 p-2 rounded-2xl shadow-xl border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300 text-left">
                                        <Paperclip className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                                        Files & Docs
                                    </button>
                                    <button onClick={() => imageInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300 text-left">
                                        <ImageIcon className="w-4 h-4 text-blue-500" />
                                        Photos
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                                <input type="file" ref={imageInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Main Input Area */}
                    <div className="flex-1 flex flex-col gap-1.5 py-1.5">
                        {uploadedFile && (
                            <div className="flex items-center gap-2 p-2 bg-emerald-50/50 dark:bg-zinc-800/50 rounded-xl border border-emerald-100/50 dark:border-zinc-700/50 w-fit">
                                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 truncate max-w-[150px]">{uploadedFile.name}</span>
                                <button onClick={() => setUploadedFile(null)} className="p-0.5 hover:bg-red-500/10 rounded-md text-zinc-400 hover:text-red-500 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none p-0 text-[15px] leading-relaxed max-h-32 resize-none placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-100"
                            rows={1}
                        />
                    </div>

                    {/* Emoji + Send */}
                    <div className="flex items-center gap-1 pb-0.5">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="h-9 w-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all">
                                    <Smile className="w-5 h-5" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="end" className="w-[280px] p-3 rounded-2xl shadow-2xl border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
                                <div className="grid grid-cols-7 gap-1">
                                    {EMOJIS.map(emoji => (
                                        <button key={emoji} onClick={() => addEmoji(emoji)} className="h-8 w-8 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <button
                            onClick={handleSend}
                            disabled={(!message.trim() && !uploadedFile) || isLoading || isUploading}
                            className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300",
                                (message.trim() || uploadedFile)
                                    ? "bg-zinc-900 text-white shadow-md hover:scale-110 active:scale-95 dark:bg-white dark:text-black"
                                    : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                            )}
                        >
                            <Send className={cn("w-4 h-4 ml-0.5", (message.trim() || uploadedFile) && "fill-current")} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
