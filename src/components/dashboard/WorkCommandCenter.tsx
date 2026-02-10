import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Activity, AlertCircle, Clock,
    CheckCircle2, PlayCircle, Lock, PauseCircle,
    ChevronRight, ArrowRight, TrendingUp, History,
    ShieldAlert, Zap, Layers, AlertTriangle, User,
    Calendar, MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Task, TaskStatus, Subtask, TaskBlocker, ActivitySignal, ProjectMember, User as UserType } from '@/types/database';
import { toast } from 'sonner';
import { formatDistanceToNow, isAfter, isBefore, addMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface WorkCommandCenterProps {
    projectId: string;
    members: (ProjectMember & { users?: UserType })[];
    currentUser: UserType | null;
}

// ============================================
// DOMAIN MODELS & DERIVED STATE
// ============================================

interface DerivedWorkState {
    executionSnapshot: {
        totalActive: number;
        completedCount: number;
        remainingCount: number;
        blockedCount: number;
        dependencyPendingCount: number;
        overdueCount: number;
        driftCount: number;
        healthScore: number;
    };
    nextActionQueue: ActionableTask[];
    blockedPanel: BlockedTaskMeta[];
    executionFlow: {
        backlog: Task[];
        planned: Task[];
        active: Task[];
        blocked: Task[];
        dependency_pending: Task[];
        completed: Task[];
    };
    activitySignals: ActivitySignal[];
}

interface ActionableTask extends Task {
    actionabilityReason: string;
    ctaLabel: string;
}

interface BlockedTaskMeta extends Task {
    blockerReason: string;
    blockedSince: string;
    blockedBy: string;
    agingDays: number;
}

const WorkCommandCenter = ({ projectId, members, currentUser }: WorkCommandCenterProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [blockers, setBlockers] = useState<TaskBlocker[]>([]);
    const [signals, setSignals] = useState<ActivitySignal[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ============================================
    // DATA FETCHING & REALTIME
    // ============================================

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [tasksRes, subtasksRes, blockersRes, signalsRes] = await Promise.all([
                supabase.from('tasks').select('*').eq('project_id', projectId).neq('status', 'deleted'),
                supabase.from('subtasks').select('*'), // Ideally filtered by tasks in project
                supabase.from('task_blockers').select('*'),
                supabase.from('activities').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(20)
            ]);

            if (tasksRes.data) setTasks(tasksRes.data);
            if (subtasksRes.data) setSubtasks(subtasksRes.data);
            if (blockersRes.data) setBlockers(blockersRes.data);
            if (signalsRes.data) setSignals(signalsRes.data);
        } catch (err) {
            console.error('WorkCommandCenter fetch error:', err);
            toast.error('Failed to sync command center');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Realtime Subscriptions
        const taskChannel = supabase.channel('work_command_center')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'task_blockers' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `project_id=eq.${projectId}` }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(taskChannel);
        };
    }, [projectId]);

    // ============================================
    // DERIVED COMPUTATIONS (THE BRAIN)
    // ============================================

    const derivedState = useMemo<DerivedWorkState>(() => {
        const now = new Date();

        // 1. Organize Flow
        const flow = {
            backlog: tasks.filter(t => t.status === 'backlog'),
            planned: tasks.filter(t => t.status === 'planned'),
            active: tasks.filter(t => t.status === 'active'),
            blocked: tasks.filter(t => t.status === 'blocked'),
            dependency_pending: tasks.filter(t => t.status === 'dependency_pending'),
            completed: tasks.filter(t => t.status === 'completed'),
        };

        // 2. Execution Snapshot
        const overdue = tasks.filter(t => t.status !== 'completed' && t.due_date && isBefore(new Date(t.due_date), now));
        const drifting = tasks.filter(t => {
            if (t.status === 'completed' || !t.estimate_duration || !t.start_date) return false;
            const elapsedMinutes = (now.getTime() - new Date(t.start_date).getTime()) / (1000 * 60);
            return elapsedMinutes > t.estimate_duration;
        });

        const snapshot = {
            totalActive: flow.active.length,
            completedCount: flow.completed.length,
            remainingCount: tasks.length - flow.completed.length,
            blockedCount: flow.blocked.length,
            dependencyPendingCount: flow.dependency_pending.length,
            overdueCount: overdue.length,
            driftCount: drifting.length,
            healthScore: tasks.length > 0 ? Math.round(((flow.completed.length) / tasks.length) * 100) : 100
        };

        // 3. Next Action Queue (Ranked)
        const actionableTasks: ActionableTask[] = tasks
            .filter(t => ['backlog', 'planned', 'active'].includes(t.status))
            .map(t => {
                let reason = "In Flow";
                let cta = "Execute";

                if (isBefore(new Date(t.due_date), now)) {
                    reason = "Overdue - Immediate Attention";
                    cta = "Prioritize";
                } else if (t.status === 'active') {
                    reason = "Active - Keep Momentum";
                    cta = "Update";
                } else if (t.status === 'planned') {
                    reason = "Planned - Ready to Start";
                    cta = "Start Now";
                }

                return { ...t, actionabilityReason: reason, ctaLabel: cta };
            })
            .sort((a, b) => {
                // Sorting logic: Overdue > Active > Planned > Priority
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                const aOverdue = isBefore(new Date(a.due_date), now) ? 10 : 0;
                const bOverdue = isBefore(new Date(b.due_date), now) ? 10 : 0;

                const aState = a.status === 'active' ? 5 : a.status === 'planned' ? 3 : 1;
                const bState = b.status === 'active' ? 5 : b.status === 'planned' ? 3 : 1;

                return (bOverdue + bState + priorityWeight[b.priority]) - (aOverdue + aState + priorityWeight[a.priority]);
            });

        // 4. Blocked & Waiting Control
        const blockedMeta: BlockedTaskMeta[] = flow.blocked.map(t => {
            const blocker = blockers.find(b => b.task_id === t.id && !b.resolved_at);
            const blockerUser = blocker?.blocked_by_id ? members.find(m => m.user_id === blocker.blocked_by_id)?.users?.full_name : 'System';
            const since = blocker?.blocked_since || t.updated_at;
            const aging = Math.floor((now.getTime() - new Date(since).getTime()) / (1000 * 60 * 60 * 24));

            return {
                ...t,
                blockerReason: blocker?.reason || "Reason not specified",
                blockedSince: formatDistanceToNow(new Date(since)),
                blockedBy: blockerUser || 'Unknown',
                agingDays: aging
            };
        });

        return {
            executionSnapshot: snapshot,
            nextActionQueue: actionableTasks,
            blockedPanel: blockedMeta,
            executionFlow: flow,
            activitySignals: signals
        };
    }, [tasks, subtasks, blockers, signals, members]);

    // ============================================
    // STATE TRANSITIONS (THE ENGINE)
    // ============================================

    const transitionState = async (taskId: string, from: TaskStatus, to: TaskStatus) => {
        // Validation: Blocked tasks need metadata to enter 'blocked'
        if (to === 'blocked') {
            toast.error('Blocker metadata required to enter Blocked state');
            return;
        }

        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    status: to,
                    updated_at: new Date().toISOString(),
                    start_date: to === 'active' && !tasks.find(t => t.id === taskId)?.start_date ? new Date().toISOString() : undefined,
                    completed_at: to === 'completed' ? new Date().toISOString() : undefined
                })
                .eq('id', taskId);

            if (error) throw error;

            // Log signal
            await supabase.from('activities').insert({
                project_id: projectId,
                entity_type: 'task',
                entity_id: taskId,
                action: 'status_transition',
                diff_payload: { from, to },
                user_id: currentUser?.id
            });

            toast.success(`Task moved to ${to.replace('_', ' ')}`);
        } catch (err) {
            toast.error('Transition failed');
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Zap className="w-8 h-8 text-blue-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Synchronizing Command Center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto space-y-10 font-sans text-zinc-900 dark:text-zinc-100 pb-20 overflow-y-auto h-full scrollbar-hide">

            {/* 1️⃣ Execution Snapshot */}
            <header className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2 flex flex-col justify-between p-8 bg-zinc-900 dark:bg-white rounded-[40px] text-white dark:text-zinc-900 shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6 opacity-60">
                            <Activity className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Execution Health</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
                            {derivedState.executionSnapshot.healthScore}% <span className="text-lg font-medium opacity-60">Complete</span>
                        </h2>
                        <p className="text-sm font-medium opacity-60 max-w-xs">
                            Current project trajectory is {(derivedState.executionSnapshot.healthScore > 70) ? 'healthy' : 'at risk'}. {derivedState.executionSnapshot.overdueCount} missions require immediate recovery.
                        </p>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1.5 bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${derivedState.executionSnapshot.healthScore}%` }} />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                        <StatItem label="Active" value={derivedState.executionSnapshot.totalActive} icon={PlayCircle} color="text-blue-500" />
                        <StatItem label="Blocked" value={derivedState.executionSnapshot.blockedCount} icon={Lock} color="text-rose-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <StatItem label="Overdue" value={derivedState.executionSnapshot.overdueCount} icon={AlertCircle} color="text-amber-500" />
                        <StatItem label="Drift" value={derivedState.executionSnapshot.driftCount} icon={History} color="text-violet-500" />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* 2️⃣ Next Action Queue (CRITICAL) */}
                <section className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Next Action Queue</h3>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                            {derivedState.nextActionQueue.length} Actionable Items
                        </span>
                    </div>

                    <div className="space-y-3">
                        {derivedState.nextActionQueue.length > 0 ? (
                            derivedState.nextActionQueue.map((task, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={task.id}
                                    className="group flex items-center justify-between p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] hover:border-blue-500/50 transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                                            task.status === 'active' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-500" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400"
                                        )}>
                                            {task.status === 'active' ? <Zap className="w-5 h-5 fill-current" /> : <Layers className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">
                                                {task.title}
                                            </h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black uppercase text-blue-500">{task.actionabilityReason}</span>
                                                <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                                <span className="text-[10px] font-bold text-zinc-400">Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => transitionState(task.id, task.status, task.status === 'active' ? 'completed' : 'active')}
                                        className="h-11 px-6 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                                    >
                                        {task.ctaLabel} <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                    </Button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center text-zinc-400 italic font-medium">
                                <CheckCircle2 className="w-10 h-10 mb-4 opacity-10" />
                                <p>Queue processed. No immediate actions required.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 3️⃣ Blocked & Waiting Panel */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                        <h3 className="text-xl font-black uppercase tracking-tight">Obstructions</h3>
                    </div>

                    <div className="space-y-4">
                        {derivedState.blockedPanel.map((blocked, i) => (
                            <div key={blocked.id} className="p-6 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-[32px] space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                                            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Blocked Mission</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{blocked.title}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[18px] font-black text-rose-600 dark:text-rose-400 leading-none">{blocked.agingDays}</p>
                                        <p className="text-[9px] font-bold text-rose-400 uppercase">Days Stuck</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                                    <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Impediment</p>
                                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 italic">"{blocked.blockerReason}"</p>
                                </div>
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <User className="w-3 h-3" />
                                        <span>BY {blocked.blockedBy}</span>
                                    </div>
                                    <button
                                        onClick={() => transitionState(blocked.id, 'blocked', 'planned')}
                                        className="text-rose-500 hover:text-rose-600 underline underline-offset-4"
                                    >
                                        Resolve & Plan
                                    </button>
                                </div>
                            </div>
                        ))}

                        {derivedState.blockedPanel.length === 0 && (
                            <div className="p-12 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[40px] text-zinc-300">
                                <p className="text-xs uppercase font-black">No Active Blockers</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* 4️⃣ Execution Flow Overview */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-1.5 h-6 bg-zinc-900 dark:bg-white rounded-full" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Execution Flow Architecture</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(derivedState.executionFlow).map(([state, items]) => (
                        <div key={state} className="flex flex-col gap-3 min-w-0">
                            <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-between border border-transparent">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{state.replace('_', ' ')}</span>
                                <span className="text-[10px] font-bold text-zinc-400">{items.length}</span>
                            </div>
                            <div className="space-y-2">
                                {items.slice(0, 3).map(item => (
                                    <div key={item.id} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate">
                                        {item.title}
                                    </div>
                                ))}
                                {items.length > 3 && (
                                    <div className="text-center py-2 text-[9px] font-black text-zinc-400">+ {items.length - 3} MORE</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5️⃣ Activity Signals (Impact Intelligence) */}
            <section className="pt-10 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-tight">Impact Intelligence</h3>
                        <p className="text-xs font-medium text-zinc-500">Execution signals filtered by significance.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {derivedState.activitySignals.map((signal, i) => (
                        <div key={signal.id} className="flex items-start gap-4 p-5 bg-zinc-50 dark:bg-zinc-950/30 rounded-[28px] border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm shrink-0">
                                <ActivitySignalIcon action={signal.action} />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                                    {signal.action.replace(/_/g, ' ')}
                                </p>
                                <p className="text-[11px] font-medium text-zinc-500 leading-relaxed truncate">
                                    {members.find(m => m.user_id === signal.user_id)?.users?.full_name || 'Team member'} changed task state
                                </p>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{formatDistanceToNow(new Date(signal.created_at), { addSuffix: true })}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

// ============================================
// SUB-COMPONENTS
// ============================================

const StatItem = ({ label, value, icon: Icon, color }: any) => (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] flex flex-col justify-between hover:border-zinc-400 transition-all cursor-default">
        <div className="flex items-center gap-2 mb-4">
            <Icon className={cn("w-4 h-4", color)} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
        </div>
        <p className="text-3xl font-black text-zinc-900 dark:text-white leading-none">{value}</p>
    </div>
);

const ActivitySignalIcon = ({ action }: { action: string }) => {
    switch (action) {
        case 'status_transition': return <Zap className="w-4 h-4 text-blue-500" />;
        case 'blocker_added': return <Lock className="w-4 h-4 text-rose-500" />;
        case 'blocker_resolved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
        default: return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
};

export default WorkCommandCenter;
