import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const checkVerification = async () => {
        setIsLoading(true);
        // Refresh session to check for updates
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            toast.success('Email verified successfully!');
            // Force reload to ensure all states are clean or just navigate
            window.location.href = '/dashboard';
        } else {
            // Also try reloading the user on the existing session if it exists but was unconfirmed
            // But usually, getSession is enough if they verified in another tab
            toast.info('Still waiting for verification...');
        }
        setIsLoading(false);
    };

    const handleResend = async () => {
        if (!email) return;

        setIsResending(true);
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });

        setIsResending(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Verification email resent!');
        }
    };

    // Auto-detect verification
    useState(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || session) {
                window.location.href = '/dashboard';
            }
        });
        return () => subscription.unsubscribe();
    });

    return (
        <div className="min-h-screen w-full flex bg-gradient-to-b from-[#b8dcfd] via-[#e0f1ff] to-[#ffffff] dark:from-zinc-950 dark:to-black font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden relative">
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none bg-[url('/image%20copy%208.png')] bg-cover bg-center z-0" />

            {/* Ambience */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/40 dark:bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2 z-0" />

            <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 relative z-10 gap-8 h-screen">

                {/* Left Side - Visuals */}
                <div className="hidden lg:flex w-1/2 flex-col justify-center items-center h-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative w-full max-w-[420px] flex items-center justify-center"
                    >
                        {/* Glassmorphism Backdrop */}
                        <div className="absolute inset-4 bg-white/30 dark:bg-black/20 backdrop-blur-2xl rounded-[3rem] transform -rotate-1 scale-105 border border-white/20 dark:border-white/5" />

                        <div className="relative w-full aspect-square bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[2rem] flex items-center justify-center border border-white/20">
                            <Mail className="w-32 h-32 text-blue-500/80 drop-shadow-2xl" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-12 text-center"
                    >
                        <h2 className="text-4xl font-serif font-medium text-zinc-900 dark:text-white leading-tight tracking-tight mb-2 text-shadow-sm">
                            Verify your <span className="italic text-zinc-600 dark:text-zinc-400">identity</span>.
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-500 font-medium">
                            One step closer to the workspace.
                        </p>
                    </motion.div>
                </div>

                {/* Right Side - Content */}
                <div className="w-full lg:w-1/2 flex justify-center items-center">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full max-w-[420px] bg-white/60 dark:bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/50 dark:border-white/10 shadow-xl"
                    >
                        {/* Brand Mobile */}
                        <div className="flex justify-center mb-8">
                            <Link to="/" className="flex items-center gap-3 group w-fit">
                                <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    <img src="/favicon.ico" alt="Logo" className="w-5 h-5 object-contain" />
                                </div>
                                <span className="font-serif font-bold text-2xl tracking-tighter text-zinc-900 dark:text-white group-hover:opacity-80 transition-opacity">
                                    DoneTogether
                                </span>
                            </Link>
                        </div>

                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Check your inbox</h1>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                    We've sent a verification link to <br />
                                    <span className="font-bold text-zinc-900 dark:text-white">{email || 'your email'}</span>.
                                </p>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border border-zinc-200 dark:border-zinc-800">
                                Click the link in the email to activate your account and access the dashboard.
                            </div>

                            <div className="space-y-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleResend}
                                    disabled={isResending || !email}
                                    className="w-full h-12 rounded-full border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-all font-medium text-sm gap-2"
                                >
                                    {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                    Resend Email
                                </Button>

                                <Button
                                    variant="default"
                                    onClick={checkVerification}
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-black/10 dark:shadow-white/5"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="flex items-center gap-2">I've Verified My Email <ArrowRight className="w-4 h-4" /></div>}
                                </Button>

                                <Link to="/login">
                                    <Button
                                        variant="ghost"
                                        className="w-full h-12 rounded-full font-medium text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                    >
                                        Back to Login <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
