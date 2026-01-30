import { motion } from 'framer-motion';
import { Users, Clock, Copy, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
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
    // Calculate progress based on members vs expected size
    const progress = Math.min(100, Math.round((memberCount / expectedSize) * 100));

    // Logic: Allow access if 50% or more members have joined
    const isReadyToLaunch = memberCount >= (expectedSize * 0.5);

    const copyJoinCode = () => {
        if (project.join_code) {
            navigator.clipboard.writeText(project.join_code);
            toast.success('Access code copied to clipboard');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
            >
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-4">
                            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Team Assembly</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">
                            {project.team_name || "Waiting for Team"}
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium">
                            {remaining > 0 ? (
                                <>Waiting for <span className="text-zinc-900 dark:text-zinc-200 font-bold">{remaining} more</span> members</>
                            ) : (
                                "Team is complete!"
                            )}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8 space-y-2">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Readiness</span>
                            <span className={`text-sm font-bold font-mono ${isReadyToLaunch ? 'text-emerald-500' : 'text-zinc-400'}`}>{progress}%</span>
                        </div>
                        <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full transition-colors duration-500 ${isReadyToLaunch ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            />
                        </div>
                        {isReadyToLaunch && (
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest text-center pt-1">
                                Minimum capacity reached - You can now enter
                            </p>
                        )}
                    </div>

                    {/* Access Code Card */}
                    <div className="mb-6 relative group cursor-pointer active:scale-[0.99] transition-transform" onClick={copyJoinCode}>
                        <div className="bg-zinc-50 dark:bg-black/20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex items-center justify-between hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Invite Code</p>
                                <p className="text-3xl font-black tracking-[0.2em] text-zinc-900 dark:text-white font-mono">{project.join_code}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-zinc-400 group-hover:text-blue-500 transition-colors">
                                <Copy className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Duration</span>
                            </div>
                            <p className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-200">{formatTime(sessionTime)}</p>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-3.5 h-3.5 text-zinc-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Status</span>
                            </div>
                            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-200 uppercase flex items-center gap-2">
                                {isReadyToLaunch ? 'Ready' : 'Gathering'}
                                {!isReadyToLaunch && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                            </p>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-1">Active Members</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                                            {member.users?.email?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                                                {member.users?.full_name || member.users?.email?.split('@')[0]}
                                                {member.role === 'owner' && <span className="ml-2 text-[9px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 border border-zinc-200 dark:border-zinc-700">LEADER</span>}
                                            </p>
                                        </div>
                                    </div>
                                    {member.user_id === currentUserId && (
                                        <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-2">You</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                        <Button
                            onClick={onEnterDashboard}
                            disabled={!isReadyToLaunch}
                            className={`w-full h-12 rounded-xl font-bold uppercase tracking-widest transition-all ${isReadyToLaunch
                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-xl'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                }`}
                        >
                            {isReadyToLaunch ? (
                                <span className="flex items-center justify-center gap-2">
                                    Enter Workspace <ArrowRight className="w-4 h-4" />
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Waiting for {Math.ceil(expectedSize * 0.5) - memberCount} more...
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default WaitingRoom;
