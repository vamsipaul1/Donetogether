import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import {
    Plus, ChevronDown, CheckCircle2, User, Calendar,
    MoreHorizontal, ArrowUp, GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Task, User as UserType, ProjectMember } from '@/types/database';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ProofSubmissionModal from '@/components/dashboard/ProofSubmissionModal';

interface TaskListProps {
    tasks: Task[];
    members: (ProjectMember & { users?: UserType })[];
    currentUserId: string;
    isOwner: boolean;
    onTasksUpdated: () => void;

    onAddTask: () => void;
    onEditTask: (task: Task) => void;
}


const TaskList = ({ tasks, members, currentUserId, isOwner, onTasksUpdated, onAddTask, onEditTask }: TaskListProps) => {
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [taskForProof, setTaskForProof] = useState<Task | null>(null);

    // Group tasks by status (To do, Doing, Done)
    const sections = [
        { id: 'not_started', title: 'To do', color: 'text-zinc-500' },
        { id: 'in_progress', title: 'Doing', color: 'text-blue-400' },
        { id: 'completed', title: 'Done', color: 'text-emerald-400' },
    ];

    const handleTaskChange = async (taskId: string, updates: Partial<Task>) => {
        // Intercept completion
        if (updates.status === 'completed') {
            const currentUserMember = members.find(m => m.user_id === currentUserId);
            const canVerify = isOwner || currentUserMember?.can_verify_tasks;

            if (!canVerify) {
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    setTaskForProof(task);
                    setIsProofModalOpen(true);
                }
                return;
            }
        }

        try {
            const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
            if (error) throw error;
            onTasksUpdated();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to update task');
        }
    };



    // Copy the rest of the component body, ensuring we insert the Modal at the end

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to move this task to history?')) return;
        try {
            const { error } = await supabase.from('tasks').update({ status: 'deleted' }).eq('id', taskId);
            if (error) throw error;
            toast.success('Task moved to history');
            onTasksUpdated();
        } catch (err: unknown) {
            toast.error('Failed to move task to history: ' + (err instanceof Error ? err.message : 'Unknown error'));
            console.error(err);
        }
    };

    // Filtered and Sorted Tasks Memoization
    const sectionTasks = useMemo(() => {
        const map: Record<string, Task[]> = {
            not_started: [],
            in_progress: [],
            completed: []
        };
        tasks.filter(t => t.status !== 'deleted').forEach(task => {
            if (map[task.status]) map[task.status].push(task);
        });

        // Sort each section by due date for consistent display
        Object.keys(map).forEach(key => {
            map[key].sort((a, b) => {
                const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                return dateA - dateB;
            });
        });

        return map;
    }, [tasks]);

    return (
        <div className="bg-transparent h-full overflow-y-auto overflow-x-auto">
            {/* Mobile Card View */}
            <div className="md:hidden pb-24 px-4 space-y-6">
                {sections.map(section => (
                    <div key={section.id} className="space-y-3">
                        <div className="flex items-center gap-2 py-2 sticky top-0 bg-[#F9F8F6] dark:bg-black z-10 backdrop-blur-sm">
                            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{section.title}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                {sectionTasks[section.id].length}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {sectionTasks[section.id].map(task => {
                                const assignee = members.find(m => m.user_id === task.assigned_to)?.users;
                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => isOwner && onEditTask(task)}
                                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-start gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isOwner || task.assigned_to === currentUserId) {
                                                            handleTaskChange(task.id, { status: task.status === 'completed' ? 'not_started' : 'completed' });
                                                        }
                                                    }}
                                                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${task.status === 'completed'
                                                            ? 'bg-emerald-500 border-emerald-500'
                                                            : 'border-zinc-300 dark:border-zinc-700'
                                                        }`}
                                                >
                                                    {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                </button>
                                                <div>
                                                    <h4 className={`font-bold text-[15px] leading-snug ${task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-white'}`}>
                                                        {task.title}
                                                    </h4>
                                                    {/* Mobile Priority Badge */}
                                                    <div className="mt-1.5 flex flex-wrap gap-2">
                                                        <PriorityBadge priority={task.priority} />
                                                    </div>
                                                </div>
                                            </div>

                                            {isOwner && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-1 -mr-2 text-zinc-400">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                                        <DropdownMenuItem onClick={() => onEditTask(task)} className="text-xs font-medium cursor-pointer rounded-lg p-2">
                                                            Edit task
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-xs font-medium cursor-pointer rounded-lg p-2 text-red-500">
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                                            <div className="flex items-center gap-2">
                                                {assignee ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
                                                            {assignee.email?.[0]?.toUpperCase()}
                                                        </div>
                                                        <span className="text-xs text-zinc-500 max-w-[80px] truncate">{assignee.full_name?.split(' ')[0]}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-zinc-400">
                                                        <User className="w-4 h-4" />
                                                        <span className="text-xs">Unassigned</span>
                                                    </div>
                                                )}
                                            </div>

                                            {task.due_date && (
                                                <div className={`flex items-center gap-1.5 text-xs font-medium ${new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== 'completed'
                                                        ? 'text-rose-500'
                                                        : 'text-zinc-500'
                                                    }`}>
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block pb-20">
                {/* Table Header */}
                <div className="flex items-center px-6 py-2 border-b border-zinc-200/50 dark:border-white/5 text-[11px] font-bold text-zinc-500 uppercase sticky top-0 bg-background/50 dark:bg-black/50 backdrop-blur-md z-10 min-w-[900px]">
                    <div className="flex-[4] px-4">Name</div>
                    <div className="flex-1 px-4">Assignee</div>
                    <div className="flex-1 px-4 pl-8">Start date</div>
                    <div className="flex-1 px-4 pl-8">Due date</div>
                    <div className="flex-1 px-4">Priority</div>
                    <div className="flex-1 px-4">Status</div>
                    <div className="w-10"></div>
                </div>

                {sections.map(section => (
                    <div key={section.id} className="pt-4">
                        <div className="px-6 py-2 flex items-center gap-2 group cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/20 transition-colors">
                            <ChevronDown className="w-4 h-4 text-zinc-500" />
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-200">{section.title}</h3>
                            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-600 ml-2">
                                {sectionTasks[section.id].length}
                            </span>
                        </div>

                        <div className="mt-1">
                            {sectionTasks[section.id].map(task => {
                                const assignee = members.find(m => m.user_id === task.assigned_to)?.users;
                                return (
                                    <div key={task.id} className="flex items-center px-6 border-y border-transparent hover:border-zinc-200/50 dark:hover:border-white/5 hover:bg-white/40 dark:hover:bg-zinc-900/40 group transition-all h-12 min-w-[900px]">
                                        {/* Name Row */}
                                        <div className="flex-[4] flex items-center gap-3 min-w-20 pr-4">
                                            {isOwner && (
                                                <div className="opacity-0 group-hover:opacity-100 cursor-grab">
                                                    <GripVertical className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                                                </div>
                                            )}
                                            <button
                                                onClick={() => (isOwner || task.assigned_to === currentUserId) && handleTaskChange(task.id, { status: task.status === 'completed' ? 'not_started' : 'completed' })}
                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed'
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-500'
                                                    } ${(isOwner || task.assigned_to === currentUserId) ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
                                            >
                                                {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </button>
                                            <span className={`text-sm truncate ${task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-200'}`}>
                                                {task.title}
                                            </span>
                                        </div>

                                        {/* Assignee Row */}
                                        <div className="flex-1 px-4 flex items-center gap-2 overflow-hidden">
                                            {assignee ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white">
                                                        {assignee.email?.[0]}
                                                    </div>
                                                    <span className="text-xs text-zinc-600 dark:text-zinc-500 truncate hidden xl:inline">{assignee.full_name || assignee.email?.split('@')[0]}</span>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 cursor-pointer">
                                                    <User className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Start Date Row */}
                                        <div className="flex-1 px-4 pl-8 font-medium text-xs text-zinc-500 whitespace-nowrap">
                                            {task.start_date ? new Date(task.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                                        </div>

                                        {/* Due Date Row */}
                                        <div className="flex-1 px-4 pl-8 font-medium text-xs whitespace-nowrap">
                                            {task.due_date ? (
                                                <span className={`${new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== 'completed'
                                                    ? 'text-rose-500 font-bold'
                                                    : new Date(task.due_date).toDateString() === new Date().toDateString() && task.status !== 'completed'
                                                        ? 'text-amber-500 font-bold'
                                                        : 'text-zinc-500'
                                                    }`}>
                                                    {new Date(task.due_date) < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== 'completed'
                                                        ? 'Overdue'
                                                        : new Date(task.due_date).toDateString() === new Date().toDateString() && task.status !== 'completed'
                                                            ? 'Due Today'
                                                            : new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-500">Set date</span>
                                            )}
                                        </div>

                                        {/* Priority Row */}
                                        <div className="flex-1 px-4">
                                            <PriorityBadge priority={task.priority} />
                                        </div>

                                        {/* Status Row */}
                                        <div className="flex-1 px-4">
                                            <StatusBadge status={task.status} />
                                        </div>

                                        {/* Options */}
                                        <div className="w-10 flex justify-end">
                                            {isOwner && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="opacity-0 group-hover:opacity-100 p-10 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 transition-all">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 rounded-xl ml-10 p-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                                        <DropdownMenuItem onClick={() => onEditTask(task)} className="text-xs font-medium cursor-pointer rounded-lg p-2 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                                                            Edit task
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-xs font-medium cursor-pointer rounded-lg p-2 focus:bg-zinc-100 dark:focus:bg-zinc-800 text-red-500 focus:text-red-500">
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <ProofSubmissionModal
                isOpen={isProofModalOpen}
                onClose={() => setIsProofModalOpen(false)}
                task={taskForProof}
                currentUserId={currentUserId}
                onSubmitted={() => {
                    toast.info("Proof submitted. Waiting for review.");
                }}
            />
        </div>
    );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors: Record<string, string> = {
        high: 'bg-red-500/20 text-red-500 border border-red-500/30',
        medium: 'bg-amber-500/20 text-amber-500 border border-amber-500/30',
        low: 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30',
    };
    return (
        <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase ${colors[priority]}`}>
            {priority}
        </span>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        completed: 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30',
        in_progress: 'bg-blue-500/20 text-blue-500 border border-blue-500/30',
        not_started: 'bg-zinc-800 text-zinc-500 border border-zinc-700',
    };
    const labels: Record<string, string> = {
        completed: 'Done',
        in_progress: 'Doing',
        not_started: 'To do',
    };
    return (
        <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase ${colors[status]}`}>
            {labels[status]}
        </span>
    );
};

export default TaskList;
