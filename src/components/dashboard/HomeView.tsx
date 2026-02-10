import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    CheckCircle2, Flame, Zap, Trophy,
    ArrowRight, Sparkles, Target, AlertCircle
} from 'lucide-react';
import type { User, Task } from '@/types/database';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface HomeViewProps {
    user: User | null;
    tasks: Task[];
    onAddTask: () => void;
    onTasksUpdated: () => void;
}

const HomeView = ({ user, tasks, onAddTask, onTasksUpdated }: HomeViewProps) => {
    // Date formatting
    const today = new Date();
    const dateStr = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(today);
    const hour = today.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    const [activeTab, setActiveTab] = useState<'to_do' | 'overdue' | 'completed'>('to_do');

    // Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Filter tasks based on tabs
    const filteredTasks = tasks.filter(task => {
        if (task.assigned_to !== user?.id) return false;
        if (task.status === 'deleted') return false;
        if (activeTab === 'completed') return task.status === 'completed';
        if (activeTab === 'overdue') return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
        // Default (To Do): Not completed AND Not overdue (Future/Present only)
        return task.status !== 'completed' && (!task.due_date || new Date(task.due_date) >= new Date());
    }).sort((a, b) => {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return dateA - dateB;
    });

    const handleTaskCompletion = async (task: Task) => {
        try {
            const newStatus = task.status === 'completed' ? 'not_started' : 'completed';
            const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);
            if (error) throw error;
            toast.success(newStatus === 'completed' ? 'Task completed' : 'Task re-opened');
            onTasksUpdated();
        } catch (err: any) {
            toast.error('Failed to update task');
            console.error(err);
        }
    };

    return (
        <div className="p-4 pb-24 md:p-8 max-w-7xl mx-auto h-full flex flex-col font-sans gap-6 md:gap-8 overflow-y-auto min-h-0 bg-[#F9F8F6] dark:bg-black transition-colors duration-500">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 shrink-0 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <p className="text-zinc-400 dark:text-zinc-500 font-bold text-[10px] tracking-widest uppercase">{dateStr}</p>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none capitalize">
                        {greeting.toLowerCase()}, <span className="text-[#0066FF] dark:text-blue-400">{user?.full_name?.split(' ')[0] || 'Vamsi'}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-white/5 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-wider">Completed</span>
                            <span className="text-sm font-black text-zinc-900 dark:text-white leading-none">{completedTasks}</span>
                        </div>
                    </div>

                    <div className="px-4 py-2 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-white/5 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-wider">Overdue</span>
                            <span className="text-sm font-black text-zinc-900 dark:text-white leading-none">{overdueTasks}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 flex-1 min-h-0">
                {/* Left Side: Tasks */}
                <div className="lg:col-span-2 flex flex-col min-h-0 order-2 lg:order-1">
                    <div className="bg-transparent rounded-3xl md:rounded-[32px] overflow-hidden flex flex-col h-full min-h-[400px]">
                        {/* Task Card Header */}
                        <div className="flex items-center justify-between px-1 py-4 md:py-5 border-b border-zinc-200/30 dark:border-zinc-800/30 sticky top-0 bg-transparent z-10">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-black font-bold text-sm shadow-md">
                                    {(user?.full_name?.[0] || user?.email?.[0] || '?').toLowerCase()}
                                </div>
                                <div>
                                    <h2 className="text-[15px] md:text-base font-bold text-zinc-900 dark:text-white">My Missions</h2>
                                    <p className="text-[11px] md:text-[11px] text-zinc-500 font-medium mt-0.5">Focus List</p>
                                </div>
                            </div>
                        </div>

                        <div className="py-4 flex items-center justify-between border-b border-zinc-200/30 dark:border-zinc-800/30">
                            <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-2xl border border-zinc-200/50 dark:border-white/5 shadow-inner">
                                {(['to_do', 'overdue', 'completed'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                            ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-lg'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                                            }`}
                                    >
                                        {tab === 'completed' ? 'Archived' : tab.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-zinc-400 tracking-widest">{filteredTasks.length} Active Missions</span>
                            </div>
                        </div>

                        {/* Scrollable Tasks Area */}
                        <div className="flex-1 overflow-y-auto pb-4 pt-2">
                            {filteredTasks.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredTasks.map((task, index) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={task.id}
                                            className="group flex items-center gap-4 px-5 py-4 bg-white/40 dark:bg-white/[0.03] border border-white/60 dark:border-white/5 hover:border-zinc-950/20 dark:hover:border-white/10 rounded-[28px] transition-all cursor-pointer backdrop-blur-md shadow-sm hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleTaskCompletion(task); }}
                                                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'completed'
                                                    ? 'bg-zinc-900 border-zinc-900 scale-90'
                                                    : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-zinc-400 scale-100'
                                                    }`}
                                            >
                                                <CheckCircle2 className={`w-3.5 h-3.5 text-white transition-opacity ${task.status === 'completed' ? 'opacity-100' : 'opacity-0'}`} />
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-[13px] font-semibold truncate ${task.status === 'completed' ? 'text-zinc-500 line-through decoration-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                    {task.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-zinc-500">DoneTogether</span>
                                                    <div className="w-0.5 h-0.5 rounded-full bg-zinc-400" />
                                                    <span className={`text-[10px] font-bold ${task.priority === 'high' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                                                        {task.priority || 'Normal'}
                                                    </span>
                                                </div>
                                            </div>

                                            {task.due_date && (
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className={`text-[10px] font-medium ${new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== 'completed'
                                                        ? 'text-red-500'
                                                        : new Date(task.due_date).toDateString() === new Date().toDateString() && task.status !== 'completed'
                                                            ? 'text-amber-600'
                                                            : 'text-zinc-400'
                                                        }`}>
                                                        {new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== 'completed'
                                                            ? 'Overdue'
                                                            : new Date(task.due_date).toDateString() === new Date().toDateString() && task.status !== 'completed'
                                                                ? 'Today'
                                                                : new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-20 text-zinc-500/50">
                                    <div className="w-12 h-12 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center mb-3">
                                        <CheckCircle2 className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                                    </div>
                                    <p className="text-xs font-medium">No {activeTab} tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Widgets */}
                <div className="flex flex-col gap-6 md:gap-4 order-1 lg:order-2">
                    <div className="p-4 bg-gradient-to-br from-[#0055FF] via-[#0066FF] to-[#3385FF] rounded-3xl text-white shadow-xl shadow-blue-500/10 relative overflow-hidden group border border-white/20 w-full">
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-1000" />
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/20">
                                    <CheckCircle2 className="w-4.5 h-4.5 text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-extrabold uppercase tracking-wider font-sans">My Tasks</h3>
                                    <p className="text-[7px] font-bold text-white/70 uppercase tracking-widest mt-0.5">Performance</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-medium text-white/90 leading-tight">
                                    <span className="font-black text-white bg-white/20 px-1.5 py-0.5 rounded text-[10px] mr-1">{completedTasks}</span> neutralizations
                                </span>
                            </div>

                            <div className="mt-auto space-y-2">
                                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionRate}%` }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                        className="h-full bg-white rounded-full relative overflow-hidden"
                                    >
                                        <motion.div
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                        />
                                    </motion.div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[7px] font-bold uppercase tracking-wider text-white/60">Efficiency</span>
                                    <div className="text-lg font-black leading-none">{completionRate}%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STREAK WIDGET */}
                    <div className="p-2 md:p-6 bg-white/30 dark:bg-black/40 backdrop-blur-md border border-white dark:border-white/5 rounded-[32px] shadow-sm relative overflow-hidden flex flex-row md:flex-col items-center justify-between md:justify-center gap-4">
                        <div className="flex items-center gap-4 md:gap-0 md:justify-center relative md:mb-4">
                            <div className="relative w-12 h-12 md:w-16 md:h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl md:rounded-3xl flex items-center justify-center transform group-hover:scale-110 transition-transform cursor-pointer">
                                <Flame className="w-6 h-6 md:w-8 md:h-8 text-zinc-900 dark:text-white" fill="currentColor" />
                            </div>
                            <div className="block md:hidden">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase leading-none mb-1">Streak</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">5</span>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Days</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block text-center">
                            <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-white mb-0.5">Activity Streak</h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-3xl font-bold text-zinc-900 dark:text-white">5</span>
                                <span className="text-[11px] font-medium text-zinc-500">Days</span>
                            </div>
                        </div>

                        {/* Visual Streak Tracker - Desktop Only */}
                        <div className="w-full mt-4 hidden md:flex justify-between px-4">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${i < 5 ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                                    <span className="text-[9px] font-bold text-zinc-400">{day}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex md:hidden gap-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 5 ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                            ))}
                        </div>
                    </div>

                    {/* Motivation Block */}
                    <div className="p-4 md:p-5 flex items-center gap-4 bg-white/30 dark:bg-black/40 backdrop-blur-md border border-white dark:border-white/10 rounded-[28px] group hover:border-zinc-950 transition-colors">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                            <span className="text-base md:text-lg">✨</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] md:text-[11px] font-medium text-zinc-500 uppercase leading-none mb-1">Today's Wisdom</p>
                            <p className="text-[11px] md:text-[12px] font-bold text-zinc-700 dark:text-zinc-300 leading-snug">"The secret of getting ahead is getting started."</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
