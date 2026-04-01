import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { signInWithGoogle, signUpWithEmail, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/onboarding', { replace: true });
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
            // If we have a session (email confirmation off), go to onboarding
            // If no session (email confirmation on), go to verify-email
            if (data?.session) {
                navigate('/onboarding', { replace: true });
            } else {
                toast.info('Please check your email to verify your account.');
                navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
            }
        }
    };

    const socialLogin = async () => {
        try {
            await signInWithGoogle();
            // Trigger welcome notification
            if (Notification.permission === 'granted') {
                new Notification('Welcome to DoneTogether!', { 
                    body: 'Your journey to building elite projects starts now. 🚀',
                    icon: '/favicon.ico'
                });
            }
        } catch (error) {
            toast.error("Failed to sign in with Google");
        }
    };

    return (
        <div className="dashboard-theme relative min-h-screen w-full overflow-hidden bg-white font-sans selection:bg-zinc-900 selection:text-white">
            {/* Background Video */}
            <div className="absolute inset-0">
                <video
                    className="w-full h-full object-cover [transform:scaleY(-1)]"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source
                        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className="absolute inset-0 bg-white/20" />
            </div>



            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center p-6 sm:p-8 lg:p-12 gap-8 min-h-screen py-20 lg:py-12">

                {/* Left Side (Desktop only) - Image on top, text underneath */}
                <div className="hidden lg:flex w-1/2 flex-col justify-center items-center h-full max-w-[580px]">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        className="w-full"
                    >
                        {/* Container background set to solid white to match the illustration perfectly */}
                        <div className="relative overflow-hidden rounded-[40px] border border-zinc-200/50 bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-8 flex items-center justify-center">
                            <img
                                src="/b.png"
                                alt="DoneTogether signup"
                                className="h-[420px] w-full object-contain object-center"
                                loading="lazy"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-50/50 via-transparent to-white/10" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative mt-12 w-full flex flex-col items-center text-center"
                    >
                        <h1 className="font-sans font-extrabold tracking-[-0.03em] text-[#0b0c10] text-2xl md:text-3xl lg:text-[56px] leading-[1.1] shadow-zinc-900/5 antialiased flex flex-wrap justify-center gap-x-3">
                            Start Building
                            <span className="relative inline-block pb-1">
                                Together
                                <motion.svg
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
                                    className="absolute -bottom-1 left-0 w-full h-[10px] text-orange-500/90"
                                    viewBox="0 0 240 12"
                                    fill="none"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M3 9C40 3.5 120 2.5 237 9"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                    />
                                </motion.svg>
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-2xl md:text-3xl text-zinc-800 font-body font-bold max-w-xl mx-auto leading-relaxed antialiased">
                            The platform for student & startup builders.
                        </p>
                    </motion.div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex justify-center items-center">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full max-w-[420px] bg-white/70 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-white/60 shadow-xl"
                    >
                        {/* Brand Mobile */}
                        <div className="flex justify-center mb-10">
                            <Link to="/" className="flex items-center gap-4 group w-fit">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-[18px] sm:rounded-[20px] flex items-center justify-center text-white shadow-2xl group-hover:scale-105 transition-transform duration-300">
                                    <img src="/favicon.ico" alt="Logo" className="w-6 h-6 sm:w-8 sm:h-8 object-contain transition-transform group-hover:scale-110" />
                                </div>
                                <h1 className="font-body font-bold text-2xl sm:text-3xl tracking-tighter text-zinc-900 antialiased">
                                    DoneTogether
                                </h1>
                            </Link>
                        </div>

                        <div className="space-y-1 mb-8 text-center">
                            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight font-body antialiased">Create account</h2>
                            <p className="text-zinc-500 text-[15px] font-body antialiased">Join the community</p>
                        </div>

                        <div className="space-y-5">
                            <Button
                                variant="outline"
                                onClick={socialLogin}
                                className="w-full h-12 rounded-full border-zinc-500 bg-white/80 text-zinc-900  font-medium text-sm gap-3 group shadow-sm hover:bg-white hover:text-black focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                <div className="flex-grow border-t border-zinc-200"></div>
                                <span className="flex-shrink-0 mx-3 text-zinc-400 text-[10px] uppercase font-bold tracking-widest">Or</span>
                                <div className="flex-grow border-t border-zinc-200"></div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-3">
                                    <Input
                                        type="email"
                                        placeholder="Your Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 bg-white/70 border-zinc-200 focus:border-black rounded-xl transition-all pl-4 text-sm font-medium shadow-sm"
                                        required
                                    />
                                    <div className="relative group/pass">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 bg-white/70 border-zinc-200 focus:border-black rounded-xl transition-all pl-4 pr-12 text-sm font-medium shadow-sm"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all focus:outline-none"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-full bg-black text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-black/10 active:scale-[0.98] mt-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            Create Account <ArrowRight className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-[10px] text-center text-zinc-500 leading-relaxed max-w-xs mx-auto pt-2">
                                    By clicking "Create Account", you agree to our <button type="button" onClick={(e) => e.preventDefault()} className="font-semibold text-black hover:underline cursor-pointer">Terms</button> and <button type="button" onClick={(e) => e.preventDefault()} className="font-semibold text-black hover:underline cursor-pointer">Privacy Policy</button>.
                                </p>
                            </form>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-zinc-500 text-[10.5px]">
                                Already have an account?{' '}
                                <Link to="/login" className="text-black font-bold hover:underline underline-offset-4">
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
