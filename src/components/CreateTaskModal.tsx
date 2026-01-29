import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BadgeQuestionMark, Calendar, User, AlertCircle, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { TASK_SUGGESTIONS, type TaskPriority, type Task } from '@/types/database';
import type { ProjectMember, User as UserType } from '@/types/database';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
    projectId: string;
    projectDomain: string;
    members: (ProjectMember & { users?: UserType })[];
    currentUserId: string;
    task?: Task | null;
    projectStartDate?: string;
    projectEndDate?: string;
}

const CreateTaskModal = ({
    isOpen,
    onClose,
    onTaskCreated,
    projectId,
    projectDomain,
    members,
    currentUserId,
    task,
    projectStartDate,
    projectEndDate,
}: CreateTaskModalProps) => {
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(!task);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium' as TaskPriority,
        startDate: '',
        dueDate: '',
    });

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                assignedTo: task.assigned_to || '',
                priority: task.priority || 'medium',
                startDate: task.start_date || '',
                dueDate: task.due_date || '',
            });
            setShowSuggestions(false);
        } else {
            setFormData({
                title: '',
                description: '',
                assignedTo: '',
                priority: 'medium' as TaskPriority,
                startDate: '',
                dueDate: '',
            });
            setShowSuggestions(true);
        }
    }, [task, isOpen]);

    const suggestions = TASK_SUGGESTIONS[projectDomain] || TASK_SUGGESTIONS['Other'];

    const handleSuggestionClick = (suggestion: string) => {
        setFormData({ ...formData, title: suggestion });
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.assignedTo || !formData.dueDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Project timeline validation
        // Project timeline validation
        if (projectStartDate && projectEndDate) {
            const taskDue = new Date(formData.dueDate);
            const projStart = new Date(projectStartDate);
            const projEnd = new Date(projectEndDate);

            // Validate Start Date if present
            if (formData.startDate) {
                const taskStart = new Date(formData.startDate);
                if (taskStart < projStart || taskStart > projEnd) {
                    toast.error(`Task start date must be between ${projStart.toLocaleDateString()} and ${projEnd.toLocaleDateString()}`);
                    return;
                }
                if (taskStart > taskDue) {
                    toast.error('Task start date cannot be after due date');
                    return;
                }
            }

            // Validate Due Date
            if (taskDue < projStart || taskDue > projEnd) {
                toast.error(`Task due date must be between ${projStart.toLocaleDateString()} and ${projEnd.toLocaleDateString()} (Project Timeline)`);
                return;
            }
        } else if (formData.startDate && formData.dueDate) {
            // Basic validation if project dates aren't enforced yet
            if (new Date(formData.startDate) > new Date(formData.dueDate)) {
                toast.error('Task start date cannot be after due date');
                return;
            }
        }

        setLoading(true);

        try {
            if (task) {
                const { error } = await supabase
                    .from('tasks')
                    .update({
                        title: formData.title,
                        description: formData.description || null,
                        assigned_to: formData.assignedTo,
                        priority: formData.priority,
                        start_date: formData.startDate || null,
                        due_date: formData.dueDate,
                    })
                    .eq('id', task.id);
                if (error) throw error;
                toast.success('Task updated successfully!');
            } else {
                const { error } = await supabase.from('tasks').insert({
                    project_id: projectId,
                    title: formData.title,
                    description: formData.description || null,
                    assigned_to: formData.assignedTo,
                    assigned_by: currentUserId,
                    priority: formData.priority,
                    start_date: formData.startDate || null,
                    due_date: formData.dueDate,
                    status: 'not_started',
                });
                if (error) throw error;
                toast.success('Task created successfully!');
            }



            // Success message handled above
            onTaskCreated();
            onClose();

            // Reset form
            setFormData({
                title: '',
                description: '',
                assignedTo: '',
                priority: 'medium',
                startDate: '',
                dueDate: '',
            });
            setShowSuggestions(true);
        } catch (error: any) {
            console.error('Error creating task:', error);
            toast.error(error.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-none w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md shrink-0">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/20">
                                    <img src="/image copy 4.png" alt="New Task" className="w-6 h-6 invert brightness-0 dark:brightness-200" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white uppercase">{task ? 'Refine Task' : 'New Task'}</h2>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{task ? 'Refine Task' : 'New Task details'}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-4 h-4 text-zinc-400" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                        <div className="p-5 space-y-5">
                            {/* Task Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <BadgeQuestionMark className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Suggestions for {projectDomain}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.slice(0, 4).map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="group relative px-3 py-1.5 bg-white dark:bg-zinc-800/100 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-300 transition-all text-left shadow-sm"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="w-3 h-3 text-zinc-400 group-hover:text-violet-500 transition-colors" />
                                                    <span className="truncate max-w-[200px]">{suggestion}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Task Title */}
                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Task Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Build user authentication"
                                    className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus:ring-violet-500 font-semibold text-sm"
                                    value={formData.title}
                                    onChange={(e) => {
                                        setFormData({ ...formData, title: e.target.value });
                                        setShowSuggestions(false);
                                    }}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Add details, requirements, or notes..."
                                    className="min-h-[80px] rounded-xl resize-none bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus:ring-violet-500 font-medium text-sm"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Assign To */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <Label htmlFor="assignedTo" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Assign To *</Label>
                                    <Select
                                        value={formData.assignedTo}
                                        onValueChange={(val) => setFormData({ ...formData, assignedTo: val })}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 font-medium text-sm">
                                            <SelectValue placeholder="Select member">
                                                {formData.assignedTo && (
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-3.5 h-3.5" />
                                                        <span className="truncate">
                                                            {members.find((m) => m.user_id === formData.assignedTo)?.users?.full_name?.split(' ')[0] ||
                                                                members.find((m) => m.user_id === formData.assignedTo)?.users?.email?.split('@')[0]}
                                                        </span>
                                                    </div>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {members.map((member) => (
                                                <SelectItem key={member.user_id} value={member.user_id}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                            {member.users?.full_name?.[0] || member.users?.email?.[0] || '?'}
                                                        </div>
                                                        <span className="text-sm">
                                                            {member.users?.full_name || member.users?.email}
                                                            {member.user_id === currentUserId && ' (You)'}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <Label htmlFor="priority" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(val) => setFormData({ ...formData, priority: val as TaskPriority })}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 font-bold uppercase text-[10px] tracking-widest">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full font-bold text-[10px] tracking-widest bg-blue-500" />
                                                    LOW
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full font-bold text-[10px] tracking-widest bg-yellow-500" />
                                                    MEDIUM
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="high">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                                    HIGH
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="startDate" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Start Date</Label>
                                    <div className="relative">
                                        <Input
                                            id="startDate"
                                            type="date"
                                            className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 font-medium text-xs uppercase"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="dueDate" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Due Date *</Label>
                                    <div className="relative">
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 font-medium text-xs uppercase"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 dark:text-blue-200 leading-relaxed">
                                    Members can update status. Only you can edit/delete.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 bg-zinc-50/30 dark:bg-zinc-900/30 shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                className="flex-1 h-11 rounded-xl font-bold uppercase text-[11px] text-zinc-500 hover:text-zinc-600 tracking-widest"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] h-11 rounded-xl font-bold uppercase text-[11px] tracking-widest bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {loading ? (task ? 'Syncing...' : 'Initiating...') : (task ? 'Update' : 'Create Task')}
                            </Button>
                        </div>
                    </form>

                </motion.div>
            </div>

        </AnimatePresence >
    );
};

export default CreateTaskModal;
