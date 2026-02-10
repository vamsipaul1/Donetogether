import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupProfile() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'name' | 'success'>('name');

    const inviteCode = searchParams.get('code');
    const inviteId = searchParams.get('inviteId');
    const projectId = searchParams.get('projectId');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) {
            toast.error('Please enter your full name');
            return;
        }

        setIsLoading(true);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('User not authenticated');
                navigate('/login');
                return;
            }

            // Update profile with display name - also mark onboarding as completed
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    display_name: fullName.trim(),
                    onboarding_completed: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Also update users table if it's separate
            await supabase.from('users').update({
                full_name: fullName.trim(),
                onboarding_completed: true
            }).eq('id', user.id);

            // If there's an invite or project ID, join the project
            if (inviteCode && (inviteId || projectId)) {
                let targetProjectId = projectId;
                let role = 'member';

                if (inviteId) {
                    // Try to fetch invite details with flexible column names
                    let inviteResult = await supabase
                        .from('invites')
                        .select('*')
                        .eq('id', inviteId)
                        .single();

                    if (inviteResult.data) {
                        targetProjectId = inviteResult.data.project_id || inviteResult.data.team_id;
                        role = inviteResult.data.role || 'member';

                        // Mark invite as used
                        await supabase
                            .from('invites')
                            .update({ status: 'accepted' })
                            .eq('id', inviteId);
                    }
                }

                if (targetProjectId) {
                    // Add user to project
                    const { error: memberError } = await supabase
                        .from('project_members')
                        .insert({
                            project_id: targetProjectId,
                            user_id: user.id,
                            role: role
                        });

                    if (memberError && memberError.code !== '23505') { // Ignore duplicate errors
                        console.error('Project member insert error:', memberError);
                    }
                }
            }

            // Show success animation
            setStep('success');

            // Navigate to dashboard after brief delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error: any) {
            console.error('Profile setup error:', error);
            toast.error(error.message || 'Failed to set up profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-black dark:to-purple-950 flex items-center justify-center p-4 font-sans">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <AnimatePresence mode="wait">
                {step === 'name' ? (
                    <motion.div
                        key="name-step"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-md"
                    >
                        {/* Main Card */}
                        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/5 border border-zinc-200/50 dark:border-zinc-800/50 p-8 md:p-10 relative overflow-hidden">
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/25"
                                >
                                    <User className="w-10 h-10 text-white" strokeWidth={2.5} />
                                </motion.div>

                                {/* Title */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-center mb-8"
                                >
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                                        <span className="text-xs font-black text-purple-500 uppercase">One Last Step</span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-3">
                                        What's your name?
                                    </h1>
                                    <p className="text-zinc-600 dark:text-zinc-400 font-medium text-sm leading-relaxed">
                                        Help your team recognize you by sharing your full name
                                    </p>
                                </motion.div>

                                {/* Form */}
                                <motion.form
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Full Name
                                        </label>
                                        <Input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="John Doe"
                                            className="h-14 px-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base font-semibold placeholder:text-zinc-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading || !fullName.trim()}
                                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                Setting up...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Continue
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                </motion.form>

                                {/* Help text */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-center text-xs text-zinc-500 dark:text-zinc-500 mt-6 font-medium"
                                >
                                    This will be visible to your team members
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success-step"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                            className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30"
                        >
                            <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-black text-zinc-900 dark:text-white mb-2"
                        >
                            All set, {fullName.split(' ')[0]}!
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-zinc-600 dark:text-zinc-400 font-medium"
                        >
                            Taking you to your dashboard...
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
