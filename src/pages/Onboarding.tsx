import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [step, setStep] = useState<'name' | 'welcome' | 'role' | 'member-flow' | 'leader-flow'>('name');
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [fullName, setFullName] = useState('');

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
            navigate('/login');
            return;
        }
        setCurrentUser(user);

        // Fetch detailed profile
        const { data: profile } = await supabase
            .from('users')
            .select('full_name, role, onboarding_completed, has_seen_welcome')
            .eq('id', user.id)
            .single();

        // 1. Strict Redirect: If onboarding is marked complete, GO TO DASHBOARD.
        if (profile?.onboarding_completed) {
            navigate('/dashboard');
            return;
        }

        // 2. Fallback: If they have a project, they should be in dashboard
        const { count } = await supabase
            .from('project_members')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (count && count > 0) {
            // Update onboarding_completed for future reference
            await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id);
            navigate('/dashboard');
            return;
        }

        // 3. Flow Logic
        if (profile?.full_name && !profile.full_name.includes('@')) {
            setFullName(profile.full_name);
            // If they have a role but no project -> they need to create/join
            if (profile.role) {
                if (profile.role === 'LEADER') {
                    navigate('/create-project');
                } else {
                    setStep('member-flow');
                }
            } else {
                setStep('welcome');
            }
        }
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
            // 1. First, check if it's a direct Project Join Code
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id, title')
                .eq('join_code', code)
                .single();

            if (project && !projectError) {
                // If found in projects, redirect to profile setup with project id
                navigate(`/setup-profile?code=${code}&projectId=${project.id}`);
                return;
            }

            // 2. If not found in projects, check the invites table
            // Try both 'code' and 'invite_code' column naming variations
            let inviteResult = await supabase
                .from('invites')
                .select('*')
                .eq('code', code)
                .eq('status', 'pending')
                .single();

            if (inviteResult.error || !inviteResult.data) {
                inviteResult = await supabase
                    .from('invites')
                    .select('*')
                    .eq('invite_code', code)
                    .eq('status', 'pending')
                    .single();
            }

            const invite = inviteResult.data;
            if (!invite) {
                throw new Error('Invalid code. Please check and try again.');
            }

            // Redirect with whatever data we found
            const projId = invite.project_id || invite.team_id;
            navigate(`/setup-profile?code=${code}&inviteId=${invite.id}&projectId=${projId}`);
        } catch (error: any) {
            console.error('Code validation error:', error);
            toast.error(error.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleSaveName = async () => {
        if (!fullName.trim()) {
            toast.error('Please enter your full name');
            return;
        }
        setLoading(true);
        try {
            await supabase.from('users').update({ full_name: fullName.trim() }).eq('id', currentUser.id);
            // After saving name show a welcome confirmation before role selection
            setStep('welcome');
        } catch (e) {
            console.error(e);
            toast.error('Failed to save name');
        } finally {
            setLoading(false);
        }
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
                        className="text-[11px] font-bold text-zinc-500 uppercase hover:text-red-500 hover:bg-transparent transition-colors"
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
                        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                            Set up your account
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mb-3">
                        <Typewriter
                            text={
                                step === 'name' ? "First, what's your name?" :
                                    step === 'welcome' ? `Welcome, ${fullName.split(' ')[0]}` :
                                        `Welcome, ${fullName.split(' ')[0]}`
                            }
                            delay={40}
                        />
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-[3px] h-[24px] md:h-[32px] bg-blue-500 ml-2 align-middle rounded-full"
                        />
                    </h1>
                    <p className="text-zinc-500 text-base font-medium max-w-md mx-auto">
                        {step === 'name' ? "This name will be shown on your projects, tasks, and to your team members." : step === 'welcome' ? "Nice to meet you! Next, choose whether you're joining a team or creating one." : "Are you joining an existing team, or are you starting something new?"}
                    </p>
                </motion.div>

                {/* Step: Name Selection */}
                {step === 'name' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-[400px] mx-auto w-full"
                    >
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Your Full Name</label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. Vamsi Rangumudri"
                                    className="h-14 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-transparent text-lg font-bold px-6 focus:border-blue-500 transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                />
                            </div>
                            <Button
                                onClick={handleSaveName}
                                disabled={loading || !fullName.trim()}
                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all group"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step: Welcome (show saved name before role selection) */}
                {step === 'welcome' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-[600px] mx-auto w-full"
                    >
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl text-center space-y-6">
                            <div className="mx-auto w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-4xl font-extrabold text-blue-600">
                                {fullName.split(' ')[0].slice(0, 1).toUpperCase()}
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome, {fullName}</h3>
                            <p className="text-sm text-zinc-500">We'll save this name and use it across your projects and tasks.</p>
                            <div className="flex gap-3 justify-center">
                                <Button onClick={() => setStep('name')} variant="outline" className="rounded-lg">Edit Name</Button>
                                <Button onClick={() => setStep('role')} className="rounded-lg bg-blue-600 text-white">Continue</Button>
                            </div>
                        </div>
                    </motion.div>
                )}

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
                                className="group"
                            >
                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl h-full flex flex-col items-center text-center hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    {/* Badge */}
                                    <div className="mb-6">
                                        <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-blue-600 transition-colors">
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

                                    <Button
                                        variant={cfg.role === 'LEADER' ? undefined : 'outline'}
                                        onClick={() => handleRoleSelect(cfg.role)}
                                        className="w-full mt-auto rounded-xl border-zinc-200 dark:border-zinc-800 font-bold transition-all"
                                    >
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
                                    Team Code
                                </button>
                                <button
                                    onClick={() => setJoinMethod('search')}
                                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${joinMethod === 'search' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                >
                                    Team Name
                                </button>
                            </div>

                            {joinMethod === 'code' ? (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                                            <UserLock className="w-7 h-7 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Enter Invite Code</h3>
                                        <p className="text-sm text-zinc-500 mt-2 font-medium">Enter the 6-digit code shared by your team admin.</p>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                            placeholder="000 000"
                                            className="h-20 text-center text-3xl font-black rounded-[24px] border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/50 uppercase placeholder:text-zinc-200 dark:placeholder:text-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all tracking-[0.2em]"
                                            maxLength={8}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleInviteCode}
                                        disabled={loading || inviteCode.length < 3}
                                        className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Validate & Join Territory'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Find your squad by name..."
                                            className="h-14 pl-14 rounded-2xl bg-zinc-50/50 dark:bg-black/50 border-2 border-zinc-100 dark:border-zinc-800 text-base font-bold transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            onKeyDown={(e) => e.key === 'Enter' && searchTeams()}
                                        />
                                    </div>
                                    <Button
                                        onClick={searchTeams}
                                        disabled={loading}
                                        className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase text-xs transition-all hover:opacity-90 active:scale-[0.98]"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Search Repositories'}
                                    </Button>

                                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                                        <AnimatePresence>
                                            {searchResults.map((team, idx) => (
                                                <motion.div
                                                    key={team.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="group flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer"
                                                >
                                                    <div className="min-w-0 pr-3">
                                                        <p className="font-black text-sm text-zinc-900 dark:text-white truncate flex items-center gap-2">
                                                            {team.team_name || team.title}
                                                            {idx === 0 && <span className="text-[8px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md font-black uppercase">Active</span>}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase truncate">ID: {team.id.split('-')[0]}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleJoinRequest(team.id)}
                                                        className="h-9 px-4 rounded-xl text-[10px] font-black uppercase bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                                    >
                                                        Join
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {searchResults.length === 0 && searchQuery && !loading && (
                                            <div className="py-12 text-center text-zinc-400 animate-in fade-in zoom-in duration-500">
                                                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-100 dark:border-zinc-800">
                                                    <Hash className="w-6 h-6 text-zinc-300" />
                                                </div>
                                                <p className="text-xs font-bold uppercase tracking-wider">No signals found</p>
                                                <p className="text-[10px] mt-1 font-medium">Verify the team name or use a code</p>
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
