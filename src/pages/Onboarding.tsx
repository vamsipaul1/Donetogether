import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Hash, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Typewriter = ({ text, delay }: { text: string; delay: number }) => {
    const [currentText, setCurrentText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setCurrentText(prevText => prevText + text[currentIndex]);
                setCurrentIndex(prevIndex => prevIndex + 1);
            }, delay);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, delay, text]);

    return <span>{currentText}</span>;
};

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'role' | 'member-flow' | 'leader-flow'>('role');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Member Flow State
    const [joinMethod, setJoinMethod] = useState<'code' | 'search'>('code');
    const [inviteCode, setInviteCode] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ id: string; title: string; team_name: string; description?: string; created_by: string }[]>([]);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/auth');
            return;
        }
        setCurrentUser(user);
    };

    const handleRoleSelect = async (role: 'LEADER' | 'MEMBER') => {
        if (role === 'LEADER') {
            setLoading(true);
            try {
                await supabase.from('users').update({ role }).eq('id', currentUser.id);
                navigate('/create-project');
            } catch (e) {
                console.error(e);
                toast.error('Failed to set role');
            } finally {
                setLoading(false);
            }
        } else {
            setStep('member-flow');
        }
    };

    const searchTeams = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('id, title, team_name, description, created_by')
                .or(`title.ilike.%${searchQuery}%,team_name.ilike.%${searchQuery}%`)
                .limit(5);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to search teams');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRequest = async (teamId: string) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('join_requests')
                .insert({
                    user_id: currentUser.id,
                    team_id: teamId,
                    status: 'pending'
                });

            if (error) {
                if (error.code === '23505') throw new Error('You have already requested to join this team');
                throw error;
            }

            toast.success('Request sent! Waiting for Team Leader approval.');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleInviteCode = async () => {
        if (!inviteCode) return;
        setLoading(true);
        try {
            const { data: projects, error } = await supabase
                .from('projects')
                .select('*')
                .eq('join_code', inviteCode)
                .single();

            if (error || !projects) throw new Error('Invalid invite code');

            const { error: joinError } = await supabase
                .from('project_members')
                .insert({
                    project_id: projects.id,
                    user_id: currentUser.id,
                    role: 'member'
                });

            if (joinError) throw joinError;

            await supabase.from('users').update({ onboarding_completed: true }).eq('id', currentUser.id);

            toast.success('Successfully joined team!');
            navigate('/dashboard');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden dotted-pattern">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>

            <div className="w-full max-w-4xl relative z-10">
                {/* Logout Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute top-0 right-0 -mt-12 md:-mt-16"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:text-red-500 hover:bg-transparent transition-colors"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-3.5 h-3.5 mr-2" /> Log out
                    </Button>
                </motion.div>

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                            Set up your account
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-3 leading-[1.1]">
                        <Typewriter text="Welcome to DoneTogether" delay={40} />
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-[2px] h-[28px] md:h-[32px] bg-blue-500 ml-2 align-middle"
                        />
                    </h1>
                    <p className="text-[15px] text-zinc-500 font-medium max-w-lg mx-auto leading-relaxed">
                        Let's get you set up. Choose how you want to join the platform today.
                    </p>
                </motion.div>

                {/* Step: Role Selection */}
                {step === 'role' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
                        {[
                            {
                                role: 'MEMBER' as const,
                                title: 'Team Member',
                                description: 'Join an existing team via invite code or search for your squad.',
                                image: '/image copy.png',
                                color: 'emerald',
                                badge: 'Collaboration'
                            },
                            {
                                role: 'LEADER' as const,
                                title: 'Team Leader',
                                description: 'Create a new workspace, invite members, and manage tasks.',
                                image: '/image copy 2.png',
                                color: 'violet',
                                badge: 'Management'
                            }

                        ].map((cfg, idx) => (
                            <motion.div
                                key={cfg.role}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                                className="moving-gradient-border rounded-[40px] group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500"
                                onClick={() => handleRoleSelect(cfg.role)}
                            >
                                <div className="moving-gradient-border-content bg-white dark:bg-zinc-950 p-10 rounded-[40px] h-full flex flex-col items-center text-center">
                                    {/* Badge */}
                                    <div className="mb-8">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800 text-zinc-400 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all duration-300">
                                            {cfg.badge}
                                        </span>
                                    </div>

                                    {/* Icon Container */}
                                    <div className={cn(
                                        "w-20 h-20 rounded-[28px] border flex items-center justify-center mb-8 bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                                        cfg.color === 'violet'
                                            ? "group-hover:border-violet-500/30 group-hover:bg-violet-500/5"
                                            : "group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5"
                                    )}>
                                        <img
                                            src={cfg.image}
                                            alt={cfg.title}
                                            className="w-10 h-10 object-contain dark:invert"
                                        />
                                    </div>

                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
                                        {cfg.title}
                                    </h2>
                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-10 max-w-[240px]">
                                        {cfg.description}
                                    </p>

                                    <Button className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
                                        {cfg.role === 'LEADER' ? 'CREATE' : 'JOIN'}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Step: Member Flow (Integrated) */}
                {step === 'member-flow' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="max-w-[450px] mx-auto moving-gradient-border rounded-[48px]"
                    >
                        <div className="moving-gradient-border-content bg-white dark:bg-zinc-950 p-10 rounded-[48px] shadow-2xl">
                            {/* Method Toggle */}
                            <div className="flex gap-2 p-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl mb-8 border border-zinc-100 dark:border-zinc-800">
                                <button
                                    onClick={() => setJoinMethod('code')}
                                    className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${joinMethod === 'code' ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-500 border border-zinc-100 dark:border-zinc-700' : 'text-zinc-400 hover:text-zinc-600'}`}
                                >
                                    Invite Code
                                </button>
                                <button
                                    onClick={() => setJoinMethod('search')}
                                    className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${joinMethod === 'search' ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-500 border border-zinc-100 dark:border-zinc-700' : 'text-zinc-400 hover:text-zinc-600'}`}
                                >
                                    Search Squad
                                </button>
                            </div>

                            {joinMethod === 'code' ? (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Hash className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <h3 className="text-xl font-black text-zinc-900 dark:text-white">Enter Secret Code</h3>
                                        <p className="text-xs text-zinc-500 mt-1 font-medium">Ask your Team Leader for the join code.</p>
                                    </div>
                                    <Input
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="E.G. 7K29B1"
                                        className="h-16 text-center text-3xl font-black tracking-[0.4em] rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 uppercase placeholder:text-zinc-200"
                                        maxLength={6}
                                    />
                                    <Button
                                        onClick={handleInviteCode}
                                        disabled={loading || inviteCode.length < 6}
                                        className="w-full h-16 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'AUTHENTICATE & JOIN'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Find squad by name..."
                                            className="h-14 pl-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-sm font-bold placeholder:text-zinc-300"
                                            onKeyDown={(e) => e.key === 'Enter' && searchTeams()}
                                        />
                                    </div>
                                    <Button
                                        onClick={searchTeams}
                                        disabled={loading}
                                        className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                    >
                                        SCAN SECTORS
                                    </Button>

                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                        {searchResults.map(team => (
                                            <div key={team.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-50 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-900 transition-all group">
                                                <div className="min-w-0 pr-4">
                                                    <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">{team.team_name || team.title}</p>
                                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{team.title}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleJoinRequest(team.id)}
                                                    className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-900 dark:bg-emerald-500 text-white group-hover:scale-105 transition-all"
                                                >
                                                    JOIN
                                                </Button>
                                            </div>
                                        ))}
                                        {searchResults.length === 0 && searchQuery && !loading && (
                                            <div className="py-10 text-center">
                                                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest opacity-50">No signals found...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-zinc-50 dark:border-zinc-900 text-center">
                                <button
                                    onClick={() => setStep('role')}
                                    className="text-[10px] font-black text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-[0.3em]"
                                >
                                    ← Return to Roles
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
