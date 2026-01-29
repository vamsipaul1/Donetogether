import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Users } from 'lucide-react';

const JoinProject = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const codeParam = searchParams.get('code');
        if (codeParam) {
            setCode(codeParam.toUpperCase());
        }
    }, [searchParams]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code) {
            toast.error('Please enter a join code');
            return;
        }

        if (!user) {
            toast.error('You must be logged in to join a project');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            // Safety: Ensure user exists in public.users and onboarding is marked complete
            const { error: syncError } = await supabase.from('users').upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
                onboarding_completed: true
            });

            if (syncError) {
                console.error('User sync error:', syncError);
                // This error is not critical enough to stop the join process, but should be logged.
                // toast.error('Failed to sync user data. Please try again.');
            }

            // 1. Find the project with more details for better error messages
            const { data: project, error: projectError } = await supabase
                .from('projects')
                .select('id, title, expected_team_size, is_team_complete')
                .eq('join_code', code.toUpperCase())
                .single();

            if (projectError) {
                console.error('Project lookup error:', projectError);
                throw new Error('Invalid invitation code. Please check and try again.');
            }

            if (!project) {
                throw new Error('Invalid invitation code. Please check and try again.');
            }

            // 2. Check if already a member
            const { data: existingMember } = await supabase
                .from('project_members')
                .select('id')
                .eq('project_id', project.id)
                .eq('user_id', user.id)
                .single();

            if (existingMember) {
                toast.error('You are already a member of this project');
                navigate('/dashboard');
                return;
            }

            // 3. Check if team is already full
            const { data: members, error: countError } = await supabase
                .from('project_members')
                .select('id')
                .eq('project_id', project.id);

            if (countError) {
                console.error('Member count error:', countError);
            }

            const currentCount = members?.length || 0;
            if (currentCount >= (project.expected_team_size || 6)) {
                throw new Error(`This team is already full (${currentCount}/${project.expected_team_size} members)`);
            }

            // 4. Join as member
            const { error: joinError } = await supabase
                .from('project_members')
                .insert({
                    project_id: project.id,
                    user_id: user.id,
                    role: 'member'
                });

            if (joinError) {
                console.error('Join error:', joinError);
                if (joinError.code === '23505') {
                    throw new Error('You are already a member of this project');
                }
                if (joinError.message.includes('foreign key')) {
                    throw new Error('Unable to join. Please try logging out and back in.');
                }
                throw new Error('Failed to join project. Please try again.');
            }

            toast.success(`✅ Joined "${project.title}" successfully!`);
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

                <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 sm:p-12 shadow-xl border border-zinc-200 dark:border-zinc-800 text-center">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-[28px] flex items-center justify-center mx-auto mb-8 text-blue-600">
                        <Users className="w-10 h-10" />
                    </div>

                    <h1 className="text-3xl font-bold mb-3">Join a Team</h1>
                    <p className="text-muted-foreground mb-10">Enter the project invitation code to join your teammates.</p>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="relative">
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE"
                                className="h-16 text-center text-3xl font-black tracking-[0.3em] rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 uppercase placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                maxLength={6}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || code.length < 6}
                            className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Join Project'}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default JoinProject;
