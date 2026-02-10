import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, Sparkles, Calendar, Target, TrendingUp,
    Users, Lightbulb, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import type { AILog } from '@/types/database';

interface AIHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
}

const AIHistory = ({ isOpen, onClose, projectId }: AIHistoryProps) => {
    const { theme } = useTheme();
    const [logs, setLogs] = useState<AILog[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen, projectId]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('ai_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (projectId) {
                query = query.eq('project_id', projectId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching AI logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'task_assistant': return Target;
            case 'progress_analyst': return TrendingUp;
            case 'team_mentor': return Users;
            case 'reflection_coach': return Lightbulb;
            default: return Sparkles;
        }
    };

    const getModeColor = (mode: string) => {
        switch (mode) {
            case 'task_assistant': return 'text-blue-500';
            case 'progress_analyst': return 'text-emerald-500';
            case 'team_mentor': return 'text-purple-500';
            case 'reflection_coach': return 'text-amber-500';
            default: return 'text-violet-500';
        }
    };

    const getModeName = (mode: string) => {
        switch (mode) {
            case 'task_assistant': return 'Task Assistant';
            case 'progress_analyst': return 'Progress Analyst';
            case 'team_mentor': return 'Team Mentor';
            case 'reflection_coach': return 'Reflection Coach';
            default: return mode;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const totalTokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);

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
                    className="w-full max-w-3xl h-[80vh] bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <History className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                                    AI History
                                </h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {logs.length} interactions • {totalTokens.toLocaleString()} tokens
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="text-center py-20">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 opacity-50"
                                />
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Loading history...
                                </p>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-20">
                                <Sparkles className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                                <p className="text-lg font-bold text-zinc-500 dark:text-zinc-400">
                                    No AI interactions yet
                                </p>
                                <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                                    Start using AI assistant to see your history here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {logs.map((log) => {
                                    const ModeIcon = getModeIcon(log.mode);
                                    const isExpanded = expandedLog === log.id;

                                    return (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                                        >
                                            {/* Log Header */}
                                            <button
                                                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                                                className="w-full p-4 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors text-left"
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getModeColor(log.mode)} bg-opacity-10 flex items-center justify-center shrink-0`}>
                                                    <ModeIcon className={`w-5 h-5 ${getModeColor(log.mode)}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                                            {getModeName(log.mode)}
                                                        </h3>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                                {formatDate(log.created_at)}
                                                            </span>
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-4 h-4 text-zinc-400" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-zinc-400" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                                        {log.prompt}
                                                    </p>
                                                    {log.tokens_used > 0 && (
                                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                                            {log.tokens_used} tokens
                                                        </p>
                                                    )}
                                                </div>
                                            </button>

                                            {/* Expanded Content */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="border-t border-zinc-200 dark:border-zinc-700"
                                                    >
                                                        <div className="p-4 space-y-4">
                                                            {/* Prompt */}
                                                            <div>
                                                                <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                                                                    Your Question
                                                                </h4>
                                                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                                                    {log.prompt}
                                                                </p>
                                                            </div>

                                                            {/* Response */}
                                                            {log.response && (
                                                                <div>
                                                                    <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                                                                        AI Response
                                                                    </h4>

                                                                    {log.response.insights && (
                                                                        <div className="space-y-2 mb-3">
                                                                            {log.response.insights.map((insight: string, i: number) => (
                                                                                <div key={i} className="text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                                                                                    <span className="text-violet-500 mt-1">•</span>
                                                                                    <span>{insight}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {log.response.recommendations && (
                                                                        <div className="space-y-2">
                                                                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                                                                Recommendations:
                                                                            </p>
                                                                            {log.response.recommendations.map((rec: string, i: number) => (
                                                                                <div key={i} className="text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                                                                                    <span className="text-amber-500 mt-1">→</span>
                                                                                    <span>{rec}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AIHistory;
