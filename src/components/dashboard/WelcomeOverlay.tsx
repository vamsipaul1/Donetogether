import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import { User as UserType } from '@/types/database';

interface WelcomeOverlayProps {
    user: UserType;
    onComplete: () => void;
}

export const WelcomeOverlay = ({ user, onComplete }: WelcomeOverlayProps) => {
    const [step, setStep] = useState(0);
    const firstName = user.full_name?.split(' ')[0] || 'User';

    useEffect(() => {
        // Step 0: Initial delay
        // Step 1: Show "Welcome Name"
        // Step 2: Show "You are a Role"
        // Step 3: Show Button

        const timers = [
            setTimeout(() => setStep(1), 500),
            setTimeout(() => setStep(2), 2000),
            setTimeout(() => setStep(3), 3500),
        ];

        return () => timers.forEach(clearTimeout);
    }, []);

    const handleComplete = async () => {
        try {
            // Update DB regardless of success (optimistic) to prevent loop
            // But we want to be sure.
            const { error } = await supabase
                .from('users')
                .update({ has_seen_welcome: true })
                .eq('id', user.id);

            if (error) {
                console.error("Failed to update welcome status", error);
            }
        } catch (e) {
            console.error(e);
        } finally {
            onComplete();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl font-sans"
        >
            <div className="text-center relative z-10 p-8 max-w-2xl w-full">

                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

                <AnimatePresence mode="wait">
                    {step >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="mb-8"
                        >
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl">
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500">Welcome,</span> <br className="md:hidden" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-violet-500">{firstName}</span>
                            </h1>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {step >= 2 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="mb-10"
                        >
                            <div className="inline-flex flex-col items-center gap-4">
                                <p className="text-xl md:text-2xl text-zinc-400 font-medium type cursor-pointe">You are joining as a</p>
                                {user.role === 'LEADER' ? (
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full group-hover:bg-amber-500/40 transition-all duration-500" />
                                        <span className="relative inline-flex items-center gap-3 text-xl md:text-3xl text-white font-black bg-white/5 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-2xl">
                                            <ShieldCheck className="w-6 h-6 md:w-6 md:h-6 text-amber-500" /> Team Leader
                                        </span>
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full group-hover:bg-emerald-500/40 transition-all duration-500" />
                                        <span className="relative inline-flex items-center gap-3 text-xl md:text-3xl text-white font-black bg-white/5 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-2xl">
                                            <User className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" /> Team Member
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {step >= 3 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Button
                                onClick={handleComplete}
                                className="h-16 px-10 text-lg font-bold rounded-2xl bg-white text-black hover:bg-white/90 shadow-[0_0_40px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95"
                            >
                                Enter Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
