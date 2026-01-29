import { motion } from 'framer-motion';
import { Users, Clock, Copy, Sparkles, Timer, Crown, CheckCircle2, ShieldPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Project, ProjectMember } from '@/types/database';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface WaitingRoomProps {
    project: Project;
    members: (ProjectMember & { users?: any })[];
    currentUserId: string;
    onEnterDashboard?: () => void;
}

const WaitingRoom = ({ project, members, currentUserId, onEnterDashboard }: WaitingRoomProps) => {
    const [sessionTime, setSessionTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const memberCount = members.length;
    const expectedSize = project.expected_team_size || 4;
    const remaining = Math.max(0, expectedSize - memberCount);
    const progress = Math.min(100, Math.round((memberCount / expectedSize) * 100));

    const copyJoinCode = () => {
        if (project.join_code) {
            navigator.clipboard.writeText(project.join_code);
            toast.success('Access code copied to clipboard');
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-black flex items-center justify-center p-4 font-sans selection:bg-violet-500/30 overflow-hidden relative dotted-pattern">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative max-w-lg w-full"
            >
                {/* Border Gradient Animation */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500 rounded-[34px] blur-[1px] opacity-30 animate-gradient-xy" />

                <div className="relative bg-white dark:bg-zinc-900/95 backdrop-blur-2xl rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/50 dark:border-zinc-800 space-y-8">

                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 border border-violet-100 dark:border-violet-800/50">
                            <ShieldPlus className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Mission Control</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            {project.team_name ? (
                                <span className="flex flex-col gap-1">
                                    <span className="text-amber-500 text-xs uppercase tracking-[0.3em] mb-1">Squad Incoming</span>
                                    {project.team_name}
                                </span>
                            ) : "Waiting for Squad"}
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed">
                            Need <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{remaining} more</span> to launch <span className="text-zinc-900 dark:text-zinc-200 font-bold">"{project.title}"</span>
                        </p>
                    </div>

                    {/* Readiness Bar */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">System Readiness</span>
                            <span className="text-xs font-bold font-mono text-violet-600 dark:text-violet-400">{progress}%</span>
                        </div>
                        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Join Code Ticket */}
                    <div className="relative group cursor-pointer" onClick={copyJoinCode}>
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-800/50 rounded-2xl transform transition-transform group-hover:scale-[1.02]" />
                        <div className="relative p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-700/50 rounded-2xl flex items-center justify-between gap-4">
                            <div className="space-y-0">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Access Code</p>
                                <p className="text-3xl font-bold tracking-[0.2em] text-zinc-900 dark:text-white font-mono">{project.join_code}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-zinc-400 group-hover:text-violet-500 transition-colors">
                                <Copy className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Invite Link Section */}
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-none text-zinc-500 px-1">Project Link</p>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-500">
                                {window.location.origin}/join?code={project.join_code}
                            </div>
                            <Button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/join?code=${project.join_code}`);
                                    toast.success('Invite link copied to clipboard');
                                }}
                                variant="outline"
                                className="h-full aspect-square rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                <Copy className="w-4 h-4 text-zinc-500" />
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Session Time</span>
                            </div>
                            <p className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-200">{formatTime(sessionTime)}</p>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Status</span>
                            </div>
                            <p className="text-lg font-bold text-amber-500 uppercase">Gathering <span className="text-zinc-900 dark:text-zinc-200 font-bold animate-pulse duration-1000">. . . </span></p>
                        </div>
                    </div>

                    {/* Squad Members */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1">Squad Members</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                            {members.map((member) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={member.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-violet dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-800 hover:border-violet-200 dark:hover:border-violet-900/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-9 h-9 rounded-full bg-violet-700 dark:bg-violet-900/100 flex items-center justify-center text-xs font-bold text-white dark:text-zinc-300">
                                                {member.users?.email?.[0].toUpperCase()}
                                            </div>
                                            {member.role === 'owner' && (
                                                <div className="absolute -bottom-1 -right-1 bg-amber-100 dark:bg-amber-900 text-amber-600 p-0.5 rounded-full border border-white dark:border-zinc-900">
                                                    <Crown className="w-2.5 h-2.5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200 leading-tight">
                                                {member.users?.full_name || member.users?.email?.split('@')[0]}
                                            </p>
                                            <p className="text-[11px] font-medium text-zinc-500">
                                                Joined {formatDistanceToNow(new Date(member.joined_at))} ago
                                            </p>
                                        </div>
                                    </div>
                                    {member.user_id === currentUserId && (
                                        <div className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wide">
                                            You
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Go to Dashboard Button (Owner Only) */}
                    {members.find(m => m.user_id === currentUserId)?.role === 'owner' && (
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <Button
                                onClick={onEnterDashboard}
                                className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-zinc-200 dark:shadow-none"
                            >
                                Enter Mission Control <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default WaitingRoom;
