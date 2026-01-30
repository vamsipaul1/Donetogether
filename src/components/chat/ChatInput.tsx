import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile, Image as ImageIcon, Mic, Plus, FileText, X, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    isLoading?: boolean;
    projectId?: string;
}

// Simple curated emoji list to avoid large deps
const EMOJIS = ["👍", "👋", "🔥", "❤️", "😂", "😮", "😢", "😡", "🎉", "👀", "🚀", "💯", "✅", "✨", "🤔", "🙌", "💀", "💩", "🥳", "🤖", "👻", "🎃", "💪", "🙏", "🤝", "💅", "🎈", "🎂", "🎁", "🏆", "🥇", "⭐", "🌟", "💡", "💣", "💤", "💬", "📅", "📎", "📌"];

export const ChatInput = ({ onSendMessage, isLoading, projectId }: ChatInputProps) => {
    const [message, setMessage] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [attachment, setAttachment] = useState<{ name: string; type: 'image' | 'file'; size: string } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if ((!message.trim() && !attachment) || isLoading) return;

        // Mock sending logic - in real app, separate file upload
        let fullMessage = message;
        if (attachment) {
            fullMessage = `[Attachment: ${attachment.name} (${attachment.size})] \n${message}`;
        }

        console.log('🚀 ChatInput: Sending message:', fullMessage);
        onSendMessage(fullMessage);
        setMessage('');
        setAttachment(null);
        setShowTaskSuggestions(false);
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

        // Remove the partial # query and insert task mention using task_number
        const beforeWithoutHash = textBeforeCursor.replace(/#(\w*)$/, '');
        const taskNum = task.task_number || task.id;
        const newMessage = `${beforeWithoutHash}#${taskNum} ${textAfterCursor}`;

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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File is too large. Maximum size is 10MB.');
            return;
        }

        // Validate file type
        if (type === 'image') {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(file.type)) {
                alert('Invalid image type. Please upload JPEG, PNG, GIF, or WebP.');
                return;
            }
        }

        setAttachment({
            name: file.name,
            type: type,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
        });

        // TODO: Upload to Supabase Storage
        // const { data, error } = await supabase.storage
        //     .from('chat-files')
        //     .upload(`${projectId}/${Date.now()}-${file.name}`, file);
    };

    return (
        <div className="relative px-4 pb-6 pt-2 bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black dark:to-transparent z-20 font-sans">

            {/* Task Suggestions Dropdown */}
            {showTaskSuggestions && taskSuggestions.length > 0 && (
                <div className="absolute bottom-full left-4 right-4 mb-2 max-w-5xl mx-auto">
                    <div className="bg-white dark:bg-zinc-900 border-2 border-purple-500/50 dark:border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden backdrop-blur-xl">
                        <div className="px-4 py-2.5 bg-purple-50 dark:bg-purple-950/30 border-b border-purple-200 dark:border-purple-900/50 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                Project Tasks {taskQuery && `• Searching "${taskQuery}"`}
                            </span>
                            <span className="ml-auto text-[10px] font-bold text-purple-500">
                                {taskSuggestions.length} {taskSuggestions.length === 1 ? 'task' : 'tasks'}
                            </span>
                        </div>
                        <ScrollArea className="max-h-64">
                            <div className="p-2 space-y-1">
                                {taskSuggestions.map((task) => (
                                    <button
                                        key={task.id}
                                        onClick={() => insertTaskMention(task)}
                                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all group text-left border border-transparent hover:border-purple-200 dark:hover:border-purple-900/50"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs shadow-sm transition-transform group-hover:scale-105",
                                            task.status === 'done' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" :
                                                task.status === 'in-progress' ? "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" :
                                                    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                        )}>
                                            #{task.task_number || task.id}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight line-clamp-1">
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2 py-1 rounded-md",
                                                    task.status === 'done' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" :
                                                        task.status === 'in-progress' ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" :
                                                            "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                )}>
                                                    {task.status?.replace('-', ' ').toUpperCase() || 'TODO'}
                                                </span>
                                                {task.priority && (
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2 py-1 rounded-md",
                                                        task.priority === 'high' ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" :
                                                            task.priority === 'medium' ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" :
                                                                "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                                                    )}>
                                                        {task.priority.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                                                <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/30 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500">
                                💡 Click to insert task reference
                            </p>
                            <p className="text-[10px] font-semibold text-zinc-400">
                                Press ESC to close
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Attachment Preview */}
            {attachment && (
                <div className="absolute -top-12 left-6 bg-white dark:bg-zinc-800 border dark:border-zinc-700 p-2 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-2">
                    <div className="h-8 w-8 bg-zinc-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-500">
                        {attachment.type === 'image' ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div className="mr-2">
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200 truncate max-w-[150px]">{attachment.name}</p>
                        <p className="text-[10px] text-zinc-400">{attachment.size}</p>
                    </div>
                    <button onClick={() => setAttachment(null)} className="h-5 w-5 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center">
                        <X className="h-3 w-3 text-zinc-500" />
                    </button>
                </div>
            )}

            <div
                className={cn(
                    "relative flex items-end gap-2 max-w-5xl mx-auto rounded-[24px] p-2 transition-all duration-300 border",
                    isFocused
                        ? "bg-white dark:bg-zinc-900 border-emerald-500/30 shadow-2xl shadow-emerald-500/10 ring-4 ring-emerald-500/5"
                        : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-lg"
                )}
            >
                {/* Plus / Attach Actions */}
                <div className="flex items-center gap-1 pb-1 pl-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-9 w-9 rounded-full transition-all duration-300",
                                    isFocused ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                )}
                            >
                                <Plus className={cn("h-5 w-5 transition-transform duration-300", isFocused ? "rotate-90" : "")} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" align="start" className="w-48 p-2 rounded-2xl shadow-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <input type="file" ref={fileInputRef} accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt" className="hidden" onChange={(e) => handleFileSelect(e, 'file')} />
                            <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
                            <div className="grid gap-1">
                                <Button onClick={() => document.getElementById('image-upload')?.click()} variant="ghost" className="justify-start gap-2 h-9 rounded-xl text-sm font-medium hover:bg-black dark:hover:bg-zinc-800 text-black dark:text-white">
                                    <ImageIcon className="h-4 w-4 text-purple-500" /> Photos & Videos
                                </Button>
                                <Button onClick={() => fileInputRef.current?.click()} variant="ghost" className="justify-start gap-2 h-9 rounded-xl text-sm font-medium hover:bg-black dark:hover:bg-zinc-800 text-black dark:text-white">
                                    <Paperclip className="h-4 w-4 text-blue-500" /> Document
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Text Area */}
                <div className="flex-1 min-w-0 h-10 py-1.5">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Message Project Team..."
                        rows={1}
                        className="w-full bg-transparent border-0 focus:ring-0 p-0 text-[15px] font-medium leading-relaxed max-h-[150px] resize-none placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder:select-none"
                        style={{ minHeight: '24px', outline: 'none' }}
                    />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 pb-1 pr-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 rounded-full hidden sm:flex transition-colors">
                                <Smile className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="top" align="end" className="w-64 p-3 rounded-2xl shadow-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-400 mb-2 uppercase tracking-wide">Favorites</h4>
                            <ScrollArea className="h-48">
                                <div className="grid grid-cols-5 gap-1">
                                    {EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => addEmoji(emoji)}
                                            className="h-8 w-8 flex items-center justify-center text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>

                    <Button
                        onClick={handleSend}
                        disabled={(!message.trim() && !attachment) || isLoading}
                        className={cn(
                            "h-9 w-9 rounded-full transition-all duration-300 flex items-center justify-center p-0 shadow-lg",
                            (message.trim() || attachment)
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white scale-100 hover:scale-105 hover:shadow-emerald-500/25"
                                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 scale-90 opacity-70 cursor-not-allowed"
                        )}
                    >
                        <Send className={cn("h-4 w-4 ml-0.5", (message.trim() || attachment) ? "fill-current" : "")} />
                    </Button>
                </div>
            </div>

            {/* Enter hint */}
            <div className={cn(
                "absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-0.5 rounded-full transition-all duration-300 pointer-events-none",
                isFocused ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}>
                Hit Enter to send
            </div>
        </div>
    );
};
