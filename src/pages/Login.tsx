import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Chrome, ArrowRight, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user, signInWithEmail, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        const { error } = await signInWithEmail(email, password);
        setIsLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Successfully logged in!');
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F5F0] shadow-xxl dark:bg-zinc-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 dotted-pattern transition-colors duration-500 relative">
            <div className="absolute top-6 right-6 z-50">
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

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[450px] bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 sm:p-12 relative border border-zinc-100 dark:border-zinc-800"
            >
                <div className="space-y-8">
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center"
                        >
                            <img src="/favicon.ico" alt="Logo" className="w-12 h-12 rounded-2xl shadow-sm" />
                        </motion.div>
                        <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
                        <p className="text-muted-foreground">Log in to your project dashboard</p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            onClick={signInWithGoogle}
                            className="w-full h-14 rounded-full border-zinc-200 dark:border-zinc-800 text-white font-semibold flex items-center justify-center gap-3 transition-all bg-black dark:hover:bg-zinc-900 hover:bg-black"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-border"></div>
                            <span className="mx-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">OR EMAIL</span>
                            <div className="flex-grow border-t border-border"></div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-4">
                                <Input
                                    type="email"
                                    placeholder="Email Address"
                                    className="h-14 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-600 dark:focus:border-zinc-600 focus:bg-white transition-all text-base rounded-full pl-6"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="h-14 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-600 dark:focus:border-zinc-600 focus:bg-white transition-all text-base rounded-full pl-6"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-full text-white  dark:hover:bg-emerald-900/100 dark:text-emerald-500 border-none text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm"
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    </div>

                    <div className="pt-6 text-center space-y-4 border-t border-border/50">
                        <p className="px-2 text-zinc-600 dark:text-zinc-500 text-sm">
                            Don't have an account?{' '}
                            <Link to="/signup" className="px-2 text-zinc-600 dark:text-zinc-500 font-bold hover:underline underline-offset-4 decoration-2 decoration-green-500">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
