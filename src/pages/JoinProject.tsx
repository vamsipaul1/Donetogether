import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Users, CheckCircle2, ArrowRight } from 'lucide-react';

type ProjectDetails = {
    id: string;
    title: string;
    team_name: string;
    expected_team_size: number;
    is_team_complete: boolean;
    currentMemberCount: number;
};

const JoinProject = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);

    useEffect(() => {
        const codeParam = searchParams.get('code');
        if (codeParam) {
            setCode(codeParam.toUpperCase());
            // Auto-verify if code comes from URL
            handleVerifyCode(codeParam.toUpperCase());
        }
    }, [searchParams]);

    const handleVerifyCode = async (codeToVerify?: string) => {
        const verifyCode = codeToVerify || code;

        if (!verifyCode || verifyCode.length < 6) {
            toast.error('Please enter a valid 6-character code');
            return;
        }

        if (!user) {
            toast.error('You must be logged in to join a project');
            navigate('/login');
            return;
        }

        setVerifying(true);
        try {
            // Find the project
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id, title, team_name, expected_team_size, is_team_complete')
                .eq('join_code', verifyCode.toUpperCase())
                .single();

            if (projectError || !project) {
                throw new Error('Invalid invitation code. Please check and try again.');
            }

            // Check if already a member
            const { data: existingMember } = await supabase
                .from('project_members')
                .select('id')
                .eq('project_id', project.id)
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingMember) {
                toast.error('You are already a member of this project');
                navigate('/dashboard');
                return;
            }

            // Get current member count
            const { data: members } = await supabase
                .from('project_members')
                .select('id')
                .eq('project_id', project.id);

            const currentCount = members?.length || 0;

            if (currentCount >= (project.expected_team_size || 6)) {
                throw new Error(`This team is already full (${currentCount}/${project.expected_team_size} members)`);
            }

            // Show project details
            setProjectDetails({
                ...project,
                currentMemberCount: currentCount
            });

        } catch (error: unknown) {
            console.error('Verify code error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to verify code');
            setProjectDetails(null);
        } finally {
            setVerifying(false);
        }
    };

    const handleJoin = async () => {
        if (!user || !projectDetails) return;

        setLoading(true);
        try {
            // Safety: Ensure user exists in public.users
            const { error: syncError } = await supabase.from('users').upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
                onboarding_completed: true
            });

            if (syncError) {
                console.error('User sync error:', syncError);
            }

            // Join as member
            const { error: joinError } = await supabase
                .from('project_members')
                .insert({
                    project_id: projectDetails.id,
                    user_id: user.id,
                    role: 'member'
                });

            if (joinError) {
                console.error('Join error:', joinError);
                if (joinError.code === '23505') {
                    throw new Error('You are already a member of this project');
                }
                throw new Error('Failed to join project. Please try again.');
            }

            toast.success(`✅ Successfully joined "${projectDetails.team_name || projectDetails.title}"!`);
            navigate('/dashboard');
        } catch (error: unknown) {
            console.error('Join project error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to join project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F5F0] dark:bg-zinc-950 dotted-pattern py-12 px-4 flex flex-col items-center justify-center transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <Button
                    variant="ghost"
                    onClick={() => navigate('/dashboard')}
                    className="mb-8 rounded-full"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>

                <AnimatePresence mode="wait">
                    {!projectDetails ? (
                        // Step 1: Enter Code
                        <motion.div
                            key="enter-code"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 sm:p-12 shadow-xl border border-zinc-200 dark:border-zinc-800 text-center"
                        >
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-[28px] flex items-center justify-center mx-auto mb-8 text-blue-600">
                                <Users className="w-10 h-10" />
                            </div>

                            <h1 className="text-3xl font-bold mb-3">Join a Team</h1>
                            <p className="text-muted-foreground mb-10">Enter the project invitation code to join your teammates.</p>

                            <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }} className="space-y-6">
                                <div className="relative">
                                    <Input
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE"
                                        className="h-16 text-center text-3xl font-black rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 uppercase placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={verifying || code.length < 6}
                                    className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                                >
                                    {verifying ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify Code'}
                                </Button>
                            </form>
                        </motion.div>
                    ) : (
                        // Step 2: Confirm Join
                        <motion.div
                            key="confirm-join"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 sm:p-12 shadow-xl border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2">Project Found!</h1>
                                <p className="text-muted-foreground">Confirm you want to join this team</p>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-6 mb-8 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Project Title</p>
                                    <p className="text-xl font-bold text-zinc-900 dark:text-white">{projectDetails.title}</p>
                                </div>

                                {projectDetails.team_name && (
                                    <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Team Name</p>
                                        <p className="text-xl font-bold text-zinc-900 dark:text-white">{projectDetails.team_name}</p>
                                    </div>
                                )}

                                <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Team Size</p>
                                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                        {projectDetails.currentMemberCount + 1} / {projectDetails.expected_team_size} members
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={handleJoin}
                                    disabled={loading}
                                    className="w-full h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-none transition-all group"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            Join Team
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={() => {
                                        setProjectDetails(null);
                                        setCode('');
                                    }}
                                    variant="ghost"
                                    className="w-full h-12 rounded-full font-medium"
                                    disabled={loading}
                                >
                                    Try Different Code
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default JoinProject;

