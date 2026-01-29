import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
    onSendMessage: (content: string) => void;
    isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!message.trim() || isLoading) return;
        onSendMessage(message);
        setMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
    };

    return (
        <div className="p-4 border-t border-border bg-white dark:bg-black">
            <div className="flex items-end gap-2 max-w-5xl mx-auto bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded-3xl transition-all focus-within:ring-2 focus-within:ring-emerald-500/20">
                {/* Attachment Actions */}
                <div className="flex items-center gap-1 pb-1 pl-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hidden sm:flex">
                        <ImageIcon className="h-5 w-5" />
                    </Button>
                </div>

                {/* Text Area */}
                <div className="flex-1 min-w-0 py-2">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a reply..."
                        rows={1}
                        className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm max-h-[150px] resize-none placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100"
                        style={{ minHeight: '20px' }}
                    />
                </div>

                {/* Actions & Send */}
                <div className="flex items-center gap-2 pb-1 pr-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hidden sm:flex">
                        <Smile className="h-5 w-5" />
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={!message.trim() || isLoading}
                        className={cn(
                            "h-9 px-4 rounded-full transition-all duration-200",
                            message.trim()
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transform active:scale-95"
                                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed"
                        )}
                    >
                        <span className="font-semibold text-xs mr-1 hidden sm:inline">Send</span>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Helper text for 'Enter to send' */}
            <div className="text-[10px] text-center mt-2 text-zinc-400 hidden sm:block">
                Press Enter to send, Shift + Enter for new line
            </div>
        </div>
    );
};
