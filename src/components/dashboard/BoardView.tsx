import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Plus, MoreHorizontal, MessageSquare, Paperclip,
    Clock, CheckCircle2, ChevronDown, Filter,
    ArrowDownAZ, Layers, Settings2, Search, Calendar, Trash2, Edit2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProofSubmissionModal from '@/components/dashboard/ProofSubmissionModal';
import type { Task, ProjectMember, User as UserType, TaskStatus } from '@/types/database';

interface BoardViewProps {
    tasks: Task[];
    members: (ProjectMember & { users?: UserType })[];
    currentUserId: string;
    isOwner: boolean;
    onTasksUpdated: () => void;
    onAddTask: () => void;
    onEditTask: (task: Task) => void;
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
    { id: 'not_started', label: 'To do' },
    { id: 'in_progress', label: 'Doing' },
    { id: 'completed', label: 'Done' },
];

const BoardView = ({ tasks, members, currentUserId, isOwner, onTasksUpdated, onAddTask, onEditTask }: BoardViewProps) => {
    const [optimisticTasks, setOptimisticTasks] = useState(tasks);
    const [isProofModalOpen, setIsProofModalOpen] = useState(false);
    const [taskForProof, setTaskForProof] = useState<Task | null>(null);

    // Sync optimistic state when props change (revalidation)
    useEffect(() => {
        setOptimisticTasks(tasks);
    }, [tasks]);

    // Generate deterministic but varied colors based on creation order
    const taskColors = useMemo(() => {
        // Sort by creation date to ensure stability
        const sortedIds = [...tasks]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map(t => t.id);

        const colorPalette = [
            'bg-violet-200 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800/50',
            'bg-blue-200 dark:bg-blue-900/55 border-blue-200 dark:border-blue-800/50',
            'bg-pink-200 dark:bg-pink-900/55 border-pink-200 dark:border-pink-800/50',
            'bg-yellow-200 dark:bg-yellow-900/55 border-yellow-200 dark:border-yellow-800/50',
            'bg-green-200 dark:bg-green-900/55 border-green-200 dark:border-green-800/50',
            'bg-orange-200 dark:bg-orange-900/55 border-orange-200 dark:border-orange-800/50',
            'bg-rose-200 dark:bg-rose-900/55 border-rose-200 dark:border-rose-800/50',
            'bg-stone-200 dark:bg-stone-900/55 border-stone-200 dark:border-stone-800/50',
            'bg-cyan-200 dark:bg-cyan-900/55 border-cyan-200 dark:border-cyan-800/50',
            'bg-teal-200 dark:bg-teal-900/55 border-teal-200 dark:border-teal-800/50',
            'bg-emerald-200 dark:bg-emerald-900/55 border-emerald-200 dark:border-emerald-800/50',
            'bg-violet-200 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800/50',
            'bg-blue-200 dark:bg-blue-900/55 border-blue-200 dark:border-blue-800/50',
            'bg-pink-200 dark:bg-pink-900/55 border-pink-200 dark:border-pink-800/50',
            'bg-green-200 dark:bg-green-900/55 border-green-200 dark:border-green-800/50',
            'bg-indigo-200 dark:bg-indigo-900/55 border-indigo-200 dark:border-indigo-800/50',
            'bg-lime-200 dark:bg-lime-900/55 border-lime-200 dark:border-lime-800/50',
            'bg-amber-200 dark:bg-amber-900/55 border-amber-200 dark:border-amber-800/50',
            'bg-red-200 dark:bg-red-900/55 border-red-200 dark:border-red-800/50',
            'bg-fuchsia-200 dark:bg-fuchsia-900/55 border-fuchsia-200 dark:border-fuchsia-800/50',
            'bg-purple-200 dark:bg-purple-900/55 border-purple-200 dark:border-purple-800/50',
            'bg-slate-200 dark:bg-slate-900/55 border-slate-200 dark:border-slate-800/50',
        ];

        const map: Record<string, string> = {};
        sortedIds.forEach((id, index) => {
            map[id] = colorPalette[index % colorPalette.length];
        });
        return map;
    }, [tasks]);

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;
        const { draggableId, destination } = result;
        const task = optimisticTasks.find(t => t.id === draggableId);

        // Check if user has permission to move this task
        const currentUserMember = members.find(m => m.user_id === currentUserId);
        const hasPermission = isOwner || (task && task.assigned_to === currentUserId);

        if (!hasPermission) {
            toast.error('You can only move tasks assigned to you');
            return;
        }

        const newStatus = destination.droppableId as TaskStatus;

        // PROOF OF WORK CHECK
        const canVerify = isOwner || currentUserMember?.can_verify_tasks;

        // If moving to completed AND not authorized to verify, require proof
        if (newStatus === 'completed' && !canVerify) {
            if (task) {
                setTaskForProof(task);
                setIsProofModalOpen(true);
            }
            return;
        }

        // 1. Optimistic Update
        const updatedTasks = optimisticTasks.map(t =>
            t.id === draggableId ? { ...t, status: newStatus } : t
        );
        setOptimisticTasks(updatedTasks);

        // 2. Network Request
        const movePromise = async () => {
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', draggableId);

            if (error) throw error;
            onTasksUpdated(); // Background revalidation
        };

        toast.promise(movePromise(), {
            loading: 'Updating status...',
            success: 'Status updated',
            error: (err) => {
                console.error('Move error:', err);
                setOptimisticTasks(tasks); // Revert on error
                return 'Failed to sync status';
            }
        });
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

    const getTaskColor = (taskId: string) => {
        return taskColors[taskId] || 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800';
    };

    return (
        <div className="h-full flex flex-col bg-background dark:bg-black font-sans dotted-pattern">
            {/* Board Header */}
            <header className="px-4 md:px-6 h-14 flex items-center justify-between border-b border-zinc-200/50 dark:border-white/5 bg-background/50 dark:bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-20 overflow-x-auto scrollbar-hide shrink-0">
                <div className="flex items-center gap-3 md:gap-6 min-w-max">
                    {isOwner && (
                        <button onClick={onAddTask} className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[9px] md:text-[10px] font-black hover:scale-105 transition-all uppercase shadow-lg shadow-zinc-500/20">
                            <img src="/image copy 4.png" alt="" className="w-3.5 h-3.5 invert brightness-0 dark:brightness-200" /> <span className="hidden sm:inline">Add task</span><span className="sm:hidden">Add</span>
                        </button>
                    )}
                    <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />
                    <h2 className="text-xs md:text-sm font-black text-zinc-900 dark:text-white uppercase shrink-0">Operation Board</h2>
                </div>
                <div className="flex items-center gap-1.5 md:gap-3 ml-4">
                    <button className="flex items-center gap-1 text-[10px] font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase px-2 py-1 rounded-md">
                        <Filter className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Filter</span>
                    </button>
                    <button className="flex items-center gap-1 text-[10px] font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase px-2 py-1 rounded-md">
                        <ArrowDownAZ className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sort</span>
                    </button>
                    <button className="flex items-center gap-1 text-[10px] font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase px-2 py-1 rounded-md">
                        <Layers className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Group</span>
                    </button>
                </div>
            </header>

            {/* Board Content */}
            <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-hide p-4 md:p-6 snap-x snap-mandatory">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-3 md:gap-6 h-full min-w-max pb-2 md:pb-4">
                        {COLUMNS.map((col) => (
                            <div key={col.id} className="w-[80vw] sm:w-80 flex flex-col h-full bg-white/40 dark:bg-zinc-900/40 rounded-[32px] p-4 md:p-5 border border-white dark:border-white/5 snap-center shadow-sm">
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-black text-sm text-zinc-900 dark:text-zinc-100 uppercase">{col.label}</h3>
                                        <span className="text-[10px] font-black text-zinc-500 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-md shadow-sm">
                                            {tasks.filter(t => t.status === col.id).length}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {isOwner && (
                                            <button onClick={onAddTask} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
                                                <img src="/image copy 4.png" alt="" className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                                            </button>
                                        )}

                                    </div>
                                </div>

                                {/* Drag Area */}
                                <Droppable droppableId={col.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 overflow-y-auto overflow-x-hidden space-y-3 min-h-[100px] transition-colors rounded-2xl pr-2 -mr-2 custom-scrollbar ${snapshot.isDraggingOver ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : ''}`}
                                        >
                                            {optimisticTasks
                                                .filter((t) => t.status === col.id)
                                                .map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={!(isOwner || task.assigned_to === currentUserId)}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`p-5 rounded-[22px] shadow-sm border group hover:shadow-md transition-all ${snapshot.isDragging ? 'rotate-2 shadow-xl scale-105 z-50' : ''} ${getTaskColor(task.id)}`}
                                                                style={provided.draggableProps.style}
                                                            >
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase bg-white/50 dark:bg-black/20 ${task.priority === 'high' ? 'text-rose-600 dark:text-rose-400' :
                                                                        task.priority === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                                                                            'text-emerald-600 dark:text-emerald-400'
                                                                        }`}>
                                                                        {task.priority || 'NORMAL'}
                                                                    </div>

                                                                    <div className="flex justify-end relative z-10">
                                                                        {isOwner && (
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <button className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 transition-all rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                                    </button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm z-50">
                                                                                    <DropdownMenuItem onClick={() => onEditTask(task)} className="text-xs font-medium cursor-pointer rounded-lg p-2 focus:bg-zinc-100 dark:focus:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                                                                        Edit task
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-xs font-medium cursor-pointer rounded-lg p-2 focus:bg-zinc-100 dark:focus:bg-zinc-800 text-rose-500 focus:text-rose-600">
                                                                                        Delete
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 leading-tight">{task.title}</h4>

                                                                <div className="flex items-center justify-between mt-auto">
                                                                    <div className="flex items-center gap-2 max-w-[160px]">
                                                                        {(() => {
                                                                            const member = members.find(m => m.user_id === task.assigned_to);
                                                                            if (!member) return null;
                                                                            const name = member.users?.full_name || member.users?.email?.split('@')[0] || 'Member';
                                                                            return (
                                                                                <>
                                                                                    <div className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[8px] font-black text-zinc-700 dark:text-zinc-300 shadow-sm shrink-0">
                                                                                        {member.users?.email?.[0]?.toUpperCase() || '?'}
                                                                                    </div>
                                                                                    <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 truncate">
                                                                                        {name}
                                                                                    </span>
                                                                                </>
                                                                            );
                                                                        })()}
                                                                    </div>

                                                                    {task.due_date && (
                                                                        <div className={`flex items-center gap-1.5 text-[12px] font-bold ${new Date(task.due_date) < new Date() ? 'text-rose-500 dark:text-rose-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                                                            <Calendar className="w-3 h-3" />
                                                                            <span>{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            {provided.placeholder}
                                            {isOwner && (
                                                <button
                                                    onClick={() => {
                                                        onAddTask();
                                                    }}
                                                    className="w-full py-3 md:py-4 rounded-[20px] border-2 border-dashed border-zinc-200/80 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 group mt-2"
                                                >
                                                    <img src="/image copy 4.png" alt="" className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all group-hover:invert group-hover:brightness-0 dark:group-hover:brightness-200" />
                                                    <span className="text-[9px] md:text-[10px] font-black uppercase">Add Task</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext >
            </div >

            <ProofSubmissionModal
                isOpen={isProofModalOpen}
                onClose={() => setIsProofModalOpen(false)}
                task={taskForProof}
                currentUserId={currentUserId}
                onSubmitted={() => {
                    // Status stays as is, but notification is sent (via DB record)
                    toast.info("Task completion under review by project lead");
                }}
            />
        </div >
    );
};

const HeaderButton = ({ icon: Icon, label }: any) => (
    <button className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-lg">
        <Icon className="w-3.5 h-3.5" />
        <span className="hidden md:inline">{label}</span>
    </button>
);

export default BoardView;
