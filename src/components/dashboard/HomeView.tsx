import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    CheckCircle2, Flame, Zap, Trophy,
    ArrowRight, Sparkles
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

    const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming');

    // Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Filter tasks based on tabs
    const filteredTasks = tasks.filter(task => {
        if (task.status === 'deleted') return false;
        if (activeTab === 'completed') return task.status === 'completed';
        if (activeTab === 'overdue') return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
        return task.status !== 'completed'; // Upcoming
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
        <div className="p-4 pb-24 md:p-8 max-w-7xl mx-auto h-full flex flex-col font-sans gap-6 md:gap-8 overflow-y-auto min-h-0">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 shrink-0">
                <div className="space-y-1 md:space-y-2">
                    <p className="text-zinc-500 dark:text-zinc-500 font-medium text-xs uppercase tracking-wider">{dateStr}</p>
                    <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">{user?.full_name?.split(' ')[0] || 'Student'}</span>
                    </h1>
                </div>

                {/* Quick Summary Grid */}
                <div className="grid grid-cols-2 md:flex md:items-center gap-3 md:gap-4 shrink-0 w-full md:w-auto">
                    <div className="px-4 py-3 md:px-5 md:py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex-1 md:flex-none">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Done</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">{completedTasks}</span>
                        </div>
                    </div>
                    <div className="px-4 py-3 md:px-5 md:py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex-1 md:flex-none">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Overdue</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">{overdueTasks}</span>
                        </div>
                    </div>
                    {/* PC ONLY Activity Score */}
                    <div className="hidden lg:flex px-5 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm items-center gap-4">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-zinc-100 dark:text-zinc-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-violet-500 transition-all duration-1000 ease-out" strokeDasharray={`${completionRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-[10px] font-bold">{completionRate}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider leading-none">Activity</span>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white">Score</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 flex-1 min-h-0">
                {/* Left Side: Tasks */}
                <div className="lg:col-span-2 flex flex-col min-h-0 order-2 lg:order-1">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl md:rounded-[32px] shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden flex flex-col h-full min-h-[400px]">
                        {/* Task Card Header */}
                        <div className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5 border-b border-zinc-100 dark:border-zinc-800/50 sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 transition-colors">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-xl shadow-violet-500/20">
                                    {user?.full_name?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-sm md:text-base font-bold text-zinc-900 dark:text-white tracking-tight">Focus</h2>
                                    <p className="text-[10px] md:text-[11px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Today's Missions</p>
                                </div>
                            </div>
                        </div>

                        {/* Task Filter Tabs */}
                        <div className="px-5 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800/30">
                            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-x-auto no-scrollbar">
                                {(['upcoming', 'overdue', 'completed'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1.5 md:px-4 md:py-1.5 rounded-lg text-[10px] whitespace-nowrap font-bold uppercase tracking-wider transition-all ${activeTab === tab
                                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                            }`}
                                    >
                                        {tab === 'completed' ? 'Done' : tab}
                                    </button>
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider hidden md:block">{filteredTasks.length} Tasks</span>
                        </div>

                        {/* Scrollable Tasks Area */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6 pt-4">
                            {filteredTasks.length > 0 ? (
                                <div className="space-y-2 md:space-y-2">
                                    {filteredTasks.map((task, index) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={task.id}
                                            className="group flex items-center gap-3 md:gap-4 px-3 py-3 md:px-4 md:py-4 bg-zinc-50 dark:bg-zinc-800/30 border border-transparent hover:border-violet-200 dark:hover:border-violet-800/50 rounded-2xl transition-all cursor-pointer"
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleTaskCompletion(task); }}
                                                className={`flex-shrink-0 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${task.status === 'completed'
                                                    ? 'bg-emerald-500 border-emerald-500 scale-90'
                                                    : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 scale-100 hover:scale-110'
                                                    }`}
                                            >
                                                <CheckCircle2 className={`w-3.5 h-3.5 text-white transition-opacity ${task.status === 'completed' ? 'opacity-100' : 'opacity-0'}`} />
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-sm font-semibold truncate ${task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                    {task.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">DoneTogether</span>
                                                    <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${task.priority === 'high' ? 'text-rose-500' : 'text-zinc-500'}`}>
                                                        {task.priority || 'Normal'}
                                                    </span>
                                                </div>
                                            </div>

                                            {task.due_date && (
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== 'completed'
                                                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                                                        : new Date(task.due_date).toDateString() === new Date().toDateString() && task.status !== 'completed'
                                                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                                                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
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
                                <div className="h-full flex flex-col items-center justify-center py-20 text-zinc-500">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-zinc-300 dark:text-zinc-600" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider">No {activeTab === 'completed' ? 'Done' : activeTab} tasks found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Widgets */}
                <div className="flex flex-col gap-4 md:gap-6 order-1 lg:order-2">
                    {/* Goal Card */}
                    <div className="p-5 md:p-6 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl md:rounded-[32px] text-white shadow-xl shadow-violet-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap className="w-16 h-16" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold tracking-tight mb-2 flex items-center gap-2">
                            Weekly Goal
                        </h3>
                        <p className="text-xs font-medium text-violet-100 mb-6 leading-relaxed">You've completed {completionRate}% of your tasks this week. Keep going!</p>
                        <div className="space-y-4">
                            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionRate}%` }}
                                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-violet-100">
                                <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-amber-300" /> Momentum</span>
                                <span>{completionRate}%</span>
                            </div>
                        </div>
                    </div>

                    {/* STREAK WIDGET */}
                    <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[24px] md:rounded-[32px] shadow-lg relative overflow-hidden flex flex-row md:flex-col items-center justify-between md:justify-center gap-4">
                        <div className="flex items-center gap-4 md:gap-0 md:justify-center relative md:mb-4">
                            <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full" />
                            <div className="relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-rose-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/30 transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                                <Flame className="w-6 h-6 md:w-8 md:h-8 text-white animate-pulse" fill="white" />
                            </div>
                            <div className="block md:hidden">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Current Streak</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">5</span>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Days</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block text-center">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Activity Streak</h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">5</span>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Days Strong</span>
                            </div>
                        </div>

                        {/* Visual Streak Tracker - Desktop Only */}
                        <div className="w-full mt-6 hidden md:flex justify-between px-2">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${i < 5 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                                    <span className="text-[8px] font-bold text-zinc-500">{day}</span>
                                </div>
                            ))}
                        </div>

                        {/* Mobile mini tracker dots */}
                        <div className="flex md:hidden gap-1">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 5 ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                            ))}
                        </div>

                        <div className="absolute bottom-3 right-5 hidden md:block">
                            <Trophy className="w-4 h-4 text-amber-500 opacity-20" />
                        </div>
                    </div>

                    {/* Motivation Block */}
                    <div className="p-4 md:p-5 flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl md:rounded-[28px] group hover:border-violet-200 dark:hover:border-violet-800 transition-colors">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                            <span className="text-base md:text-lg">✨</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] md:text-[11px] font-medium text-zinc-500 uppercase tracking-wider leading-none mb-1">Today's Wisdom</p>
                            <p className="text-[11px] md:text-[12px] font-bold text-zinc-700 dark:text-zinc-300 leading-snug">"The secret of getting ahead is getting started."</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-violet-500 transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeView;
