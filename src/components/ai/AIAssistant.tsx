import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Send, Sparkles, Copy, Check, ExternalLink, Layers, Zap, Calendar, Search, Music, Image as ImageIcon, History, Clock, ArrowLeft, Plus, Trash2, Mic, MicOff, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShiningText } from '@/components/ui/shining-text';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
            content: `### Systems Online\nThinkSense AI initialized. I am your strategic partner for **${project?.title || 'this project'}**.\n\nReady to analyze your trajectory. How can I assist with your mission today?`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [thinkingStep, setThinkingStep] = useState<string>('');
    const [thinkingKeywords, setThinkingKeywords] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

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
            setInput(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    const buildContext = () => {
        return {
            project: {
                id: project?.id ?? '',
                name: project?.title ?? '',
                goal: project?.goal || project?.description || '',
                team_size: Array.isArray(members) ? members.length : 0
            },
            tasks: {
                total: Array.isArray(tasks) ? tasks.length : 0,
                done: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === 'completed').length : 0,
                in_progress: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === 'in_progress').length : 0
            },
            detailed_tasks: Array.isArray(tasks)
                ? tasks.slice(0, 20).map((t: any) => `- [${String(t.status || '').toUpperCase()}] ${t.title} (Priority: ${t.priority})`).join('\n')
                : ''
        };
    };

    const SYSTEM_INSTRUCTION = `
    You are ThinkSense AI — a high-impact project strategist. Your goal is absolute precision and structured excellence.

    RESPONSE ARCHITECTURE (STRICT ADHERENCE REQUIRED):
    1. DEFINITION: Start with a crisp, exact definition of the concept or request.
    2. KEY STRATEGIES: Provide 3-5 high-impact bullet points (•) for actionable execution.
    3. STRATEGIC CONCLUSION: A single powerful sentence summarizing the core takeaway.
    4. INTERACTIVE MOMENTUM: End every response with one highly relevant, strategic follow-up question to the user.

    STRATEGIC TONE:
    - Elite, objective-driven, and sharp.
    - Use bolding for critical terms.
    - NO FILLER intro phrases (e.g., "Sure, here is...").

    PROJECT OVERVIEW:
    - Mission: ${project?.title || 'Active Session'}.
    - Active Focus: ${Array.isArray(tasks) ? tasks.slice(0, 3).map(t => t.title).join(', ') : 'Strategic mapping'}.
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
            const history = messages.slice(-6).map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n');
            const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nCONVERSATION HISTORY:\n${history}\n\nCURRENT USER REQUEST: ${contentToSend}`;

            const { data, error } = await supabase.functions.invoke('ai-assistant', {
                body: {
                    mode: 'task_assistant',
                    context,
                    prompt: fullPrompt
                }
            });

            // --- START THINKING SIMULATION (Optimized Speed) ---
            const queryLength = contentToSend.length;
            const complexity = queryLength < 30 ? 'simple' : queryLength < 100 ? 'medium' : 'hard';

            const runThinkingSimulation = async () => {
                if (complexity === 'simple') {
                    setThinkingStep('Generating insight...');
                    await new Promise(r => setTimeout(r, 600));
                } else if (complexity === 'medium') {
                    setThinkingStep('Understanding request...');
                    await new Promise(r => setTimeout(r, 600));

                    const keywords = contentToSend.split(' ').filter(w => w.length > 4).slice(0, 3);
                    setThinkingKeywords(keywords);
                    setThinkingStep('Analyzing keywords...');
                    await new Promise(r => setTimeout(r, 800));

                    setThinkingStep('Finalizing response...');
                    await new Promise(r => setTimeout(r, 600));
                } else {
                    const steps = [
                        'Working on it...',
                        'Understanding the question...',
                        'Analyzing deep context...',
                        'Generating master insight...'
                    ];

                    const keywords = contentToSend.split(' ').filter(w => w.length > 5).slice(0, 5);
                    setThinkingKeywords(keywords);

                    for (const step of steps) {
                        setThinkingStep(step);
                        const delay = 600 + Math.random() * 400;
                        await new Promise(r => setTimeout(r, delay));
                    }
                }
            };

            await runThinkingSimulation();
            setIsTyping(false);
            setThinkingStep('');
            setThinkingKeywords([]);

            if (error) {
                console.error("AI Assistant Error:", error);
                const errorMsg = error.message || (typeof error === 'string' ? error : '');
                if (errorMsg.toLowerCase().includes('jwt')) {
                    const errorMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        role: 'bot',
                        content: 'Your session has expired or the token is invalid. Please refresh the page or sign in again.',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, errorMessage]);
                    return;
                }
                throw error;
            }

            const responseText = data.rawResponse || data.response;
            const errorMessageFromData = data.message || data.error;

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: responseText || errorMessageFromData || 'Sorry, I couldn\'t process that.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);

            if (user?.id) {
                try {
                    await supabase.from('ai_logs').insert({
                        user_id: user.id,
                        project_id: project?.id,
                        prompt: contentToSend,
                        response: responseText || data.response,
                        mode: 'task_assistant',
                        tokens_used: data.usage?.total_tokens || 0
                    });
                } catch (logError) {
                    console.error("Failed to save history:", logError);
                }
            }
        } catch (error: any) {
            console.error("DEBUG - ThinkSense AI Error Details:", error);
            setIsTyping(false);
            let displayError = "Connection failed";
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const errorData = await error.context.json();
                    displayError = errorData.message || errorData.error || error.message;
                } catch {
                    displayError = error.message;
                }
            } else {
                displayError = error.message || (typeof error === 'string' ? error : 'Connection failed');
            }

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: `Sorry, I encountered an error connecting to the AI service:\n\n**${displayError}**\n\nPlease ensure your Supabase function is deployed and reachable.`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

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

    const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            const { error } = await supabase.from('ai_logs').delete().eq('id', id);
            if (error) throw error;
            setHistoryLogs(prev => prev.filter(item => item.id !== id));
            toast.success("History item deleted");
        } catch (error) {
            console.error("Failed to delete history:", error);
            toast.error("Failed to delete history item");
        }
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
            label: 'Share ideas',
            sub: 'Feedback & tasks',
            icon: Layers,
            prompt: 'How can I contribute to the project tasks effectively?',
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'from-orange-500/25 to-amber-500/25'
        },
        {
            label: 'Sync goals',
            sub: 'Keep goals aligned',
            icon: Target,
            prompt: 'Help me align with the team goals',
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'from-violet-500/25 to-fuchsia-500/25'
        },
        {
            label: 'Track time',
            sub: 'Set your priorities',
            icon: Clock,
            prompt: 'Help me prioritize my current tasks',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'from-blue-500/25 to-cyan-500/25'
        }
    ];

    const startNewChat = () => {
        setMessages([
            {
                id: '1',
                role: 'bot',
                content: `Hi! 👋\nHow can I help you today?`,
                timestamp: new Date()
            }
        ]);
        setShowHistory(false);
        toast.info("New chat started");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 md:bg-black/20 backdrop-blur-[4px] md:backdrop-blur-[2px] z-50 flex items-end md:items-center justify-center p-0 md:p-4 pb-0"
                onClick={onClose}
            >
                <div className="w-full flex justify-center pb-2 md:pb-0 pt-16 md:pt-0">
                    <motion.div
                        drag
                        dragListener={false}
                        dragControls={dragControls}
                        dragMomentum={false}
                        initial={{ scale: 1, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1, opacity: 0, y: 200 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-[900px] h-[90vh] md:h-[85vh] max-h-[850px] md:max-h-[800px] bg-white dark:bg-[#0A0A0A] rounded-t-[32px] md:rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-white/50 dark:border-white/5 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className="px-4 md:px-8 py-6 flex items-center justify-between z-10 cursor-grab active:cursor-grabbing select-none"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <div className="flex items-center gap-2 pointer-events-none">
                                <Sparkles className="w-5 h-5 text-zinc-900 dark:text-white" />
                                <span className="text-sm font-semibold text-zinc-900 dark:text-white">ThinkSense AI</span>
                            </div>

                            <div className="text-base font-bold text-zinc-900 dark:text-white absolute left-1/2 -translate-x-1/2 hidden md:block pointer-events-none tracking-tight">
                                {user?.full_name || 'Daily Assistant'}
                            </div>

                            <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={startNewChat}
                                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors rounded-full px-3 h-8 text-xs font-medium gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">New Chat</span>
                                </Button>

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
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-violet-500/5 to-transparent rounded-bl-3xl pointer-events-none" />
                                                    <div
                                                        onClick={(e) => deleteHistoryItem(e, log.id)}
                                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-black/50 hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 z-20 shadow-sm backdrop-blur-sm cursor-pointer"
                                                        title="Delete from history"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </div>

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
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-center space-y-2 mb-16"
                                    >
                                        <h1 className="text-4xl md:text-[40px] font-bold text-zinc-900 dark:text-white tracking-tight leading-[1.1]">
                                            Hi {user?.full_name?.split(' ')[0] || 'There'},<br />
                                            Ready to Achieve <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-[#9933FF] dark:from-blue-400 dark:to-purple-500">Great Things?</span>
                                        </h1>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                    >
                                        {popularIdeas.map((idea, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => sendMessage(idea.prompt)}
                                                className="group relative p-6 md:p-8 rounded-[48px] overflow-hidden cursor-pointer transition-shadow duration-500 text-left h-full flex flex-row items-center md:items-start md:flex-col justify-between gap-4 md:gap-0 shadow-xl hover:shadow-2xl border border-white/30 dark:border-white/10 isolate bg-white/40 dark:bg-black/40 backdrop-blur-3xl"
                                            >
                                                {/* Background layer with inherited rounding */}
                                                <div className={`absolute inset-0 bg-gradient-to-br ${idea.bg} opacity-20 dark:opacity-20 group-hover:opacity-100 transition-opacity duration-500 rounded-[48px]`} />
                                                
                                                <div className="relative z-10 w-14 h-14 rounded-[28px] bg-white/90 dark:bg-black/50 backdrop-blur-xl flex items-center justify-center md:mb-6 shadow-xl ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                                    <idea.icon className={`w-7 h-7 ${idea.color}`} />
                                                </div>

                                                <div className="relative z-10 flex-1">
                                                    <h3 className="text-lg md:text-2xl font-black text-black dark:text-white mb-1 md:mb-2 leading-tight tracking-tighter">
                                                        {idea.label}
                                                    </h3>
                                                    <p className="text-[12px] md:text-[14px] text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed opacity-75 group-hover:opacity-100 transition-opacity">
                                                        {idea.sub}
                                                    </p>
                                                </div>

                                                <div className="relative md:absolute md:bottom-6 md:right-6 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-500 md:translate-x-4 group-hover:translate-x-0 shrink-0 z-10">
                                                    <div className="w-10 h-10 rounded-full bg-white/95 dark:bg-black/90 flex items-center justify-center shadow-md">
                                                        <ExternalLink className="w-5 h-5 text-black dark:text-white" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="space-y-6 pt-6 max-w-4xl mx-auto">
                                    {messages.slice(1).map((message, idx) => (
                                        <MessageBubble key={message.id} message={message} isLast={idx === messages.length - 2} />
                                    ))}
                                    {isTyping && <TypingIndicator step={thinkingStep} keywords={thinkingKeywords} />}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Footer Input Area */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-white via-white to-transparent dark:from-[#0A0A0A] dark:via-[#0A0A0A] dark:to-transparent pt-20">
                            <div className="max-w-3xl mx-auto space-y-4">
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
                                        <button
                                            onClick={toggleListening}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'}`}
                                        >
                                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                        </button>
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
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

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

            <div className={`flex-1 max-w-full md:max-w-[94%] min-w-0 ${message.role === 'user'
                ? 'bg-zinc-100 dark:bg-zinc-800 rounded-[22px] rounded-tr-sm px-6 py-4 text-zinc-900 dark:text-white shadow-sm'
                : 'bg-white dark:bg-[#0c0c0d] border border-zinc-100/50 dark:border-white/5 rounded-[32px] px-8 md:px-12 py-8 md:py-12 shadow-xl relative'
                }`}>
                {message.role === 'bot' && (
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-2 bg-violet-600 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.4)]" />
                        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest antialiased">Strategic Insight</span>
                    </div>
                )}
                {message.role === 'user' ? (
                    <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                    isLast ? <TypewriterText text={message.content} /> : <RichTextRenderer text={message.content} />
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

const highlightSyntax = (code: string) => {
    const escapeHtml = (str: string) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const tokenRegex = /(".*?"|'.*?'|`[\s\S]*?`)|(\/\/.*$|\/\*[\s\S]*?\*\/)|(\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|interface|type|async|await|new|try|catch|switch|case|break|continue|extends|implements|public|private|protected|true|false|null|undefined|void|number|string|boolean|any)\b)|(\b\d+\b)|(\b[A-Z][a-zA-Z0-9_]*\b)/gm;
    let lastIndex = 0;
    let result = "";
    let match;
    while ((match = tokenRegex.exec(code)) !== null) {
        if (match.index > lastIndex) {
            result += escapeHtml(code.substring(lastIndex, match.index));
        }
        const [fullMatch, string, comment, keyword, _, number, typeName] = match;
        if (string) {
            result += `<span class="text-[#50FA7B] font-medium">${escapeHtml(string)}</span>`;
        } else if (comment) {
            result += `<span class="text-[#6272A4] italic">${escapeHtml(comment)}</span>`;
        } else if (keyword) {
            result += `<span class="text-[#FF79C6] font-bold">${escapeHtml(keyword)}</span>`;
        } else if (number) {
            result += `<span class="text-[#BD92F9]">${escapeHtml(number)}</span>`;
        } else if (typeName) {
            result += `<span class="text-[#8BE9FD] font-semibold">${escapeHtml(typeName)}</span>`;
        } else {
            result += escapeHtml(fullMatch);
        }
        lastIndex = tokenRegex.lastIndex;
    }
    if (lastIndex < code.length) {
        result += escapeHtml(code.substring(lastIndex));
    }
    return result;
};

const CodeBlock = ({ language, code }: { language: string, code: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Code copied to clipboard");
    };
    return (
        <div className="my-4 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl bg-[#0F0F0F] group/code">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#18181b] border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 opacity-50 group-hover/code:opacity-100 transition-opacity">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                    </div>
                    <span className="ml-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">{language || 'CODE'}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 transition-all text-[10px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <div className="p-5 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                <pre className="font-mono text-[13px] leading-relaxed text-zinc-300">
                    <code dangerouslySetInnerHTML={{ __html: highlightSyntax(code) }} />
                </pre>
            </div>
        </div>
    );
};

const RichTextRenderer = ({ text }: { text: string }) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return (
        <div className="space-y-1">
            {parts.map((part, index) => {
                if (part.trim().startsWith('```')) {
                    const match = part.match(/```([\w-]*)\s?([\s\S]*?)```/);
                    if (match) {
                        return <CodeBlock key={index} language={match[1]} code={match[2]} />;
                    }
                }
                if (!part.trim()) return null;
                return <SimpleMarkdown key={index} text={part} />;
            })}
        </div>
    );
};

const SimpleMarkdown = ({ text }: { text: string }) => {
    const formatInline = (text: string) => {
        const parts: (string | JSX.Element)[] = [];
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

    const parseMarkdown = (content: string) => {
        const elements: JSX.Element[] = [];
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            const key = idx;
            if (line.match(/^#{1,3}\s/)) {
                const headingText = line.replace(/^#{1,3}\s+/, '');
                elements.push(
                    <h3 key={key} className="text-[19px] font-black text-zinc-900 dark:text-white mt-8 mb-4 first:mt-0 tracking-tight leading-tight flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-[#9933FF] rounded-full" /> {formatInline(headingText)}
                    </h3>
                );
            }
            else if (line.match(/^[\s]*[-•*]\s/)) {
                elements.push(
                    <div key={key} className="flex gap-4 mb-4 ml-1.5 items-start">
                        <div className="w-[6px] h-[6px] bg-violet-400/80 rounded-sm mt-[9px] shrink-0" />
                        <span className="text-zinc-700 dark:text-zinc-300 leading-[1.65] font-medium text-[15.5px]">
                            {formatInline(line.replace(/^[\s]*[-•*]\s/, ''))}
                        </span>
                    </div>
                );
            }
            else if (line.match(/^\d+\.\s/)) {
                const number = line.match(/^(\d+)\./)?.[1];
                elements.push(
                    <div key={key} className="flex gap-4 mb-3 ml-1.5">
                        <span className="text-[#9933FF] font-black text-[14px] mt-1">{number}.</span>
                        <span className="text-zinc-700 dark:text-zinc-300 leading-[1.6] font-medium text-[15.5px]">
                            {formatInline(line.replace(/^\d+\.\s/, ''))}
                        </span>
                    </div>
                );
            }
            else if (line.trim() === '') {
                elements.push(<div key={key} className="h-5" />);
            }
            else {
                elements.push(
                    <p key={key} className="text-zinc-700 dark:text-zinc-300 leading-[1.8] mb-8 text-[15.5px] font-medium antialiased text-left tracking-normal">
                        {formatInline(line)}
                    </p>
                );
            }
        });
        return elements;
    };
    return <div className="space-y-0.5">{parseMarkdown(text)}</div>;
};

const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        let i = 0;
        setDisplayedText('');
        setIsFinished(false);
        const getDelay = (char: string) => {
            if (['.', '?', '!', '\n'].includes(char)) return 70;
            if ([',', ';', ':'].includes(char)) return 30;
            return 8;
        };
        const typeCharacter = () => {
            if (i < text.length) {
                setDisplayedText(text.substring(0, i + 1));
                const delay = getDelay(text.charAt(i));
                i++;
                setTimeout(typeCharacter, delay);
            } else {
                setIsFinished(true);
            }
        };
        typeCharacter();
    }, [text]);

    return (
        <div className="relative">
            <RichTextRenderer text={displayedText} />
            {!isFinished && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2.5 h-5 bg-[#9933FF] ml-1 align-middle"
                />
            )}
        </div>
    );
};

const TypingIndicator = ({ step, keywords }: { step: string; keywords: string[] }) => {
    return (
        <div className="flex flex-col gap-3 pl-12 py-4">
            <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.4, 1],
                                opacity: [0.3, 1, 0.3],
                                backgroundColor: ['#000000', '#555555', '#000000']
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: i * 0.2
                            }}
                            className="w-1.5 h-1.5 rounded-full dark:bg-white"
                        />
                    ))}
                </div>
                <motion.span
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[13px] font-black text-black dark:text-white uppercase tracking-[0.10em] antialiased"
                >
                    {step || 'Generating...'}
                </motion.span>
            </div>

            {keywords && keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
                    {keywords.map((kw, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="px-4 py-1.5 bg-black border border-white/10 rounded-full flex items-center gap-2 shadow-2xl shadow-black"
                        >
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
                            <span className="text-[10px] font-black text-white font-mono tracking-tighter uppercase">
                                {kw}
                            </span>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
