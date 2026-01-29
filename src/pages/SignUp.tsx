import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Mail, ArrowRight, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignUp = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
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
        if (!email || !password || !fullName) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        const { data, error } = await signUpWithEmail(email, password, fullName);
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

    return (
        <div className="min-h-screen bg-[#F0F5F0] dark:bg-zinc-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 dotted-pattern transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1100px] bg-white dark:bg-card rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row min-h-[700px] border border-zinc-100 dark:border-zinc-800"
            >
                {/* Left Section - 3D Illustration */}
                <div className="hidden lg:flex lg:w-1/2 bg-[#F8FAF8] dark:bg-emerald-950/10 relative items-center justify-center p-12 overflow-hidden border-r border-zinc-100 dark:border-zinc-800">
                    {/* Abstract decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="relative z-10 w-full text-center space-y-20 pt-0 pb-10"
                    >
                        <div className="relative inline-block">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <img
                                    src="/signup-illustration.png"
                                    alt="Student working"
                                    className="w-full h-auto max-w-sm rounded-2xl object-contain mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                                />
                            </motion.div>
                            <div className="px-19 pt-8 pb-10 pr-19">
                                <h2 className="text-3xl font-black text-zinc-700 dark:text-white">
                                    Start Together, build together{' '}
                                    <span className="relative inline-block">
                                        <span className="relative z-10 text-emerald-500 pr-3 top-1 pt-5">Done Together</span>
                                        <motion.svg
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
                                            viewBox="0 0 300 20"
                                            className="absolute top-10 -bottom-3 left-0 w-full h-5"
                                            preserveAspectRatio="none"
                                        >
                                            <defs>
                                                <linearGradient id="signature-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="50%" stopColor="#06b6d4" />
                                                    <stop offset="100%" stopColor="#8b5cf6" />
                                                </linearGradient>
                                            </defs>
                                            <motion.path
                                                d="M5 10C60 2 240 2 295 10"
                                                stroke="url(#signature-gradient)"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                fill="none"
                                            />
                                        </motion.svg>
                                    </span>
                                </h2>
                            </div>
                        </div>

                    </motion.div>
                </div>

                <div className="flex-1 flex flex-col p-6 sm:p-10 justify-center relative">
                    <div className="absolute top-6 right-6">
                        {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-full p-0 flex items-center justify-center transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <AnimatePresence mode="wait">
                                {isDark ? (
                                    <motion.div
                                        key="sun"
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 90 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Sun className="h-5 w-5 text-yellow-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="moon"
                                        initial={{ scale: 0, rotate: 90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: -90 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Moon className="h-5 w-5 text-zinc-600" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button> */}
                    </div>

                    <div className="max-w-[360px] mx-auto w-full space-y-6">
                        <div className="text-center space-y-3">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-center"
                            >
                                <img src="/favicon.ico" alt="Logo" className="w-10 h-10 rounded-xl" />
                            </motion.div>
                            <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                            <p className="text-muted-foreground">Get started for free</p>
                        </div>

                        <div className="space-y-4">
                            <Button
                                variant="outline"
                                onClick={signInWithGoogle}
                                className="w-full h-12 justify-center rounded-full border border-black hover:bg-black hover:text-white"
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-border"></div>
                                <span className="mx-4 text-muted-foreground/80 text-[10px] font-black tracking-widest uppercase">OR</span>
                                <div className="flex-grow border-t border-border"></div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Full Name"
                                        className="h-12 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-full pl-5"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                    <Input
                                        type="email"
                                        placeholder="Email Address"
                                        className="h-12 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-full pl-5"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        className="h-12 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-full pl-5"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-full bg-[#E2F0D9] hover:bg-[#C9D6C5] text-black dark:bg-emerald-900/40 dark:hover:bg-emerald-900/100 dark:text-emerald-500 border-none text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                                >
                                    {isLoading ? 'Creating Account...' : 'Continue'}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>

                        <div className="pt-4 text-center">
                            <p className="text-zinc-600 dark:text-zinc-500 text-sm">
                                Already have an account?{'  '}
                                <Link to="/login" className="px-2 text-zinc-600 dark:text-zinc-500 text-[16px] underline font-bold hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignUp;
