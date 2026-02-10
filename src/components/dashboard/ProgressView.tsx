import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea
} from 'recharts';
import {
    Zap, CheckCircle2, TrendingUp, Layers, Activity, AlertCircle, Clock, Trophy, Medal, Crown, Sparkles, Star
} from 'lucide-react';
import { format, subDays, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { Task, ProjectMember, User } from '@/types/database';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type ProjectMemberWithUser = ProjectMember & { users?: User };

interface ProgressViewProps {
    tasks: Task[];
    members: ProjectMemberWithUser[];
}

const COLORS = {
    pink: '#ec4899',   // Completion
    purple: '#8b5cf6', // Velocity (Violet-500 for a sharper look)
    orange: '#f97316', // Backlog
    teal: '#14b8a6',   // Workload
    emerald: '#10b981', // Trends
    red: '#ef4444',    // Alerts
};

export default function ProgressView({ tasks, members }: ProgressViewProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // ---------------------------------------------------------
    // 1. Calculations & Logic
    // ---------------------------------------------------------
    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed');
        const inProgress = tasks.filter(t => t.status === 'in_progress');
        const blocked = tasks.filter(t => t.status === 'blocked');
        const todo = tasks.filter(t => t.status === 'not_started');

        // Completion Rate
        const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;

        // Velocity (Tasks done in last 7 days)
        const lastWeek = subDays(new Date(), 7);
        const velocity = completed.filter(t => {
            const date = t.completed_at ? parseISO(t.completed_at) : parseISO(t.updated_at);
            return date > lastWeek;
        }).length;


        return {
            total,
            completedCount: completed.length,
            inProgressCount: inProgress.length,
            blockedCount: blocked.length,
            todoCount: todo.length,
            completionRate,
            velocity
        };
    }, [tasks]);

    // ---------------------------------------------------------
    // 2. Chart Datasets
    // ---------------------------------------------------------

    // A. Activity Trend (Area Chart)
    const trendData = useMemo(() => {
        const data = [];
        for (let i = 13; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateLabel = format(date, 'MMM dd');

            const created = tasks.filter(t => t.created_at && isSameDay(parseISO(t.created_at), date)).length;
            const done = tasks.filter(t => {
                if (t.status !== 'completed') return false;
                const d = t.completed_at ? parseISO(t.completed_at) : (t.updated_at ? parseISO(t.updated_at) : null);
                return d && isSameDay(d, date);
            }).length;

            data.push({ name: dateLabel, created, done });
        }
        return data;
    }, [tasks]);

    // B. Status Distribution (Donut)
    const statusData = useMemo(() => {
        return [
            { name: 'In Progress', value: stats.inProgressCount, color: COLORS.teal }, // Matches Workload
            { name: 'Done', value: stats.completedCount, color: COLORS.pink }, // Matches Completion
            { name: 'To Do', value: stats.todoCount + stats.blockedCount, color: COLORS.orange }, // Matches Backlog
        ].filter(d => d.value > 0);
    }, [stats]);

    // C. Team Performance (Detailed List)
    const teamData = useMemo(() => {
        if (!members.length) return [];
        const counts = new Map();

        members.forEach(m => {
            if (m.user_id) counts.set(m.user_id, {
                id: m.user_id,
                name: m.users?.full_name || 'Unknown',
                avatar: m.users?.avatar_url,
                email: m.users?.email,
                role: m.role,
                done: 0,
                active: 0
            });
        });

        tasks.forEach(t => {
            if (t.assigned_to && counts.has(t.assigned_to)) {
                const c = counts.get(t.assigned_to);
                if (t.status === 'completed') c.done++;
                else if (t.status !== 'deleted') c.active++;
            }
        });

        return Array.from(counts.values())
            .sort((a, b) => (b.done + b.active) - (a.done + a.active))
            .slice(0, 5); // Top 5
    }, [tasks, members]);

    // E. Champions Leaderboard (Real-time Performance)
    const leaderboardData = useMemo(() => {
        if (!members.length) return [];

        const stats = new Map();
        members.forEach(m => {
            if (m.user_id) stats.set(m.user_id, {
                id: m.user_id,
                name: m.users?.full_name || 'Anonymous',
                avatar: m.users?.avatar_url,
                xp: 0,
                completed: 0,
                active: 0
            });
        });

        tasks.forEach(t => {
            if (t.assigned_to && stats.has(t.assigned_to)) {
                const user = stats.get(t.assigned_to);

                // Real-time Performance Scoring
                if (t.status === 'completed') {
                    user.completed++;
                    user.xp += 100; // Base completion
                    if (t.priority === 'high') user.xp += 50; // Critical task bonus
                    else if (t.priority === 'medium') user.xp += 20;
                } else if (t.status === 'in_progress') {
                    user.active++;
                    user.xp += 15; // Active effort points
                }
            }
        });

        // Dynamic Titles
        const titles = [
            "Grandmaster", "Legend", "Warlord", "Elite", "Officer", "Scout"
        ];

        return Array.from(stats.values())
            .filter(u => u.xp > 0) // Only show contributors
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 5) // Top 5
            .map((u, index) => ({
                ...u,
                rank: index + 1,
                title: titles[index] || "Rookie",
                level: Math.floor(u.xp / 300) + 1, // 300 XP per level
                levelProgress: (u.xp % 300) / 300 * 100
            }));
    }, [tasks, members]);

    // D. Task Aging (Scatter) - Enriched
    const agingData = useMemo(() => {
        return tasks
            .filter(t => t.status !== 'completed' && t.created_at)
            .map(t => {
                const createdDate = parseISO(t.created_at);
                const daysOpen = !isNaN(createdDate.getTime()) ? differenceInDays(new Date(), createdDate) : 0;

                // Get assignee info
                const assignee = members.find(m => m.user_id === t.assigned_to)?.users;

                return {
                    name: (t.title || 'Untitled').substring(0, 15) + '...',
                    fullName: t.title || 'Untitled',
                    assigneeName: assignee?.full_name || 'Unassigned',
                    assigneeAvatar: assignee?.avatar_url,
                    daysOpen,
                    priority: t.priority === 'high' ? 30 : t.priority === 'medium' ? 20 : 10,
                    priorityLabel: t.priority,
                    fill: t.priority === 'high' ? COLORS.red : t.priority === 'medium' ? COLORS.orange : COLORS.teal
                };
            });
    }, [tasks, members]);


    return (
        <div className="h-full overflow-y-auto no-scrollbar font-sans relative bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-200 transition-colors duration-300">
            {/* Ambient Background - Dark Mode Only */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0f172a] to-[#0f172a] opacity-0 dark:opacity-100 transition-opacity duration-300" />

            <div className="p-6 max-w-[1400px] mx-auto space-y-6">

                {/* Compact Header */}
                <div className="flex items-end justify-between border-b border-zinc-200 dark:border-white/5 pb-6">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 drop-shadow-sm pb-2"
                        >
                            Analytics Dashboard
                        </motion.h2>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1 tracking-wide">
                            Real-time collaboration metrics & insights
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">Live System</span>
                    </div>
                </div>

                {/* KPI Grid - Colorful Compact Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetaCard
                        label="Velocity"
                        value={stats.velocity}
                        unit="tasks/week"
                        trend="+12%"
                        trendUp={true}
                        icon={Zap}
                        color="text-white"
                        bg="bg-gradient-to-br from-violet-500 to-purple-600"
                        delay={0.1}
                    />
                    <MetaCard
                        label="Completion"
                        value={stats.completionRate}
                        unit="rate"
                        trend={`${stats.completedCount} total`}
                        trendUp={true}
                        icon={CheckCircle2}
                        color="text-white"
                        bg="bg-gradient-to-br from-pink-500 to-rose-600"
                        delay={0.2}
                    />
                    <MetaCard
                        label="Workload"
                        value={stats.inProgressCount}
                        unit="active"
                        trend="On Track"
                        trendUp={true}
                        icon={Activity}
                        color="text-white"
                        bg="bg-gradient-to-br from-teal-400 to-emerald-600"
                        delay={0.3}
                    />
                    <MetaCard
                        label="Backlog"
                        value={stats.todoCount}
                        unit="pending"
                        trend={stats.blockedCount > 0 ? `${stats.blockedCount} Blocked` : "Healthy"}
                        trendUp={stats.blockedCount === 0}
                        icon={Layers}
                        color="text-white"
                        bg="bg-gradient-to-br from-orange-400 to-amber-600"
                        delay={0.4}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* Left Col: Activity & Aging */}
                    <div className="lg:col-span-8 space-y-4">
                        {/* Area Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 backdrop-blur-xl relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-violet-500" />
                                    Activity Trend
                                </h3>
                                <div className="flex gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" />New</span>
                                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-violet-500" />Completed</span>
                                </div>
                            </div>
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.2} />
                                                <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.2} />
                                                <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#ffffff05" : "#e2e8f0"} />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: isDark ? '#a1a1aa' : '#71717a', fontSize: 10, fontWeight: 500 }} dy={10} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fill: isDark ? '#a1a1aa' : '#71717a', fontSize: 10, fontWeight: 500 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="created" stroke={COLORS.orange} strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                                        <Area type="monotone" dataKey="done" stroke={COLORS.purple} strokeWidth={2} fillOpacity={1} fill="url(#colorDone)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Scatter Chart (Stagnation) */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 backdrop-blur-xl relative overflow-hidden"
                        >
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] -rotate-12 transform scale-150 pointer-events-none">
                                <AlertCircle className="w-32 h-32 text-indigo-500" />
                            </div>

                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div>
                                    <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-zinc-900 dark:text-white" />
                                        Stagnation Matrix
                                    </h3>
                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                                        Task Age vs. Priority &bull; <span className="text-rose-500">Critical Zone &gt; 7 days</span>
                                    </p>
                                </div>
                            </div>
                            <div className="h-[200px] w-full relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff05" : "#e2e8f0"} vertical={false} />
                                        <XAxis
                                            type="number" dataKey="daysOpen" name="Days Open" unit="d"
                                            stroke={isDark ? '#52525b' : '#a1a1aa'} tickLine={false} axisLine={{ stroke: isDark ? '#ffffff10' : '#e2e8f0' }}
                                            tick={{ fill: isDark ? '#a1a1aa' : '#71717a', fontSize: 10, fontWeight: 500 }}
                                            domain={[0, 'auto']}
                                        />
                                        <YAxis
                                            type="number" dataKey="priority" name="Priority"
                                            stroke={isDark ? '#52525b' : '#a1a1aa'} tickLine={false} axisLine={false}
                                            tickFormatter={(val) => val === 30 ? 'High' : val === 20 ? 'Med' : 'Low'}
                                            domain={[0, 40]} width={35}
                                            tick={{ fill: isDark ? '#a1a1aa' : '#71717a', fontSize: 10, fontWeight: 500 }}
                                        />
                                        <ZAxis type="number" range={[100, 400]} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />

                                        {/* Danger Zone: High Priority (25+) & > 7 Days */}
                                        <ReferenceArea
                                            x1={7} y1={25} y2={40}
                                            fill={isDark ? "#ef4444" : "#fee2e2"}
                                            fillOpacity={isDark ? 0.1 : 0.4}
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <ReferenceLine
                                            x={7}
                                            stroke={isDark ? "#ef444480" : "#fca5a5"}
                                            strokeDasharray="3 3"
                                            label={{ value: '7d Alert', position: 'insideTopRight', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }}
                                        />

                                        <Scatter name="Tasks" data={agingData} fill="#8884d8">
                                            {agingData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={2} stroke={isDark ? '#00000040' : '#ffffff80'} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Col: Status & Team & Champions */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* 🏆 Champions Leaderboard (New Feature) */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                            className="p-6 rounded-[2rem] bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden relative group"
                        >
                            {/* Glow Effects */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-[60px] -ml-24 -mb-24 pointer-events-none" />

                            <div className="relative z-10">
                                <h3 className="text-lg font-black text-white flex items-center gap-2 mb-6 tracking-tight">
                                    <Trophy className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                                    Hall of Fame
                                </h3>

                                <div className="space-y-4">
                                    {leaderboardData.map((champion: any, index: number) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            key={champion.id}
                                            className="flex items-center gap-4 group/item"
                                        >
                                            {/* Rank Badge */}
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm relative shrink-0 
                                                ${index === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-lg shadow-amber-500/20' :
                                                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' :
                                                        index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-orange-950' :
                                                            'bg-zinc-800 text-zinc-500'}`}
                                            >
                                                {index === 0 && <Crown className="w-5 h-5 absolute -top-3 -right-3 text-amber-400 fill-amber-400 animate-bounce" />}
                                                {champion.rank}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-sm font-bold text-white truncate pr-2">{champion.name}</span>
                                                    <span className={`text-[9px] font-black uppercase tracking-wider py-0.5 px-1.5 rounded-md 
                                                        ${index === 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-zinc-800 text-zinc-400'}`}>
                                                        {champion.title}
                                                    </span>
                                                </div>

                                                {/* Level & XP Bar */}
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            layout
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${champion.levelProgress}%` }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                            className={`h-full rounded-full ${index === 0 ? 'bg-amber-400' : 'bg-violet-500'}`}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-500">Lvl {champion.level}</span>
                                                </div>
                                            </div>

                                            {/* Count - Performance Score */}
                                            <div className="text-right shrink-0">
                                                <div className="text-xl font-black text-white leading-none">
                                                    <span className="text-base text-zinc-500 mr-0.5">XP</span>
                                                    {champion.xp}
                                                </div>
                                                <div className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5">{champion.completed} Wins</div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {leaderboardData.length === 0 && (
                                        <div className="text-center py-10 text-zinc-600 text-sm font-medium italic">
                                            The arena awaits... complete tasks to gain glory!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Status Donut - Compact */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 backdrop-blur-xl flex flex-col items-center justify-center relative min-h-[260px]"
                        >
                            <h3 className="absolute top-6 left-6 text-base font-bold text-zinc-700 dark:text-zinc-200">Status</h3>
                            <div className="w-[180px] h-[180px] mt-4 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%" cy="50%"
                                            innerRadius={65}
                                            outerRadius={75}
                                            paddingAngle={8}
                                            dataKey="value"
                                            cornerRadius={10}
                                            stroke="none"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tasks</span>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-2">
                                {statusData.map((d, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Team Workload - Rich List */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                            className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-white/5 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 backdrop-blur-xl min-h-[200px]"
                        >
                            <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-200 mb-6 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-violet-500" />
                                Team Pulse
                            </h3>

                            <div className="space-y-5">
                                {teamData.map((member: any) => {
                                    const total = member.done + member.active;
                                    const activePercent = total > 0 ? (member.active / total) * 100 : 0;

                                    return (
                                        <div key={member.id} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800">
                                                        <AvatarImage src={member.avatar} />
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold text-xs">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 leading-none">{member.name}</p>
                                                        <p className="text-[10px] font-medium text-zinc-400 capitalize">{member.role || 'Member'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-black text-zinc-900 dark:text-white">{member.active}</span>
                                                    <span className="text-[10px] text-zinc-400 font-medium ml-1">active</span>
                                                </div>
                                            </div>

                                            {/* Custom Progress Bar */}
                                            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex relative">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${activePercent}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut' }}
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full relative z-10"
                                                />
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${100 - activePercent}%` }}
                                                    transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                                                    className="h-full bg-zinc-200 dark:bg-zinc-700"
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] text-zinc-400 font-medium">{Math.round(activePercent)}% Load</span>
                                                <span className="text-[9px] text-emerald-500 font-medium">{member.done} Completed</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {teamData.length === 0 && (
                                    <div className="text-center py-8 text-zinc-400 text-xs">No team activity yet</div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div >
        </div >
    );
}

// ---------------------------
// Components & Styles
// ---------------------------

function MetaCard({ label, value, unit, trend, trendUp, icon: Icon, color, bg, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay || 0 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative p-5 rounded-[2rem] ${bg} shadow-xl shadow-black/5 overflow-hidden group`}
        >
            {/* Watermark */}
            <div className={`absolute -right-4 -bottom-4 opacity-20 transition-transform group-hover:scale-110 duration-500 rotate-12`}>
                <Icon className={`w-24 h-24 text-white`} strokeWidth={1.5} />
            </div>

            <div className="relative z-10 w-full text-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-white/90 uppercase tracking-widest">{label}</h3>
                </div>

                <div className="mt-3">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black tracking-tight">{value}</span>
                        <span className="text-[10px] font-bold text-white/70 uppercase">{unit}</span>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-white/90">
                        <div className="bg-white/20 rounded-full p-0.5">
                            {trendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5 rotate-180" />}
                        </div>
                        {trend}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-xl text-xs z-50">
                <p className="font-bold text-zinc-700 dark:text-zinc-200 mb-1.5 border-b border-zinc-100 dark:border-white/5 pb-1">
                    {payload[0]?.payload?.fullName || label || payload[0]?.name}
                </p>
                {payload[0]?.payload?.assigneeName && (
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                            {payload[0].payload.assigneeName[0]}
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{payload[0].payload.assigneeName}</span>
                    </div>
                )}
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 my-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                        <span className="text-zinc-500 dark:text-zinc-400 capitalize text-[10px] font-semibold">
                            {entry.name === 'daysOpen' ? 'Age' : (entry.name === 'priority' ? 'Priority' : entry.name)}:
                        </span>
                        <span className="text-zinc-900 dark:text-white font-bold text-[10px]">
                            {entry.name === 'priority'
                                ? (entry.value === 30 ? 'High' : entry.value === 20 ? 'Medium' : 'Low')
                                : `${entry.value} ${entry.unit || ''}`}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}
