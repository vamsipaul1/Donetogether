import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signInWithGoogle, signUpWithEmail, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/onboarding');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        // Pass empty string for fullName as it will be collected in Onboarding
        const { data, error } = await signUpWithEmail(email, password, '');
        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else if (data?.user) {
            toast.success('Account created successfully!');
            if (data?.session) {
                navigate('/onboarding');
            } else {
                toast.info('Please check your email to verify your account.');
                navigate('/login');
            }
        }
    };

    const socialLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            toast.error("Failed to sign in with Google");
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-gradient-to-b from-[#b8dcfd] via-[#e0f1ff] to-[#ffffff] dark:from-zinc-950 dark:to-black font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden relative">
            {/* Texture Overlay (Matching Hero) */}
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
                        className="relative w-full max-w-[480px] flex items-center justify-center"
                    >
                        {/* Glassmorphism Backdrop for Image */}
                        <div className="absolute inset-4 bg-white/30 dark:bg-black/20 backdrop-blur-2xl rounded-[3rem] transform rotate-2 scale-105 border border-white/20 dark:border-white/5" />

                        <img
                            src="/Gemini_Generated_Image_dru0x4dru0x4dru0.png"
                            alt="Student Collaboration"
                            className="relative w-full h-auto object-contain drop-shadow-2xl rounded-[2rem] hover:scale-[1.01] transition-transform duration-500"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-12 text-center"
                    >
                        <h2 className="text-4xl font-serif font-medium text-zinc-900 dark:text-white leading-tight tracking-tight mb-3 text-shadow-sm">
                            Execute your <span className="italic text-zinc-600 dark:text-zinc-400">ambitions</span>.
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-500 font-medium max-w-md mx-auto">
                            The platform for student builders.
                        </p>
                    </motion.div>
                </div>

                {/* Right Side - Form */}
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

                        <div className="space-y-2 mb-8 text-center">
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Create Account</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Join the community.</p>
                        </div>

                        <div className="space-y-5">
                            <Button
                                variant="outline"
                                onClick={socialLogin}
                                className="w-full h-12 rounded-full border-zinc-200 dark:border-zinc-700 hover:bg-white hover:text-black dark:hover:bg-zinc-800 transition-all font-medium text-sm gap-3 bg-white/50 dark:bg-black/50 text-zinc-900 dark:text-white group shadow-sm"
                            >
                                <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-300" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Sign up with Google</span>
                            </Button>

                            <div className="relative flex py-1 items-center">
                                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
                                <span className="flex-shrink-0 mx-3 text-zinc-400 text-[10px] uppercase font-bold tracking-widest">Or</span>
                                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-3">
                                    <Input
                                        type="email"
                                        placeholder="Your Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 bg-white/50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white rounded-xl transition-all pl-4 text-sm font-medium shadow-sm"
                                        required
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 bg-white/50 dark:bg-black/50 border-zinc-200 dark:border-zinc-800 focus:border-black dark:focus:border-white rounded-xl transition-all pl-4 text-sm font-medium shadow-sm"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-black/10 dark:shadow-white/5 active:scale-[0.98] mt-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            Create Account <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-center text-zinc-500 leading-relaxed max-w-xs mx-auto pt-1">
                                    By clicking "Create Account", you agree to our <a href="#" className="font-semibold text-black dark:text-white hover:underline">Terms</a> and <a href="#" className="font-semibold text-black dark:text-white hover:underline">Privacy Policy</a>.
                                </p>
                            </form>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-zinc-500 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-black dark:text-white font-bold hover:underline underline-offset-4">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
