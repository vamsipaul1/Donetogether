import { motion } from 'framer-motion';
import {
    Sparkles, Info, Users, Clock, CheckCircle2,
    AlertCircle, PlayCircle, MoreHorizontal, FileText, ListTodo,
    Lock, Edit3, Calendar as CalendarIcon, Target,
    Trophy, Zap, ShieldCheck, ChevronRight, Activity, Save, X as XIcon, Crown
} from 'lucide-react';
import type { Project, ProjectMember, Task, User } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface OverviewProps {
    project: Project;
    members: (ProjectMember & { users?: User })[];
    tasks: Task[];
    onProjectUpdated?: () => void;
    isOwner?: boolean;
}

import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

const Overview = ({ project, members, tasks, onProjectUpdated, isOwner }: OverviewProps) => {
    const [projectGoal, setProjectGoal] = useState(project.goal || '');
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [isSavingGoal, setIsSavingGoal] = useState(false);
    const [projectStatus, setProjectStatus] = useState<'on_track' | 'at_risk' | 'off_track'>('on_track');

    // Sync state if props change
    useEffect(() => {
        setProjectGoal(project.goal || '');
    }, [project]);

    const updateProject = async (updates: any) => {
        try {
            console.log('Updating project with:', updates);

            const { data, error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', project.id)
                .select()
                .single();

            if (error) {
                console.error('Update error:', error);
                throw error;
            }

            console.log('Update successful:', data);
            toast.success('Project updated successfully!');

            if (onProjectUpdated) {
                onProjectUpdated();
            }

            return true;
        } catch (error: any) {
            console.error('Failed to update project:', error);
            toast.error(error.message || 'Failed to update project');
            return false;
        }
    };

    const handleSaveGoal = async () => {
        // Prevent double submissions
        if (isSavingGoal) return;

        // Validate input
        if (projectGoal.trim().length === 0) {
            toast.error('Please enter a project description');
            return;
        }

        if (projectGoal.trim().length > 1000) {
            toast.error('Description is too long (max 1000 characters)');
            return;
        }

        setIsSavingGoal(true);
        const success = await updateProject({ goal: projectGoal.trim() });
        setIsSavingGoal(false);

        if (success) {
            setIsEditingGoal(false);
        }
    };

    // Derived Activity Feed
    const activities = [
        {
            id: 'proj-created',
            action: 'Project created',
            time: project.created_at,
            icon: FileText,
            description: ''
        },
        ...members.map(m => ({
            id: `join-${m.id}`,
            user: m.users,
            action: 'joined',
            time: m.joined_at,
        }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    const handleAIAction = (action: string) => {
        toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
            loading: `AI Agent processing: ${action}...`,
            success: `${action} completed successfully`,
            error: 'AI unavailable'
        });
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-full bg-[#F9F8F6] dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-500">
            <div className="flex-1 p-4 md:p-8 h-auto lg:h-full overflow-visible lg:overflow-y-auto space-y-8 md:space-y-12 scrollbar-hide">
                {/* Team Workload Section */}
                <section className="relative group">
                    <div className="moving-gradient-border rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.002]">
                        <div className="moving-gradient-border-content p-5 md:p-8">
                            <div className="flex items-center justify-between mb-6 md:mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-sm shrink-0">
                                        <ListTodo className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white leading-tight truncate">
                                            {project.team_name || "Team Workload"}
                                        </h2>
                                        <p className="text-[10px] md:text-[11px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wide truncate">
                                            {project.team_name ? project.title : "Active task distribution"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                    <span className="text-[10px] md:text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase leading-none mt-0.5">Live Sync</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                {members.map((member, index) => {
                                    const activeTasks = tasks.filter(t => t.assigned_to === member.user_id && t.status !== 'completed' && t.status !== 'deleted').length;
                                    const completedTasks = tasks.filter(t => t.assigned_to === member.user_id && t.status === 'completed').length;
                                    const overdueTasks = tasks.filter(t => t.assigned_to === member.user_id && t.status !== 'completed' && t.status !== 'deleted' && t.due_date && new Date(t.due_date) < new Date(new Date().setHours(0, 0, 0, 0))).length;

                                    return (
                                        <motion.div
                                            key={member.user_id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative group/member p-4 rounded-2xl md:rounded-3xl border-zinc-200/50 dark:border-white/5 bg-white/40 dark:bg-zinc-900/20 border shadow-sm hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-sm font-bold text-white dark:text-zinc-900 shadow-md">
                                                        {member.users?.email?.[0]?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{member.users?.full_name || 'Team Member'}</p>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">
                                                                {member.role === 'owner' ? 'Team Leader' : member.role}
                                                            </p>
                                                            {overdueTasks > 0 && (
                                                                <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full uppercase truncate max-w-[50px]">
                                                                    Overdue
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="bg-amber-500/5 dark:bg-amber-500/10 p-2 md:p-2.5 rounded-xl md:rounded-2xl border border-amber-500/10 text-center">
                                                        <p className="text-lg md:text-xl font-black text-amber-500">{activeTasks}</p>
                                                        <p className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest">Active</p>
                                                    </div>
                                                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-2 md:p-2.5 rounded-xl md:rounded-2xl border border-emerald-500/10 text-center">
                                                        <p className="text-lg md:text-xl font-black text-emerald-500">{completedTasks}</p>
                                                        <p className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest">Done</p>
                                                    </div>
                                                    <div className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl border text-center ${overdueTasks > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-stone-500/5 border-stone-500/10'}`}>
                                                        <p className={`text-lg md:text-xl font-black ${overdueTasks > 0 ? 'text-rose-500' : 'text-zinc-300 dark:text-zinc-700'}`}>{overdueTasks}</p>
                                                        <p className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest">Due</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {members.length === 0 && (
                                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-400">
                                        <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4">
                                            <Users className="w-8 h-8 text-zinc-200 dark:text-zinc-700" />
                                        </div>
                                        <p className="text-sm font-bold uppercase text-zinc-300 dark:text-zinc-700">Awaiting squad members</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    <section className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                            <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white">Project Description</h2>
                        </div>
                        <div className="group relative h-full">
                            {isEditingGoal ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={projectGoal}
                                        onChange={(e) => setProjectGoal(e.target.value)}
                                        className="min-h-[140px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:ring-emerald-500 rounded-2xl p-4 shadow-inner"
                                        placeholder="Describe your project goals, objectives, and what you aim to achieve..."
                                        disabled={isSavingGoal}
                                        maxLength={1000}
                                    />
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-zinc-400">
                                            {projectGoal.length}/1000 characters
                                        </span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setIsEditingGoal(false);
                                                    setProjectGoal(project.goal || '');
                                                }}
                                                disabled={isSavingGoal}
                                                className="h-10 px-4 text-[11px] font-bold uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 rounded-xl"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveGoal}
                                                disabled={isSavingGoal || projectGoal.trim().length === 0}
                                                className="bg-black hover:bg-black/80 text-white rounded-xl h-10 px-4 text-[11px] font-bold uppercase transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                {isSavingGoal ? (
                                                    <>
                                                        <div className="w-3 h-3 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-3 h-3 mr-2" /> Save Description
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="bg-white/40 dark:bg-zinc-900/30 border border-white dark:border-white/5 rounded-[24px] md:rounded-[32px] p-5 md:p-8 text-zinc-600 dark:text-zinc-400 min-h-[100px] md:min-h-[160px] cursor-text transition-all text-sm leading-relaxed text-left hover:border-zinc-950/10 dark:hover:border-zinc-800 backdrop-blur-sm shadow-sm whitespace-pre-wrap font-medium">
                                        {projectGoal || (isOwner ? "What's this project about? Click the edit icon to add a description." : "No project description set.")}
                                    </div>
                                    {isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsEditingGoal(true)}
                                            className="absolute -right-2 -top-2 opacity-100 md:opacity-0 group-hover:opacity-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-emerald-500 transition-all rounded-xl shadow-sm"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                            <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white">Project Squad</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {members.map(m => (
                                <div key={m.id} className="flex items-center justify-between p-4 bg-stone-50/50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800/50 rounded-2xl hover:border-stone-300 dark:hover:border-stone-700 transition-all cursor-pointer group/card active:scale-[0.99] shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-violet-500/10">
                                            {m.users?.email?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{m.users?.full_name || m.users?.email?.split('@')[0]}</p>
                                            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase mt-0.5">
                                                {m.role === 'owner' ? 'Team Leader' : 'Team Member'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover/card:text-zinc-900 dark:group-hover/card:text-white transition-colors" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div >
            </div >

            {/* Right Sidebar - Status & Timeline */}
            <div className="w-full lg:w-80 p-4 md:p-8 lg:p-8 space-y-8 md:space-y-10 bg-stone-50 dark:bg-black border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-stone-800 h-auto lg:h-full overflow-visible lg:overflow-y-auto scrollbar-hide mb-[85px] lg:mb-0">
                <section>
                    <h2 className="text-[13px] font-bold uppercase mb-4 md:mb-6 text-zinc-900 dark:text-white px-1">What's the status of project?</h2>
                    <div className={`space-y-3 ${!isOwner ? 'pointer-events-none opacity-80' : ''}`}>
                        <div onClick={() => isOwner && setProjectStatus('on_track')}>
                            <StatusCard label="On track" color="emerald" active={projectStatus === 'on_track'} />
                        </div>
                        <div onClick={() => isOwner && setProjectStatus('at_risk')}>
                            <StatusCard label="At risk" color="amber" active={projectStatus === 'at_risk'} />
                        </div>
                        <div onClick={() => isOwner && setProjectStatus('off_track')}>
                            <StatusCard label="Off track" color="red" active={projectStatus === 'off_track'} />
                        </div>
                    </div>
                </section>

                <section className="pt-8 border-t border-zinc-100 dark:border-zinc-900 space-y-4 md:space-y-6">
                    <h2 className="text-[12px] font-bold uppercase mb-4 md:mb-6 text-zinc-900 dark:text-white px-1 flex items-center gap-2">
                        <Activity className="w-3 h-3 text-amber-500" />
                        Activity Feed
                    </h2>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.05 }}
                        className="relative space-y-0"
                    >
                        {activities.map((activity: any, i) => (
                            <ActivityItem
                                key={activity.id}
                                user={activity.user}
                                action={activity.action}
                                time={formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                                icon={activity.icon}
                                description={activity.description}
                                index={i}
                                isLast={i === activities.length - 1}
                            />
                        ))}
                    </motion.div>
                </section>
            </div >
        </div >
    );
};

// Status Indicator Component
const StatusCard = ({ label, color, active }: any) => {
    const dotColors: any = {
        emerald: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
        amber: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
        red: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    };

    const bgColors: any = {
        emerald: 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-500/50 text-emerald-900 dark:text-emerald-100',
        amber: 'bg-amber-100 dark:bg-amber-500/10 border-amber-500/50 text-amber-900 dark:text-amber-100',
        red: 'bg-red-100 dark:bg-red-500/10 border-red-500/50 text-red-900 dark:text-red-100',
    };

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer shadow-sm ${active
            ? bgColors[color]
            : 'bg-white dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}>
            <div className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
            <span className="text-xs font-bold">{label}</span>
        </div>
    );
};

// Activity Item Component
const ActivityItem = ({ user, action, time, icon: Icon, description, index, isLast }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="relative pl-6 pb-8 group last:pb-0"
    >
        {/* Timeline Line */}
        {!isLast && (
            <div className="absolute left-[9px] top-3 bottom-0 w-[2px] bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors" />
        )}

        {/* Timeline Dot */}
        <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-[3px] border-white dark:border-black bg-zinc-200 dark:bg-zinc-800 z-10 group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300 shadow-sm" />

        <div className="space-y-2 transform transition-all duration-300 group-hover:translate-x-1">
            <div className="flex items-start gap-3">
                {user ? (
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md shrink-0 mt-0.5">
                        {user.email?.[0]}
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-200 dark:border-zinc-700 shrink-0 mt-0.5">
                        {Icon && <Icon className="w-4 h-4" />}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">
                        {user ? (
                            <>
                                <span className="font-bold text-zinc-900 dark:text-white">{user.full_name || 'User'}</span> <span className="text-zinc-500 dark:text-zinc-500">{action}</span>
                            </>
                        ) : (
                            <span className="font-bold text-zinc-900 dark:text-white">{action}</span>
                        )}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {time}
                    </p>
                </div>
            </div>

            {description && (
                <div className="ml-11 p-3 bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-sm group-hover:shadow-md group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-all">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium italic">"{description}"</p>
                </div>
            )}
        </div>
    </motion.div>
);

export default Overview;
