import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Send, Mic, X, Lightbulb, Target, Users,
    TrendingUp, Clock, CheckCircle2, AlertCircle, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import type { Project, Task, ProjectMember, User } from '@/types/database';
import AIHistory from './AIHistory';

type AIMode = 'task_assistant' | 'progress_analyst' | 'team_mentor' | 'reflection_coach';

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    tasks: Task[];
    members: (ProjectMember & { users?: User })[];
    currentUserId: string;
    defaultMode?: AIMode;
}

interface AISuggestion {
    id: string;
    title: string;
    description: string;
    icon: any;
    mode: AIMode;
}

const AIAssistant = ({
    isOpen,
    onClose,
    project,
    tasks,
    members,
    currentUserId,
    defaultMode = 'task_assistant'
}: AIAssistantProps) => {
    const { theme } = useTheme();
    const [activeMode, setActiveMode] = useState<AIMode>(defaultMode);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiResponse, setAiResponse] = useState<any>(null);
    const [showHistory, setShowHistory] = useState(false);

    // Popular AI prompts based on context
    const popularIdeas: AISuggestion[] = [
        {
            id: '1',
            title: 'Break down project',
            description: 'Get suggested task breakdown',
            icon: Target,
            mode: 'task_assistant'
        },
        {
            id: '2',
            title: 'Analyze progress',
            description: 'Check project health & risks',
            icon: TrendingUp,
            mode: 'progress_analyst'
        },
        {
            id: '3',
            title: 'Team workload',
            description: 'Balance task distribution',
            icon: Users,
            mode: 'team_mentor'
        },
        {
            id: '4',
            title: 'Weekly reflection',
            description: 'What went well? What to improve?',
            icon: Lightbulb,
            mode: 'reflection_coach'
        }
    ];

    const handleSuggestionClick = (suggestion: AISuggestion) => {
        setActiveMode(suggestion.mode);
        // Auto-trigger AI based on mode
        triggerAI(suggestion.mode);
    };

    const triggerAI = async (mode: string, customPrompt?: string) => {
        try {
            setIsProcessing(true);
            setAiResponse(null);

            // Build context payload
            const context = buildContext(mode);

            // Get session and Supabase URL
            const { data: { session } } = await supabase.auth.getSession();
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

            if (!session?.access_token) {
                throw new Error('No active session. Please log in again.');
            }

            console.log('Calling AI Assistant:', { mode, supabaseUrl });

            // Call AI Assistant Edge Function
            const response = await fetch(`${supabaseUrl}/functions/v1/ai-assistant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    mode,
                    context,
                    prompt: customPrompt
                })
            });

            console.log('AI Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('AI Error response:', errorText);
                throw new Error(`AI request failed: ${response.status} - ${errorText}`);
            }

            const aiData = await response.json();
            setAiResponse(aiData);

        } catch (error) {
            console.error('AI Error:', error);
            setAiResponse({
                error: true,
                message: error instanceof Error ? error.message : 'AI temporarily unavailable. Please try again.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const buildContext = (mode: string) => {
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
        const overdueTasks = tasks.filter(t =>
            t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
        ).length;

        return {
            mode,
            project: {
                id: project.id,
                name: project.title,
                goal: project.description,
                duration: `${project.start_date} to ${project.end_date}`,
                team_size: members.length
            },
            tasks: {
                total: tasks.length,
                done: completedTasks,
                in_progress: inProgressTasks,
                overdue: overdueTasks
            },
            team: {
                leader: members.find(m => m.role === 'owner')?.users?.full_name || 'Unknown',
                members: members.map(m => ({
                    name: m.users?.full_name || 'Anonymous',
                    role: m.role,
                    tasks: tasks.filter(t => t.assigned_to === m.user_id).length
                }))
            }
        };
    };

    const getMockResponse = (mode: AIMode) => {
        switch (mode) {
            case 'task_assistant':
                return {
                    title: 'Suggested Task Breakdown',
                    insights: [
                        'Your project needs 3 major phases',
                        'Backend setup is critical and should start first',
                        'Frontend can start in parallel after week 1'
                    ],
                    actions: [
                        { type: 'create_task', label: 'Setup Database Schema', priority: 'high' },
                        { type: 'create_task', label: 'Design API Routes', priority: 'high' },
                        { type: 'create_task', label: 'Build Landing Page', priority: 'medium' }
                    ]
                };
            case 'progress_analyst':
                return {
                    title: 'Project Health Analysis',
                    score: 72,
                    status: 'At Risk',
                    insights: [
                        `${tasks.filter(t => t.status === 'completed').length}/${tasks.length} tasks completed`,
                        `${tasks.filter(t => t.due_date && new Date(t.due_date) < new Date()).length} tasks overdue`,
                        'Team is on track but needs to accelerate in week 2'
                    ],
                    recommendations: [
                        'Focus on overdue high-priority tasks first',
                        'Consider reassigning blocked tasks',
                        'Schedule a quick sync to unblock progress'
                    ]
                };
            case 'team_mentor':
                return {
                    title: 'Team Workload Analysis',
                    insights: [
                        'Workload is unevenly distributed',
                        'Some members have 3x more tasks than others',
                        'No one is overloaded yet'
                    ],
                    actions: [
                        { type: 'reassign', label: 'Redistribute 2 tasks from Member A', member: 'A' },
                        { type: 'check_in', label: 'Check with inactive member B' }
                    ]
                };
            case 'reflection_coach':
                return {
                    title: 'Weekly Reflection',
                    questions: [
                        'What went well this week?',
                        'What blocked your progress?',
                        'What will you improve next week?'
                    ],
                    insights: [
                        'Completed 8 tasks this week',
                        'Team collaboration improved',
                        'Focus area: Testing & documentation'
                    ]
                };
            default:
                return { title: 'AI Response', insights: [] };
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden relative"
                >
                    {/* Header */}
                    <div className="px-6 py-3 border-b border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between">
                        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                            Project AI
                        </h2>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowHistory(true)}
                                className="rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                title="View AI History"
                            >
                                <History className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 min-h-[380px] max-h-[550px] overflow-y-auto">
                        {!aiResponse && !isProcessing && (
                            <div className="text-center py-12">
                                {/* AI Orb */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 180, 360]
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-purple-400 shadow-2xl shadow-blue-500/50"
                                />

                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">
                                    Hey, what can I do<br />for you today?
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    I'm here to help with your project
                                </p>

                                {/* Popular Ideas */}
                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Popular Ideas
                                        </span>
                                        <span className="text-xs text-zinc-400">See all</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {popularIdeas.map((idea) => (
                                            <motion.button
                                                key={idea.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSuggestionClick(idea)}
                                                className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-left hover:shadow-lg transition-all"
                                            >
                                                <idea.icon className="w-5 h-5 text-violet-500 mb-2" />
                                                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                                                    {idea.title}
                                                </h4>
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    {idea.description}
                                                </p>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="text-center py-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-purple-400 shadow-2xl"
                                />
                                <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
                                    Analyzing your project...
                                </p>
                            </div>
                        )}

                        {aiResponse && !aiResponse.error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                                    <Sparkles className="w-6 h-6 text-violet-500" />
                                    <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                                        {aiResponse.title}
                                    </h3>
                                </div>

                                {aiResponse.score && (
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                        <div className="text-5xl font-black mb-1">{aiResponse.score}%</div>
                                        <div className="text-sm font-bold opacity-90">{aiResponse.status}</div>
                                    </div>
                                )}

                                {aiResponse.insights && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                                            Insights
                                        </h4>
                                        {aiResponse.insights.map((insight: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                <p className="text-sm text-zinc-700 dark:text-zinc-300">{insight}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {aiResponse.recommendations && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                                            Recommendations
                                        </h4>
                                        {aiResponse.recommendations.map((rec: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                                <p className="text-sm text-amber-900 dark:text-amber-200">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {aiResponse.actions && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                                            Quick Actions
                                        </h4>
                                        {aiResponse.actions.map((action: any, i: number) => (
                                            <Button
                                                key={i}
                                                className="w-full justify-start bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                                            >
                                                <Target className="w-4 h-4 mr-2" />
                                                {action.label}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                {aiResponse.questions && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                                            Reflection Questions
                                        </h4>
                                        {aiResponse.questions.map((q: string, i: number) => (
                                            <div key={i} className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                                <p className="text-sm font-bold text-zinc-900 dark:text-white mb-2">{q}</p>
                                                <textarea
                                                    placeholder="Your answer..."
                                                    className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white resize-none"
                                                    rows={2}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {aiResponse?.error && (
                            <div className="text-center py-20">
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
                                    {aiResponse.message}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="px-5 py-3.5 border-t border-zinc-200/50 dark:border-zinc-700/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full shrink-0"
                            >
                                <Lightbulb className="w-5 h-5" />
                            </Button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything about your project..."
                                className="flex-1 px-5 py-3 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && input.trim()) {
                                        triggerAI(activeMode, input);
                                        setInput('');
                                    }
                                }}
                            />
                            <Button
                                size="icon"
                                className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shrink-0"
                                onClick={() => {
                                    if (input.trim()) {
                                        triggerAI(activeMode, input);
                                        setInput('');
                                    }
                                }}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* AI History Modal */}
            <AIHistory
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                projectId={project.id}
            />
        </AnimatePresence>
    );
};

export default AIAssistant;
