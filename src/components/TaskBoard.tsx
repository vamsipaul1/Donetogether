import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, Circle, Ban, AlertCircle, MoreHorizontal, Calendar, ArrowUpCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Task, User as UserType, TaskStatus, ProjectMember } from '@/types/database';

interface TaskWithUser extends Task {
    assignedUser?: UserType;
    assignedByUser?: UserType;
}

interface TaskBoardProps {
    tasks: TaskWithUser[];
    members: (ProjectMember & { users?: UserType })[];
    currentUser: UserType | null;
    isOwner: boolean;
    onTaskUpdate: () => void;
}

const TABS = [
    { id: 'all', label: 'All Tasks' },
    { id: 'not_started', label: 'Not Started' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'blocked', label: 'Blocked' },
];

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: any; color: string }> = {
    not_started: { label: 'Not Started', icon: Circle, color: 'text-zinc-400' },
    in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-500' },
    completed: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500' },
    blocked: { label: 'Blocked', icon: Ban, color: 'text-red-500' },
    deleted: { label: 'Deleted', icon: Trash2, color: 'text-zinc-500' },
};

const PRIORITY_CONFIG = {
    low: { color: 'bg-blue-400', label: 'Low' },
    medium: { color: 'bg-amber-400', label: 'Medium' },
    high: { color: 'bg-red-500', label: 'High' },
};

const TaskBoard = ({ tasks, members, currentUser, isOwner, onTaskUpdate }: TaskBoardProps) => {
    const [activeTab, setActiveTab] = useState('all');

    const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null })
                .eq('id', taskId);

            if (error) throw error;
            toast.success(`Task marked as ${STATUS_CONFIG[newStatus].label}`);
            onTaskUpdate();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getDaysUntilDue = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'all') return true;
        return task.status === activeTab;
    });

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <Clock className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">No tasks created yet</h3>
                <p className="text-zinc-500 max-w-sm mt-2">
                    {isOwner ? 'Create your first task to get the team started!' : 'Waiting for the team lead to assign tasks.'}
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 min-h-full">
            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide mb-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg scale-105'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredTasks.map((task, idx) => {
                        const StatusIcon = STATUS_CONFIG[task.status].icon;
                        const daysUntil = getDaysUntilDue(task.due_date);
                        const isOverdue = daysUntil < 0 && task.status !== 'completed';
                        const canEdit = isOwner || task.assigned_to === currentUser?.id;

                        return (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`group relative bg-white dark:bg-zinc-900 rounded-2xl p-5 border transition-all duration-300 ${isOverdue
                                    ? 'border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10'
                                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Priority Line */}
                                    <div className={`w-1.5 self-stretch rounded-full ${PRIORITY_CONFIG[task.priority].color}`} />

                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className={`text-lg font-bold truncate pr-4 ${task.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                    {task.title}
                                                </h3>
                                                {task.description && (
                                                    <p className="text-zinc-500 text-sm mt-1 line-clamp-1">{task.description}</p>
                                                )}
                                            </div>

                                            {/* Status Badge */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild disabled={!canEdit}>
                                                    <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${canEdit ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer' : 'cursor-default'
                                                        } ${STATUS_CONFIG[task.status].color}`}>
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        <span>{STATUS_CONFIG[task.status].label}</span>
                                                    </button>
                                                </DropdownMenuTrigger>
                                                {canEdit && (
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => {
                                                            const Config = STATUS_CONFIG[status];
                                                            const Icon = Config.icon;
                                                            return (
                                                                <DropdownMenuItem
                                                                    key={status}
                                                                    onClick={() => handleStatusUpdate(task.id, status)}
                                                                    className="gap-2"
                                                                >
                                                                    <Icon className={`w-4 h-4 ${Config.color.replace('text-', 'text-')}`} />
                                                                    {Config.label}
                                                                </DropdownMenuItem>
                                                            );
                                                        })}
                                                    </DropdownMenuContent>
                                                )}
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center flex-wrap gap-4 mt-4">
                                            {/* Assignee */}
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-[11px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900">
                                                    {task.assignedUser?.email?.[0].toUpperCase() || '?'}
                                                </div>
                                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                    {task.assignedUser?.full_name?.split(' ')[0] || task.assignedUser?.email?.split('@')[0]}
                                                    {task.assigned_to === currentUser?.id && ' (You)'}
                                                </span>
                                            </div>

                                            {/* Due Date */}
                                            <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-zinc-500'
                                                }`}>
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>
                                                    {formatDate(task.due_date)} {daysUntil === 0 ? '(Today)' : daysUntil === 1 ? '(Tomorrow)' : ''}
                                                </span>
                                            </div>

                                            {/* Priority Label */}
                                            <div className="flex items-center gap-1.5">
                                                <ArrowUpCircle className={`w-3.5 h-3.5 ${PRIORITY_CONFIG[task.priority].color.replace('bg-', 'text-')}`} />
                                                <span className="text-xs font-bold uppercase text-zinc-400">
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredTasks.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-zinc-400 italic">No tasks in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskBoard;
