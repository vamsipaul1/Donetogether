import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, Hash, Loader2, UserLock, LogOut } from 'lucide-react';
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
        // Sanitize code: remove spaces and uppercase
        const code = inviteCode.replace(/\s/g, '').toUpperCase();

        try {
            const { data: projects, error } = await supabase
                .from('projects')
                .select('*')
                .eq('join_code', code)
                .single();

            if (error || !projects) throw new Error('Invalid invite code. Please check and try again.');

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
        } catch (error: any) {
            console.error('Join error:', error);
            let msg = error.message || 'Failed to join team.';
            if (error.code === '23505') msg = 'You are already a member of this team.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">


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
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                            Set up your account
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">
                        <Typewriter text="Welcome to DoneTogether" delay={40} />
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-[3px] h-[24px] md:h-[32px] bg-blue-500 ml-2 align-middle rounded-full"
                        />
                    </h1>
                    <p className="text-zinc-500 text-base font-medium max-w-md mx-auto">
                        Choose how you want to join the platform today.
                    </p>
                </motion.div>

                {/* Step: Role Selection */}
                {step === 'role' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto px-4">
                        {[
                            {
                                role: 'MEMBER' as const,
                                title: 'Team Member',
                                description: 'Join an existing team via invite code or search for your squad.',
                                image: '/image copy.png',
                                badge: 'Collaboration'
                            },
                            {
                                role: 'LEADER' as const,
                                title: 'Team Leader',
                                description: 'Create a new workspace, invite members, and manage tasks.',
                                image: '/image copy 2.png',
                                badge: 'Management'
                            }

                        ].map((cfg, idx) => (
                            <motion.div
                                key={cfg.role}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 + idx * 0.1 }}
                                className="group cursor-pointer"
                                onClick={() => handleRoleSelect(cfg.role)}
                            >
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl h-full flex flex-col items-center text-center hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    {/* Badge */}
                                    <div className="mb-6">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-blue-600 transition-colors">
                                            {cfg.badge}
                                        </span>
                                    </div>

                                    {/* Icon Container */}
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center mb-6 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:scale-110 transition-all duration-300">
                                        <img
                                            src={cfg.image}
                                            alt={cfg.title}
                                            className="w-8 h-8 object-contain dark:invert"
                                        />
                                    </div>

                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                        {cfg.title}
                                    </h2>
                                    <p className="text-sm text-zinc-500 leading-relaxed mb-8 max-w-[220px]">
                                        {cfg.description}
                                    </p>

                                    <Button variant="outline" className="w-full mt-auto rounded-xl border-zinc-200 dark:border-zinc-800 font-bold group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                        {cfg.role === 'LEADER' ? 'Create Workspace' : 'Join Workspace'}
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
                        className="max-w-[450px] mx-auto w-full"
                    >
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl">
                            {/* Method Toggle */}
                            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl mb-8">
                                <button
                                    onClick={() => setJoinMethod('code')}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${joinMethod === 'code' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                >
                                    Invite Code
                                </button>
                                <button
                                    onClick={() => setJoinMethod('search')}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${joinMethod === 'search' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                >
                                    Search Teams
                                </button>
                            </div>

                            {joinMethod === 'code' ? (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <UserLock className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Enter Invite Code</h3>
                                        <p className="text-sm text-zinc-500 mt-2">Enter the 6-digit code shared by your team admin.</p>
                                    </div>
                                    <Input
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="000000"
                                        className="h-14 text-center text-2xl font-bold tracking-[0.25em] rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-transparent uppercase placeholder:text-zinc-300 focus:border-blue-500 transition-colors"
                                        maxLength={8}
                                    />
                                    <Button
                                        onClick={handleInviteCode}
                                        disabled={loading || inviteCode.length < 3}
                                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Team'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search for your team..."
                                            className="h-12 pl-11 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm font-medium"
                                            onKeyDown={(e) => e.key === 'Enter' && searchTeams()}
                                        />
                                    </div>
                                    <Button
                                        onClick={searchTeams}
                                        disabled={loading}
                                        className="w-full h-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-sm"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                                    </Button>

                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        {searchResults.map(team => (
                                            <div key={team.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <div className="min-w-0 pr-3">
                                                    <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">{team.team_name || team.title}</p>
                                                    <p className="text-xs text-zinc-500 mt-0.5">{team.title}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleJoinRequest(team.id)}
                                                    className="h-8 px-3 rounded-lg text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-black"
                                                >
                                                    Join
                                                </Button>
                                            </div>
                                        ))}
                                        {searchResults.length === 0 && searchQuery && !loading && (
                                            <div className="py-8 text-center text-zinc-400">
                                                <p className="text-sm">No teams found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
                                <button
                                    onClick={() => setStep('role')}
                                    className="text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                >
                                    Back to Role Selection
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
