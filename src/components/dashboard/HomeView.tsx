import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    CheckCircle2, Flame, Zap, Trophy,
    ArrowRight, Sparkles, Target, AlertCircle, Home, Award
} from 'lucide-react';
import type { User, Task } from '@/types/database';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import ProofSubmissionModal from './ProofSubmissionModal';
import TaskDetailModal from './TaskDetailModal';
import StreakStats from './StreakStats';

interface HomeViewProps {
    user: User | null;
    tasks: Task[];
    onAddTask: () => void;
    onTasksUpdated: () => void;
    onEditTask: (task: Task) => void;
}

const HomeView = ({ user, tasks, onAddTask, onTasksUpdated, onEditTask }: HomeViewProps) => {
    // State
    const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [taskForProof, setTaskForProof] = useState<Task | null>(null);

    const handleTaskClick = (task: Task) => {
        setSelectedTaskForDetail(task);
        setIsDetailModalOpen(true);
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            const { error } = await supabase.from('tasks').update({ status: 'deleted' }).eq('id', taskId);
            if (error) throw error;
            toast.success('Task moved to history');
            onTasksUpdated();
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    };

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

    // Real Streak & Points Logic
    const calculateStreakAndPoints = () => {
        const userTasks = tasks.filter(t => t.assigned_to === user?.id && t.status === 'completed' && t.completed_at);
        if (userTasks.length === 0) return { streak: 0, points: 0 };

        // Get unique completion dates (YYYY-MM-DD)
        const dates = [...new Set(userTasks.filter(t => t.completed_at).map(t => {
            try {
                return new Date(t.completed_at!).toISOString().split('T')[0];
            } catch (e) {
                return null;
            }
        }))].filter(Boolean) as string[];

        const todayStr = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // If no activity today OR yesterday, streak is broken
        if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return { streak: 0, points: userTasks.length * 10 };

        let streak = 0;
        let currentDate = new Date(dates[0]);

        for (let i = 0; i < dates.length; i++) {
            const checkDate = new Date(dates[i]);
            const diffInDays = Math.floor((currentDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));

            if (i === 0 || diffInDays === 1) {
                streak++;
                currentDate = checkDate;
            } else if (diffInDays > 1) {
                break; // Gap found
            }
        }

        // Points: 10 per task + (Streak * 5)
        const points = (userTasks.length * 10) + (streak * 5);
        return { streak, points };
    };

    const { streak: currentStreak, points: userPoints } = calculateStreakAndPoints();

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
            // PROOF OF WORK CHECK
            // If completing a task AND not a leader, require proof
            const isLeader = user?.role === 'LEADER';

            if (task.status !== 'completed' && !isLeader) {
                setTaskForProof(task);
                setIsProofModalOpen(true);
                return;
            }

            const newStatus = task.status === 'completed' ? 'not_started' : 'completed';
            const { error } = await supabase.from('tasks').update({ 
                status: newStatus,
                completed_at: newStatus === 'completed' ? new Date().toISOString() : null
            }).eq('id', task.id);
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
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold text-[13px] tracking-tight">{dateStr}</p>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-none flex flex-wrap items-baseline gap-x-3">
                        {greeting}, {user?.full_name?.split(' ')[0] || 'Member'}
                    </h1>


                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white dark:bg-zinc-950 rounded-[18px] border border-zinc-200/60 dark:border-white/5 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-emerald-600/70 dark:text-emerald-500/60 font-black tracking-widest leading-tight">Completed</span>
                            <span className="text-sm font-black text-zinc-900 dark:text-white leading-none mt-0.5">{completedTasks}</span>
                        </div>
                    </div>

                    <div className="px-4 py-2 bg-white dark:bg-zinc-950 rounded-[18px] border border-zinc-200/60 dark:border-white/5 shadow-sm flex items-center gap-3 group hover:border-amber-500/30 transition-all cursor-default">
                        <div className="w-8 h-8 flex items-center justify-center">
                            <Flame className="w-5 h-5 text-amber-700 fill-amber-700/10" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase text-zinc-700 font-black tracking-widest leading-tight">Total XP</span>
                                <div className="h-1 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 transition-all duration-1000"
                                        style={{ width: `${(userPoints % 100)}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-black text-zinc-900 dark:text-white leading-none mt-0.5">{userPoints} <span className="text-[10px] text-zinc-400 font-bold ml-1">to level up</span></span>
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
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white dark:bg-zinc-100 flex items-center justify-center text-zinc-900 dark:text-black font-black text-sm shadow-sm border border-zinc-200/50">
                                    {(user?.full_name?.[0] || user?.email?.[0] || '?').toLowerCase()}
                                </div>
                                <div>
                                    <h2 className="text-[16px] md:text-base font-black text-zinc-900 dark:text-white tracking-tight uppercase">My Missions</h2>
                                    <p className="text-[10px] md:text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Focus List</p>
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
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.03 }}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            key={task.id}
                                            onClick={() => handleTaskClick(task)}
                                            className="group flex items-center gap-4 px-5 py-4 bg-white/70 dark:bg-white/[0.03] border border-white dark:border-white/5 hover:border-violet-500/20 dark:hover:border-white/10 rounded-[28px] transition-all cursor-pointer backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                                        >
                                            <motion.button
                                                whileTap={{ scale: 0.8 }}
                                                onClick={(e) => { e.stopPropagation(); handleTaskCompletion(task); }}
                                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.status === 'completed'
                                                    ? 'bg-violet-600 border-violet-600 scale-90'
                                                    : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-500 dark:hover:border-zinc-400 scale-100'
                                                    }`}
                                            >
                                                <CheckCircle2 className={`w-3.5 h-3.5 text-white transition-opacity ${task.status === 'completed' ? 'opacity-100' : 'opacity-0'}`} />
                                            </motion.button>

                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-[13.5px] font-bold tracking-tight truncate ${task.status === 'completed' ? 'text-zinc-400 line-through decoration-zinc-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                    {task.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">DoneTogether</span>
                                                    <div className="w-0.5 h-0.5 rounded-full bg-zinc-300" />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${task.priority === 'high' ? 'text-red-500' : 'text-zinc-400'}`}>
                                                        {task.priority || 'Normal'}
                                                    </span>
                                                </div>
                                            </div>

                                            {task.due_date && (
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className={`text-[9px] font-black uppercase tracking-widest ${new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== 'completed'
                                                        ? 'text-red-500'
                                                        : new Date(task.due_date).toDateString() === new Date().toDateString() && task.status !== 'completed'
                                                            ? 'text-violet-600'
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
                <div className="flex flex-col gap-4 md:gap-4 order-1 lg:order-2">
                    <div className="relative p-5 md:p-6 rounded-[32px] overflow-hidden group border border-white/50 dark:border-white/10 shadow-lg transition-all duration-500 min-h-[180px] flex flex-col justify-between isolate bg-white/40 dark:bg-black/40 backdrop-blur-2xl">
                        {/* Custom Neon Background - integrated into glass */}
                        <div className="absolute inset-0 z-[-1] opacity-60 dark:opacity-40">
                            <img
                                src="/bgneon.png"
                                alt="Background"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>

                        <div className="relative z-10 flex flex-col gap-5">
                            {/* Header Row - Aligned perfectly */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/60 shrink-0">
                                    <Award className="w-5 h-5 text-indigo-600 dark:text-white" />
                                </div>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/70 dark:text-white/40 leading-none">Your Progress</span>
                                    <h3 className="text-base md:text-lg font-black text-black dark:text-white leading-tight tracking-tight">Personal Goals</h3>
                                </div>
                            </div>

                            {/* Badge Row - Aligned to one grid */}
                            <div className="flex items-center gap-3">
                                <div className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-3 py-1 rounded-[18px] text-lg font-black shadow-lg border border-white/10">
                                    {completedTasks}
                                </div>
                                <span className="text-[12px] md:text-[14px] font-black uppercase tracking-widest text-black/100 dark:text-white/80">Tasks Finished</span>
                            </div>
                        </div>

                        {/* Progress Row - Lower Section */}
                        <div className="relative z-10 mt-4 space-y-3">
                            <div className="h-2 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden border border-white/20">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionRate}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className="h-full bg-gradient-to-r from-indigo-400 to-[#9933FF] rounded-full relative shadow-[0_4px_15px_rgba(99,102,241,0.4)]"
                                >
                                    <motion.div
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    />
                                </motion.div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/100 dark:text-white/40">Efficiency</span>
                                <div className="text-lg md:text-xl font-black leading-none tracking-tighter text-black dark:text-white">{completionRate}%</div>
                            </div>
                        </div>
                    </div>

                    {/* STREAK WIDGET */}
                    {user && <StreakStats userId={user.id} />}

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

            <ProofSubmissionModal
                isOpen={isProofModalOpen}
                onClose={() => setIsProofModalOpen(false)}
                task={taskForProof}
                currentUserId={user?.id || ''}
                onSubmitted={() => {
                    toast.info("Proof submitted. Waiting for review.");
                }}
            />
            <TaskDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                task={selectedTaskForDetail}
                onTaskUpdated={onTasksUpdated}
                currentUserId={user?.id || ''}
                onEditTask={onEditTask}
                onDeleteTask={handleDeleteTask}
            />
        </div >
    );
};

export default HomeView;
