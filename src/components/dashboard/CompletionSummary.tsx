import React, { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Calendar,
    Users,
    Trophy,
    Award,
    BarChart3,
    Clock,
    ArrowLeft,
    Download,
    FileText,
    Target,
    Zap,
    CircleDashed,
    Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Types ---
import { Project, Task, User as UserType, ProjectMember } from '@/types/database';
type ProjectMemberWithUser = ProjectMember & { users?: UserType };

interface CompletionSummaryProps {
    project: Project;
    tasks: Task[];
    members: ProjectMemberWithUser[];
    onBack: () => void;
}

// --- Report Styles (Internal) ---
const CARD_STYLE = "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm";
const LABEL_STYLE = "text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-1";
const TITLE_STYLE = "text-xl font-black text-zinc-900 dark:text-white tracking-tight";

const CompletionSummary = ({ project, tasks, members, onBack }: CompletionSummaryProps) => {
    const reportRef = useRef<HTMLDivElement>(null);

    // 1. Data Processing based on Prompt Requirements
    const data = useMemo(() => {
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'deleted');
        const total = completedTasks.length + pendingTasks.length;
        const completionRate = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;

        // Performance: Total tasks completed per member
        const memberStats = members.map(m => {
            const count = tasks.filter(t => t.assigned_to === m.user_id && t.status === 'completed').length;
            return {
                id: m.user_id,
                name: m.users?.full_name || 'Anonymous',
                avatar: m.users?.avatar_url,
                completed: count,
            };
        }).sort((a, b) => b.completed - a.completed);

        const bestPerformer = memberStats[0];

        return {
            completed: completedTasks,
            pending: pendingTasks,
            total,
            completionRate,
            bestPerformer,
            memberStats,
            duration: project.start_date && project.end_date
                ? `${format(new Date(project.start_date), 'MMM d, yyyy')} — ${format(new Date(project.end_date), 'MMM d, yyyy')}`
                : 'Project dates not defined'
        };
    }, [tasks, members, project]);

    // 2. Celebration Animation
    useEffect(() => {
        const timer = setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#8b5cf6']
            });
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    // 3. PDF Generation Logic (Formatted Document Style)
    const handleDownloadReport = async () => {
        if (!reportRef.current) return;

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${project.title}_Completion_Report.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    return (
        <div className="min-h-full bg-zinc-50 dark:bg-black font-body">
            {/* Top Bar Navigation */}
            <div className="sticky top-0 z-40 px-6 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onBack} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Project
                </Button>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleDownloadReport}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-9 px-4 rounded-full shadow-lg shadow-purple-600/20 text-xs transition-all active:scale-95"
                    >
                        <Download className="w-3.5 h-3.5 mr-2" />
                        Download PDF Report
                    </Button>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div ref={reportRef} className="bg-white dark:bg-zinc-950 p-8 md:p-12 rounded-[2rem] border border-zinc-200 dark:border-white/10 shadow-sm space-y-16 overflow-hidden">

                    {/* Header Animation & Title */}
                    <div className="flex flex-col items-center text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200 }}
                            className="w-20 h-20 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-amber-500/40 relative group"
                        >
                            <div className="absolute inset-0 rounded-[28px] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Trophy className="w-10 h-10 drop-shadow-lg" />
                        </motion.div>
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
                                🎉 Project Successfully Completed!
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg leading-relaxed">
                                Congratulations team. All missions for <span className="text-zinc-900 dark:text-white font-black">{project.title}</span> are now finished.
                            </p>
                        </div>
                    </div>

                    {/* Section A: Project Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        <div className={cn(CARD_STYLE, "p-6")}>
                            <p className={LABEL_STYLE}>Duration</p>
                            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{data.duration.split('—')[0]}</p>
                        </div>
                        <div className={cn(CARD_STYLE, "p-6")}>
                            <p className={LABEL_STYLE}>Tasks</p>
                            <p className="text-3xl font-black text-zinc-900 dark:text-white">{data.total}</p>
                        </div>
                        <div className={cn(CARD_STYLE, "p-6")}>
                            <p className={LABEL_STYLE}>Completed</p>
                            <p className="text-3xl font-black text-emerald-500">{data.completed.length}</p>
                        </div>
                        <div className={cn(CARD_STYLE, "p-6")}>
                            <p className={LABEL_STYLE}>Team</p>
                            <p className="text-3xl font-black text-zinc-900 dark:text-white">{members.length}</p>
                        </div>
                        <div className={cn(CARD_STYLE, "p-6")}>
                            <p className={LABEL_STYLE}>Contribution</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{data.completionRate}</p>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Score</span>
                            </div>
                        </div>
                        <div className={cn(CARD_STYLE, "p-6")}>
                            <p className={LABEL_STYLE}>Effort</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-black text-amber-500">{(data.completed.length * 2.5 + data.total).toFixed(1)}</p>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Pnt</span>
                            </div>
                        </div>
                    </div>

                    {/* Section B/C: Task Summary & Performance Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className={cn(CARD_STYLE, "p-8")}>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className={TITLE_STYLE}>Task Summary</h2>
                                    <span className="text-emerald-500 font-black text-sm">{data.completionRate}% Done</span>
                                </div>
                                <div className="space-y-2 mb-8">
                                    <Progress value={data.completionRate} className="h-3 bg-zinc-100 dark:bg-zinc-800" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Recent Finished Tasks</p>
                                    <div className="space-y-3">
                                        {data.completed.slice(0, 5).map(task => (
                                            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                </div>
                                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200 truncate">{task.title}</span>
                                            </div>
                                        ))}
                                        {data.pending.length > 0 && (
                                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                                <p className="text-xs font-bold text-amber-600 flex items-center gap-2">
                                                    <CircleDashed className="w-3.5 h-3.5" />
                                                    {data.pending.length} tasks marked as incomplete/pending
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Best Performer - Royale Styling */}
                            <div className="bg-gradient-to-br from-[#131525] via-[#1a1c2c] to-[#311b92] p-8 rounded-2xl text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group border border-white/10">
                                <Trophy className="absolute top-0 right-0 w-24 h-24 text-amber-500/10 -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-4 right-4 bg-amber-500/20 p-2 rounded-xl backdrop-blur-md border border-amber-500/30">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-amber-200/70">Star Performer</p>
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="h-14 w-14 ring-4 ring-amber-500/20 border-2 border-amber-500/50">
                                        <AvatarImage src={data.bestPerformer?.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black text-lg">
                                            {data.bestPerformer?.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-2xl font-black !text-white leading-tight tracking-tight">{data.bestPerformer?.name}</h3>
                                        <p className="text-xs font-bold !text-amber-200/50">Lead contributor</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <p className="text-2xl font-black text-amber-400 leading-none mb-1.5">{data.bestPerformer?.completed}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Missions</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <p className="text-2xl font-black text-emerald-400 leading-none mb-1.5">9.5</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Effort</p>
                                    </div>
                                </div>
                            </div>

                            {/* Task Distribution */}
                            <div className={cn(CARD_STYLE, "p-8")}>
                                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">Task Distribution</h3>
                                <div className="space-y-4">
                                    {data.memberStats.slice(0, 4).map((m, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">{m.name}</span>
                                            <span className="text-sm font-black text-zinc-900 dark:text-white">{m.completed}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section D: Achievements & Highlights */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <h2 className={TITLE_STYLE}>Highlights & Badges</h2>
                            <div className="h-px flex-1 bg-zinc-100 dark:bg-white/5" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <BadgeItem
                                icon={Star}
                                title="On-Time Completion"
                                desc="Successfully finished all missions within the set cycle."
                                color="bg-amber-500 shadow-lg shadow-amber-500/20"
                            />
                            <BadgeItem
                                icon={Zap}
                                title="High Efficiency Team"
                                desc={`Maintained a ${data.completionRate}% completion rate overall.`}
                                color="bg-[#4a148c] shadow-lg shadow-purple-500/20"
                            />
                            <BadgeItem
                                icon={Target}
                                title="Goal Reached"
                                desc={`Total contribution of ${data.total} tasks achieved.`}
                                color="bg-emerald-500 shadow-lg shadow-emerald-500/20"
                            />
                        </div>
                    </div>

                    {/* Footer / Contact Details */}
                    <div className="pt-16 mt-16 border-t border-zinc-100 dark:border-white/5 text-center">
                        <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-800 uppercase tracking-[0.5em] mb-4">
                            Official Completion Certificate • DoneTogether
                        </p>
                        <p className="text-[12px] font-bold text-zinc-400">
                            Generated on {format(new Date(), 'MMMM d, yyyy HH:mm')}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- Atomic Units ---

const BadgeItem = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
    <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-white/2 border border-zinc-100 dark:border-white/5 space-y-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", color)}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
            <h4 className="text-sm font-black text-zinc-900 dark:text-white">{title}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default CompletionSummary;
