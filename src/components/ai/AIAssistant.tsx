import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Copy, Check, ExternalLink, Layers, Zap, Calendar, Search, Music, Image as ImageIcon, History, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
}

const AIAssistant = ({
    isOpen,
    onClose,
    project,
    tasks,
    members,
    user
}: any) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'bot',
            content: `Hi! 👋\nHow can I help you today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const buildContext = () => {
        return {
            project: {
                id: project.id,
                name: project.title,
                goal: project.description,
                team_size: members.length
            },
            tasks: {
                total: tasks.length,
                done: tasks.filter((t: any) => t.status === 'completed').length,
                in_progress: tasks.filter((t: any) => t.status === 'in_progress').length
            },
            detailed_tasks: tasks.slice(0, 20).map((t: any) =>
                `- [${t.status.toUpperCase()}] ${t.title} (Priority: ${t.priority})`
            ).join('\n')
        };
    };

    const SYSTEM_INSTRUCTION = `
    You are ThinkSense AI. Your goal is to provide neat, clear, and concise answers.
    - Keep responses small to mid-size unless explicitly asked for details.
    - If the user asks for detailed explanation, then provide a comprehensive answer.
    - Be advanced, context-aware, and intelligent.
    - Do not use markdown headers (#) excessively, use bolding for emphasis.
    `;

    const sendMessage = async (text?: string) => {
        const contentToSend = typeof text === 'string' ? text : input;
        if (!contentToSend.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: contentToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const context = buildContext();
            const { data: { session } } = await supabase.auth.getSession();
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

            const response = await fetch(`${supabaseUrl}/functions/v1/quick-api`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    mode: 'task_assistant',
                    context,
                    prompt: `${SYSTEM_INSTRUCTION}\n\nUSER REQUEST: ${contentToSend}`
                })
            });

            const data = await response.json();

            setIsTyping(false);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: data.response || 'Sorry, I couldn\'t process that.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);

            // Save to History (Non-blocking)
            if (user?.id) {
                try {
                    await supabase.from('ai_logs').insert({
                        user_id: user.id,
                        project_id: project.id,
                        prompt: contentToSend,
                        response: data.response,
                        mode: 'task_assistant',
                        tokens_used: 0
                    });
                } catch (logError) {
                    console.error("Failed to save history:", logError);
                    // Do not show error to user if just logging fails
                }
            }

        } catch (error) {
            console.error("AI Error:", error);
            setIsTyping(false);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: 'Sorry, there was an error processing your request.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    // History Feature
    const [showHistory, setShowHistory] = useState(false);
    const [historyLogs, setHistoryLogs] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const fetchHistory = async () => {
        if (!user?.id) return;
        setIsLoadingHistory(true);
        const { data, error } = await supabase
            .from('ai_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (!error && data) {
            setHistoryLogs(data);
        }
        setIsLoadingHistory(false);
    };

    const loadHistoryItem = (log: any) => {
        setMessages([
            {
                id: 'history-start',
                role: 'bot',
                content: 'I loaded this from your history for you.',
                timestamp: new Date()
            },
            {
                id: `user-${log.id}`,
                role: 'user',
                content: log.prompt,
                timestamp: new Date(log.created_at)
            },
            {
                id: `bot-${log.id}`,
                role: 'bot',
                content: log.response,
                timestamp: new Date(log.created_at)
            }
        ]);
        setShowHistory(false);
    };

    useEffect(() => {
        if (showHistory) {
            fetchHistory();
        }
    }, [showHistory]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const popularIdeas = [
        {
            label: 'Contribute ideas',
            sub: 'Offer feedback & manage tasks',
            icon: Layers,
            prompt: 'How can I contribute to the project tasks effectively?',
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'from-orange-500/20 to-amber-500/20'
        },
        {
            label: 'Stay connected',
            sub: 'Align goals effortlessly',
            icon: Zap,
            prompt: 'Help me align with the team goals',
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'from-violet-500/20 to-fuchsia-500/20'
        },
        {
            label: 'Organize time',
            sub: 'Set clear priorities',
            icon: Calendar,
            prompt: 'Help me prioritize my current tasks',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'from-blue-500/20 to-cyan-500/20'
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full max-w-[900px] h-[85vh] max-h-[800px] bg-white dark:bg-[#0A0A0A] rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-white/50 dark:border-white/5 relative"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-4 md:px-8 py-6 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-zinc-900 dark:text-white" />
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">ThinkSense AI</span>
                        </div>

                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 absolute left-1/2 -translate-x-1/2 hidden md:block">
                            {user?.full_name || 'Daily Assistant'}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowHistory(!showHistory)}
                                className={`text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors rounded-full px-3 h-8 text-xs font-medium gap-2 ${showHistory ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : ''}`}
                            >
                                <History className="w-4 h-4" />
                                <span className="hidden sm:inline">History</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="bg-black text-white hover:bg-zinc-800 rounded-full px-4 h-8 text-xs font-medium"
                            >
                                Close
                            </Button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 scrollbar-hide relative">
                        {showHistory ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="max-w-3xl mx-auto pt-4 space-y-4"
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <button onClick={() => setShowHistory(false)} className="hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors">
                                        <ArrowLeft className="w-5 h-5 text-zinc-500" />
                                    </button>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Chat History</h2>
                                </div>

                                {isLoadingHistory ? (
                                    <div className="flex justify-center py-10">
                                        <Sparkles className="w-6 h-6 animate-spin text-zinc-300" />
                                    </div>
                                ) : historyLogs.length === 0 ? (
                                    <div className="text-center py-10 text-zinc-500">
                                        No history found.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {historyLogs.map((log) => (
                                            <button
                                                key={log.id}
                                                onClick={() => loadHistoryItem(log)}
                                                className="w-full text-left p-4 rounded-xl bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800/50 hover:border-violet-500/50 hover:scale-[1.02] dark:hover:border-violet-500/50 hover:shadow-lg transition-all group flex flex-col justify-between h-32 relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-3xl" />

                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="w-3 h-3 text-violet-500" />
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                                            {new Date(log.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1 mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                        {log.prompt}
                                                    </h3>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                        {typeof log.response === 'string' ? log.response.replace(/[#*]/g, '') : 'Tap to view response'}
                                                    </p>
                                                </div>

                                                <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[10px] font-bold text-violet-600 flex items-center gap-1">
                                                        Resume <ArrowLeft className="w-3 h-3 rotate-180" />
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : messages.length <= 1 ? (
                            <div className="flex flex-col h-full justify-center max-w-4xl mx-auto pb-2">
                                {/* Hero Greeting */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-center space-y-2 mb-16"
                                >
                                    <h1 className="text-4xl md:text-[40px] font-bold text-zinc-900 dark:text-white tracking-tight leading-[1.1]">
                                        Hi {user?.full_name?.split(' ')[0] || 'There'},<br></br> Ready to Achieve<span className="text-blue-500 gradient-to-br from-blue-500/5 to-transparent"> Great Things?</span>
                                    </h1>
                                </motion.div>

                                {/* Popular Ideas Cards */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                >
                                    {popularIdeas.map((idea, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => sendMessage(idea.prompt)}
                                            className="group relative p-6 rounded-[24px] overflow-hidden transition-all duration-300 hover:scale-[1.02] text-left h-full flex flex-col justify-between"
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${idea.bg} opacity-50 dark:opacity-20 group-hover:opacity-100 transition-opacity`} />
                                            <div className="absolute inset-0 backdrop-blur-3xl" />
                                            <div className="absolute inset-0 bg-white/40 dark:bg-black/20" />

                                            <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/80 dark:bg-black/50 backdrop-blur-md flex items-center justify-center mb-4 shadow-lg ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300">
                                                <idea.icon className={`w-6 h-6 ${idea.color}`} />
                                            </div>

                                            <div className="relative z-10">
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 leading-tight tracking-tight">
                                                    {idea.label}
                                                </h3>
                                                <p className="text-[13px] text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                                    {idea.sub}
                                                </p>
                                            </div>

                                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                                <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 flex items-center justify-center shadow-sm">
                                                    <ExternalLink className="w-4 h-4 text-zinc-900 dark:text-white" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            </div>
                        ) : (
                            <div className="space-y-6 pt-4 max-w-3xl mx-auto">
                                {messages.slice(1).map((message, idx) => (
                                    <MessageBubble key={message.id} message={message} isLast={idx === messages.length - 2} />
                                ))}
                                {isTyping && <TypingIndicator />}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Footer Input Area */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-white via-white to-transparent dark:from-[#0A0A0A] dark:via-[#0A0A0A] dark:to-transparent pt-20">
                        <div className="max-w-3xl mx-auto space-y-4">

                            {/* Input Container */}
                            <div className="bg-white dark:bg-zinc-900 p-2 pl-4 rounded-[24px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 w-full relative z-20">
                                <span className="text-zinc-400 text-lg">+</span>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask your Thinksense ..........."
                                    className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 text-[15px] font-medium min-w-0"
                                />
                                <div className="flex gap-2">
                                    <button className="w-10 h-10 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors">
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim() || isTyping}
                                        className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-white dark:text-black"
                                    >
                                        <Send className="w-4 h-4 ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Message Bubble Component
const MessageBubble = ({ message, isLast }: { message: Message; isLast: boolean }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 py-2 w-full ${message.role === 'user' ? 'justify-end' : ''}`}
        >
            {message.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white flex-shrink-0 flex items-center justify-center mt-1 hidden md:flex">
                    <Sparkles className="w-4 h-4 text-white dark:text-black" />
                </div>
            )}

            <div className={`flex-1 md:max-w-[85%] max-w-[95%] min-w-0 ${message.role === 'user'
                ? 'bg-zinc-100 dark:bg-zinc-800 rounded-[20px] rounded-tr-sm px-5 md:px-6 py-4 text-zinc-900 dark:text-white'
                : 'bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[20px] rounded-tl-sm px-4 md:px-5 py-4 md:py-5 shadow-sm'
                }`}>
                {message.role === 'bot' && (
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
                        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600">ThinkSense AI</span>
                    </div>
                )}
                {message.role === 'user' ? (
                    <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                    isLast ? <TypewriterText text={message.content} /> : <AdvancedMarkdown text={message.content} />
                )}
            </div>

            {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-violet-500/20 mt-1">
                    YOU
                </div>
            )}
        </motion.div>
    );
};

// Advanced Markdown Parser
const AdvancedMarkdown = ({ text }: { text: string }) => {
    const parseMarkdown = (content: string) => {
        // Strip leading # from headings just in case standard parser doesn't catch them all
        const cleanContent = content; // We'll handle per line

        const elements: JSX.Element[] = [];
        const lines = cleanContent.split('\n');

        lines.forEach((line, idx) => {
            const key = idx;

            // Handle Headings (Replace # with styled Headers)
            if (line.match(/^#{1,3}\s/)) {
                const headingText = line.replace(/^#{1,3}\s+/, '');
                elements.push(
                    <h3 key={key} className="text-lg font-bold text-zinc-900 dark:text-white mt-6 mb-3 first:mt-0 tracking-tight">
                        {formatInline(headingText)}
                    </h3>
                );
            }
            // Bullet points
            else if (line.match(/^[\s]*[-•*]\s/)) {
                elements.push(
                    <div key={key} className="flex gap-3 mb-2 ml-1">
                        <span className="text-zinc-400 mt-1.5">•</span>
                        <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                            {formatInline(line.replace(/^[\s]*[-•*]\s/, ''))}
                        </span>
                    </div>
                );
            }
            // Numbered list
            else if (line.match(/^\d+\.\s/)) {
                const number = line.match(/^(\d+)\./)?.[1];
                elements.push(
                    <div key={key} className="flex gap-3 mb-2 ml-1">
                        <span className="text-zinc-900 dark:text-white font-bold">{number}.</span>
                        <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                            {formatInline(line.replace(/^\d+\.\s/, ''))}
                        </span>
                    </div>
                );
            }
            // Empty line
            else if (line.trim() === '') {
                elements.push(<div key={key} className="h-3" />);
            }
            // Regular text
            else {
                elements.push(
                    <p key={key} className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-1 text-[15px] font-medium">
                        {formatInline(line)}
                    </p>
                );
            }
        });

        return elements;
    };

    const formatInline = (text: string) => {
        // Simplified inline formatter
        const parts: (string | JSX.Element)[] = [];
        // Bold **text**
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            parts.push(<strong key={match.index} className="font-bold text-zinc-900 dark:text-white">{match[1]}</strong>);
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        return <>{parts}</>;
    };

    return <div className="space-y-0.5">{parseMarkdown(text)}</div>;
};

// Typewriter Effect
const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        setDisplayedText('');
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 10); // Faster speed
        return () => clearInterval(timer);
    }, [text]);

    return <AdvancedMarkdown text={displayedText} />;
};

// Typing Indicator
const TypingIndicator = () => {
    return (
        <div className="flex gap-2 items-center text-zinc-400 text-sm pl-4 animate-pulse">

            <span className="font-medium">Thinking...</span>
        </div>
    );
};

export default AIAssistant;
