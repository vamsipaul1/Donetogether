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
}

import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

const Overview = ({ project, members, tasks, onProjectUpdated }: OverviewProps) => {
    const [projectGoal, setProjectGoal] = useState(project.goal || '');
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [projectStatus, setProjectStatus] = useState<'on_track' | 'at_risk' | 'off_track'>('on_track');

    // Sync state if props change
    useEffect(() => {
        setProjectGoal(project.goal || '');
    }, [project]);

    const updateProject = async (updates: any) => {
        try {
            const { error } = await supabase.from('projects').update(updates).eq('id', project.id);
            if (error) throw error;
            toast.success('Project updated successfully');
            if (onProjectUpdated) onProjectUpdated();
        } catch (error: any) {
            toast.error('Failed to update project');
            console.error(error);
        }
    };

    const handleSaveGoal = async () => {
        await updateProject({ goal: projectGoal });
        setIsEditingGoal(false);
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
        <div className="flex flex-col lg:flex-row min-h-full bg-stone-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden">
            <div className="flex-1 p-8 overflow-y-auto space-y-12 scrollbar-hide">
                {/* Team Workload Section */}
                <section className="relative group">
                    <div className="moving-gradient-border rounded-[32px] overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl hover:scale-[1.002]">
                        <div className="moving-gradient-border-content p-8">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                                        <ListTodo className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                                            {project.team_name || "Team Workload"}
                                        </h2>
                                        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">
                                            {project.team_name ? project.title : "Active task distribution"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase leading-none mt-0.5">Live Sync</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {members.map((member, index) => {
                                    const activeTasks = tasks.filter(t => t.assigned_to === member.user_id && t.status !== 'completed' && t.status !== 'deleted').length;
                                    const completedTasks = tasks.filter(t => t.assigned_to === member.user_id && t.status === 'completed').length;
                                    const overdueTasks = tasks.filter(t => t.assigned_to === member.user_id && t.status !== 'completed' && t.status !== 'deleted' && t.due_date && new Date(t.due_date) < new Date(new Date().setHours(0, 0, 0, 0))).length;

                                    return (
                                        <motion.div
                                            key={member.user_id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative group/member p-4 rounded-3xl border-amber-200/50 dark:border-amber-500/20 bg-white dark:bg-stone-900/20 border border-amber-400 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-100"
                                        >
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-sm font-bold text-white dark:text-zinc-900 shadow-md">
                                                        {member.users?.email?.[0].toUpperCase()}
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
                                                    <div className="bg-amber-500/5 dark:bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/10 text-center">
                                                        <p className="text-xl font-black text-amber-500">{activeTasks}</p>
                                                        <p className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest">Active</p>
                                                    </div>
                                                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/10 text-center">
                                                        <p className="text-xl font-black text-emerald-500">{completedTasks}</p>
                                                        <p className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-widest">Done</p>
                                                    </div>
                                                    <div className={`p-2.5 rounded-2xl border text-center ${overdueTasks > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-stone-500/5 border-stone-500/10'}`}>
                                                        <p className={`text-xl font-black ${overdueTasks > 0 ? 'text-rose-500' : 'text-zinc-300 dark:text-zinc-700'}`}>{overdueTasks}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Project Description</h2>
                        </div>
                        <div className="group relative h-full">
                            {isEditingGoal ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={projectGoal}
                                        onChange={(e) => setProjectGoal(e.target.value)}
                                        className="min-h-[140px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:ring-emerald-500 rounded-2xl p-4 shadow-inner"
                                        placeholder="Enter project goals..."
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => { setIsEditingGoal(false); setProjectGoal(project.goal || ''); }} className="h-10 px-4 text-[11px] font-bold uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-xl">
                                            Cancel
                                        </Button>
                                        <Button size="sm" onClick={handleSaveGoal} className="bg-black hover:bg-black/80 text-white rounded-xl h-10 px-4 text-[11px] font-bold uppercase transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/60">
                                            <Save className="w-2 h-2 mr-2" /> Save Goal
                                        </Button>

                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="bg-stone-50/50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 text-stone-600 dark:text-stone-400 min-h-[140px] cursor-text transition-all text-sm leading-relaxed text-left hover:border-stone-300 dark:hover:border-stone-700 hover:bg-white dark:hover:bg-stone-900/50 whitespace-pre-wrap font-medium">
                                        {projectGoal || "What's this project about? Click the edit icon to add a description."}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsEditingGoal(true)}
                                        className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-emerald-500 transition-all rounded-xl shadow-sm"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Project Squad</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {members.map(m => (
                                <div key={m.id} className="flex items-center justify-between p-4 bg-stone-50/50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800/50 rounded-2xl hover:border-stone-300 dark:hover:border-stone-700 transition-all cursor-pointer group/card active:scale-[0.99] shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-violet-500/10">
                                            {m.users?.email?.[0].toUpperCase()}
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
                </div>
            </div>

            {/* Right Sidebar - Status & Timeline */}
            <div className="w-full lg:w-80 p-8 lg:p-8 space-y-10 bg-stone-50 dark:bg-black border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-stone-800 overflow-y-auto scrollbar-hide">
                <section>
                    <h2 className="text-[13px] font-bold uppercase mb-6 text-zinc-900 dark:text-white px-1">What's the status of project?</h2>
                    <div className="space-y-3">
                        <div onClick={() => { setProjectStatus('on_track'); toast.success('Status updated: On track'); }}>
                            <StatusCard label="On track" color="emerald" active={projectStatus === 'on_track'} />
                        </div>
                        <div onClick={() => { setProjectStatus('at_risk'); toast.success('Status updated: At risk'); }}>
                            <StatusCard label="At risk" color="amber" active={projectStatus === 'at_risk'} />
                        </div>
                        <div onClick={() => { setProjectStatus('off_track'); toast.success('Status updated: Off track'); }}>
                            <StatusCard label="Off track" color="red" active={projectStatus === 'off_track'} />
                        </div>
                    </div>
                </section>

                <section className="pt-8 border-t border-zinc-100 dark:border-zinc-900 space-y-6">
                    <h2 className="text-[12px] font-bold uppercase mb-6 text-zinc-900 dark:text-white px-1">Activity Feed</h2>
                    <div className="relative pl-6 border-l border-zinc-100 dark:border-zinc-800 space-y-10">
                        {activities.map((activity: any, i) => (
                            <ActivityItem
                                key={activity.id}
                                user={activity.user}
                                action={activity.action}
                                time={formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                                icon={activity.icon}
                                description={activity.description}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
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
const ActivityItem = ({ user, action, time, icon: Icon, description }: any) => (
    <div className="relative pl-2">
        <div className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-black" />

        <div className="space-y-1.5">
            <div className="flex items-center gap-3">
                {user ? (
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-[11px] font-bold text-white shadow-lg">
                        {user.email?.[0]}
                    </div>
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                        {Icon && <Icon className="w-4 h-4" />}
                    </div>
                )}

                <div>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200">
                        {user ? (
                            <>
                                <span className="font-bold text-zinc-900 dark:text-white">{user.full_name || 'User'}</span> <span className="text-zinc-500 dark:text-zinc-500">{action}</span>
                            </>
                        ) : (
                            <span className="font-bold text-zinc-900 dark:text-white">{action}</span>
                        )}
                    </p>
                    <p className="text-[11px] font-bold text-zinc-500 leading-none mt-0.5">{time}</p>
                </div>
            </div>

            {description && (
                <div className="ml-11">
                    <p className="text-[11px] font-semibold uppercase text-zinc-500">{description}</p>
                </div>
            )}
        </div>
    </div>
);

export default Overview;
