import { motion } from 'framer-motion';
import { History, RefreshCcw, Trash2 } from 'lucide-react';
import type { Task, ProjectMember, User } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface HistoryViewProps {
    tasks: Task[];
    members: (ProjectMember & { users?: User })[];
    onTasksUpdated: () => void;
}

const HistoryView = ({ tasks, members, onTasksUpdated }: HistoryViewProps) => {
    // Filter for deleted tasks - assuming we will implement a soft delete 'deleted' status
    const deletedTasks = tasks.filter(t => t.status === 'deleted').sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    const handleRestoreTask = async (taskId: string) => {
        try {
            const { error } = await supabase.from('tasks').update({ status: 'not_started' }).eq('id', taskId);
            if (error) throw error;
            toast.success('Task restored to To Do');
            onTasksUpdated();
        } catch (err: any) {
            toast.error('Failed to restore task');
        }
    };

    const handlePermanentDelete = async (taskId: string) => {
        if (!confirm('This will permanently delete the task. Cannot be undone.')) return;
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', taskId);
            if (error) throw error;
            toast.success('Task permanently deleted');
            onTasksUpdated();
        } catch (err: any) {
            toast.error('Failed to delete task');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto font-sans h-full flex flex-col">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                    <History className="w-6 h-6 text-zinc-400" />
                    Task History
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                    Restore deleted tasks or delete them permanently to clear clutter
                </p>
            </header>

            <div className="flex-1 bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-[#333] overflow-hidden flex flex-col dotted-pattern shadow-sm">
                <div className="p-6 border-b border-zinc-100 dark:border-[#333] flex items-center justify-between">
                    <h2 className="font-bold text-zinc-900 dark:text-white">Deleted Tasks ({deletedTasks.length})</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {deletedTasks.length > 0 ? (
                        <div className="space-y-2">
                            {deletedTasks.map(task => {
                                const assignee = members.find(m => m.user_id === task.assigned_to)?.users;
                                return (
                                    <div key={task.id} className="group flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                                        <div className="space-y-1">
                                            <p className="font-bold text-zinc-700 dark:text-zinc-300 line-through decoration-zinc-400">{task.title}</p>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                <span>Deleted on {new Date(task.updated_at).toLocaleDateString()}</span>
                                                {assignee && (
                                                    <span className="flex items-center gap-1">
                                                        was assigned to <span className="font-bold">{assignee.full_name || assignee.email}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleRestoreTask(task.id)}
                                                className="p-2 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-500 dark:hover:bg-emerald-500/20 transition-colors"
                                                title="Restore Task"
                                            >
                                                <RefreshCcw className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handlePermanentDelete(task.id)}
                                                className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20 transition-colors"
                                                title="Permanently Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                            <Trash2 className="w-12 h-12 mb-4 opacity-20" />
                            <p>No deleted tasks found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryView;
