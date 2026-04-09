import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile, Image as ImageIcon, Mic, MicOff, Plus, FileText, X, CheckSquare, Loader2, Reply, ArrowRight } from 'lucide-react';
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
    const [isListening, setIsListening] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<any>(null);
    const recognitionRef = useRef<any>(null);
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

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Voice recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setMessage(transcript);
            
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
            }
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const fileName = `voice-${Date.now()}.webm`;
                const file = new File([audioBlob], fileName, { type: 'audio/webm' });
                
                setIsUploading(true);
                toast.loading('Sending voice message...', { id: 'voice-upload' });
                try {
                    const uploadResult = await uploadFile(file, 'chat-files', projectId);
                    onSendMessage('', uploadResult, replyTo?.id); // Direct send for voice
                    toast.success('Voice message sent', { id: 'voice-upload' });
                } catch (err) {
                    toast.error("Failed to send voice message", { id: 'voice-upload' });
                } finally {
                    setIsUploading(false);
                }
                
                stream.getTracks().forEach(t => t.stop());
            };

            recorder.start();
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            toast.error("Microphone access denied");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <div className="relative px-8 pb-8 pt-2 z-40">
            <div className="max-w-4xl mx-auto relative group">
                
                {/* Task Suggestions Popup */}
                {showTaskSuggestions && taskSuggestions.length > 0 && (
                    <div className="absolute bottom-full mb-4 left-0 bg-white border border-indigo-100 rounded-[32px] shadow-[0_32px_96px_-16px_rgba(79,70,229,0.15)] w-80 overflow-hidden z-50 flex flex-col">
                        <div className="p-3 bg-indigo-50/50 border-b border-indigo-100/50 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center justify-between">
                            <span>Link Task Mention</span>
                            <span className="text-[9px] bg-indigo-100 px-1.5 rounded text-indigo-500">ESC</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                            {taskSuggestions.map((task) => (
                                <button
                                    key={task.id}
                                    onClick={() => insertTaskMention(task)}
                                    className="w-full text-left px-4 py-3 rounded-2xl transition-all flex items-start gap-3 hover:bg-indigo-50/50 group"
                                >
                                    <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[10px] font-black text-indigo-600 group-hover:scale-110 transition-all font-satoshi">
                                        #{task.task_number || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-bold text-indigo-950 truncate mb-0.5 font-satoshi">
                                            {task.title}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Unified Input Bar - Clean State-of-the-art look exactly like image */}
                <div className={cn(
                    "flex items-center gap-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-white/5 py-5 px-2",
                    isFocused ? "opacity-100" : "opacity-90"
                )}>
                    {/* Input Area */}
                    <div className="flex-1 flex items-center">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="SEND A MESSAGE"
                            className="w-full bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none p-0 text-[13px] font-black tracking-[0.2em] placeholder:text-indigo-200 text-indigo-950 dark:text-white dark:placeholder:text-zinc-700 font-body uppercase resize-none"
                            rows={1}
                        />
                    </div>

                    {/* Action Tools */}
                    <div className="flex items-center gap-1">
                         <button 
                            className="h-10 w-10 rounded-full flex items-center justify-center text-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => imageInputRef.current?.click()}
                         >
                            <ImageIcon className="w-5 h-5" />
                        </button>
                        
                        {(message.trim() || uploadedFile) && (
                            <button
                                onClick={handleSend}
                                className="h-10 w-10 flex items-center justify-center text-indigo-600 transition-all hover:scale-110"
                            >
                                <ArrowRight className="w-5 h-5" strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};
