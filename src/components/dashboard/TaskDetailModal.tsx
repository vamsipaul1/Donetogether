import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, CheckCircle2, Circle, Calendar, User,
    ChevronRight, Timer, Target, AlertCircle,
    Trash2, Edit3, Sparkles, BadgeCheck, FilePenLine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Task, TaskStep } from '@/types/database';
import { cn } from '@/lib/utils';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onTaskUpdated: () => void;
    currentUserId: string;
    onEditTask?: (task: Task) => void;
    onDeleteTask?: (taskId: string) => void;
}

const TaskDetailModal = ({
    isOpen,
    onClose,
    task,
    onTaskUpdated,
    currentUserId,
    onEditTask,
    onDeleteTask
}: TaskDetailModalProps) => {
    const [steps, setSteps] = useState<TaskStep[]>([]);
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState<'ADMIN' | 'LEADER' | 'MEMBER'>('MEMBER');
    const [leadName, setLeadName] = useState('Squad Lead');

    useEffect(() => {
        if (task && isOpen) {
            try {
                if (task.description && (task.description.startsWith('[') || task.description.startsWith('{'))) {
                    setSteps(JSON.parse(task.description));
                } else {
                    setSteps([]);
                }
            } catch (e) {
                console.error("Failed to parse steps", e);
                setSteps([]);
            }
            fetchUserRole();
            fetchLeadName();
        }
    }, [task, isOpen]);

    const fetchLeadName = async () => {
        if (!task?.assigned_by) return;
        const { data, error } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', task.assigned_by)
            .single();

        if (data) {
            setLeadName(data.full_name || data.email.split('@')[0]);
        }
    };

    const fetchUserRole = async () => {
        if (!currentUserId || !task?.project_id) return;

        // Check project member role
        const { data: member } = await supabase
            .from('project_members')
            .select('role')
            .eq('project_id', task.project_id)
            .eq('user_id', currentUserId)
            .single();

        if (member?.role === 'lead') {
            setUserRole('LEADER');
            return;
        }

        const { data: profile } = await supabase.from('users').select('role').eq('id', currentUserId).single();
        if (profile?.role === 'LEADER') setUserRole('LEADER');
    };

    const isAuthorizedToEdit = userRole === 'LEADER' || task?.assigned_by === currentUserId;

    const completedCount = steps.filter(s => s.completed).length;
    const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

    const handleToggleStep = async (stepId: string) => {
        // Members can only update progress if assigned to them, OR if they are a Leader.
        // Actually the table says "Update Progress: All (V)".
        const isAssignee = task?.assigned_to === currentUserId;
        const canUpdate = userRole === 'LEADER' || isAssignee || task?.assigned_by === currentUserId;

        if (!canUpdate) {
            toast.error("Access Denied: Only assignees or leaders can update progress");
            return;
        }

        const newSteps = steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
        setSteps(newSteps);

        // Update in DB
        const stepsJson = JSON.stringify(newSteps);
        const allCompleted = newSteps.every(s => s.completed) && newSteps.length > 0;

        const { error } = await supabase
            .from('tasks')
            .update({
                description: stepsJson,
                status: allCompleted ? 'completed' : (newSteps.some(s => s.completed) ? 'in_progress' : 'not_started'),
                completed_at: allCompleted ? new Date().toISOString() : null
            })
            .eq('id', task?.id);

        if (error) {
            toast.error("Failed to update progress");
            // Revert UI
            setSteps(steps);
        } else {
            onTaskUpdated();
        }
    };

    const handleDelete = async () => {
        if (!onDeleteTask || !task) return;
        onDeleteTask(task.id);
        onClose();
    };

    const handleEdit = () => {
        if (!onEditTask || !task) return;
        onEditTask(task);
        onClose();
    };

    if (!isOpen || !task) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 10 }}
                    transition={{ type: "spring", damping: 28, stiffness: 350 }}
                    className="relative w-full max-w-md bg-white dark:bg-[#09090b] rounded-[28px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.4)] overflow-hidden border border-zinc-200 dark:border-white/[0.08]"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                    {/* Minimalist Top Bar */}
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 opacity-80" />

                    <div className="p-6 relative z-10">
                        {/* Header Section */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 mb-1.5 cursor-default">
                                    <div className="flex items-center h-4 px-2 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-[6.5px] md:text-[7px] font-black tracking-[0.1em] uppercase">
                                        Active Task
                                    </div>
                                    <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.2em] opacity-80 tabular-nums">
                                        {task.id.slice(0, 6)}
                                    </span>
                                </div>
                                <h1 className="text-[16px] md:text-[18px] font-black text-zinc-900 dark:text-white tracking-tight leading-tight capitalize">
                                    {task.title}
                                </h1>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all text-zinc-500"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Compact Stats Row */}
                        <div className="grid grid-cols-2 gap-2 mb-5">
                            <div className="p-3 bg-zinc-50/50 dark:bg-white/[0.02] rounded-2xl border border-zinc-100/80 dark:border-white/[0.04] flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-white/5 text-zinc-600">
                                    <User className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-0.5 opacity-70">Squad Lead</p>
                                    <p className="text-[9px] font-bold text-zinc-900 dark:text-white truncate tracking-[0.2em]">{leadName}</p>
                                </div>
                            </div>

                            <div className="p-3 bg-zinc-50/50 dark:bg-white/[0.02] rounded-2xl border border-zinc-100/80 dark:border-white/[0.04] flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-white/5 text-amber-600/80">
                                    <Timer className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-0.5 opacity-70">Target Date</p>
                                    <p className="text-[12px] font-bold text-zinc-900 dark:text-white truncate tracking-tight">
                                        {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'Open'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Tracker - Start Aligned Neat Style */}
                        <div className="mb-6 px-1">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
                                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-[13px] font-bold tracking-tight">Task Progress</span>
                                </div>
                                <span className="text-lg font-black tabular-nums tracking-tighter text-zinc-900 dark:text-zinc-100">
                                    {progress}%
                                </span>
                            </div>
                            <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-in-out",
                                        progress === 100 ? "bg-emerald-500" : "bg-indigo-600"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Milestones Checklist */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between px-1 mb-1 opacity-70">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black uppercase tracking-widest">Execution Steps</span>
                                </div>
                                <span className="text-[9px] font-black tracking-widest">{completedCount} / {steps.length} Reached</span>
                            </div>

                            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 overflow-x-hidden custom-scrollbar">
                                {steps.length > 0 ? (
                                    steps.map((step, idx) => (
                                        <button
                                            key={step.id}
                                            onClick={() => handleToggleStep(step.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left group active:scale-[0.99]",
                                                step.completed
                                                    ? "bg-zinc-50/40 dark:bg-white/[0.01] border-zinc-100/50 dark:border-white/[0.02]"
                                                    : "bg-white dark:bg-zinc-900/50 border-zinc-200/60 dark:border-white/[0.06] hover:border-black dark:hover:border-white shadow-sm"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all text-[9px] font-black",
                                                step.completed
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black"
                                            )}>
                                                {step.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                                            </div>
                                            <span className={cn(
                                                "text-[12px] font-bold flex-1 leading-tight tracking-tight",
                                                step.completed ? "text-zinc-400 line-through decoration-zinc-300" : "text-zinc-800 dark:text-zinc-200"
                                            )}>
                                                {step.text}
                                            </span>
                                            {step.completed && (
                                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 opacity-60" />
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-10 text-center bg-zinc-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-zinc-200 dark:border-white/5">
                                        <AlertCircle className="w-5 h-5 text-zinc-300 mx-auto mb-2 opacity-50" />
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">No Milestones Provided</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions - Simple Monochrome Style */}
                    <div className="px-6 py-5 bg-zinc-50/50 dark:bg-white/[0.02] border-t border-zinc-100 dark:border-white/[0.04] flex gap-2">
                        {isAuthorizedToEdit && (
                            <>
                                <Button
                                    variant="ghost"
                                    onClick={handleDelete}
                                    className="h-10 flex-1 rounded-xl bg-transparent border border-zinc-200 dark:border-white/10 font-bold uppercase text-[9px] tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-all shadow-none"
                                >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete Task
                                </Button>
                                <Button
                                    onClick={handleEdit}
                                    className="h-10 flex-1 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold uppercase text-[9px] tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:opacity-100 transition-all active:scale-95 shadow-sm"
                                >
                                    <FilePenLine className="w-3 h-3 mr-2" />
                                    Modify Steps
                                </Button>
                            </>
                        )}
                        {!isAuthorizedToEdit && (
                            <Button
                                onClick={onClose}
                                className="h-10 w-full rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold uppercase text-[9px] tracking-[0.2em] transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.98] shadow-sm"
                            >
                                <BadgeCheck className="w-3.5 h-3.5 mr-2" />
                                Acknowledged
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TaskDetailModal;
