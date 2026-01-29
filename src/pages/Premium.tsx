import { motion } from 'framer-motion';
import { Sparkles, Crown, BrainCircuit, TrendingUp, Calendar, Gem, GraduationCap, FileText, Users, MessageSquare, CheckCircle2, History, ShieldCheck, GanttChartSquare, Database, Lock, Star, BadgePercent } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Premium = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-[#F0F5F0] dark:bg-zinc-950 font-sans selection:bg-violet-500/30 overflow-x-hidden">
            <Navbar isDark={isDark} toggleTheme={toggleTheme} />

            <main className="relative pt-24 pb-20 px-4 sm:px-6">
                {/* Background Gradients (Scaled Down) */}
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    {/* Header */}
                    <div className="mb-14 space-y-5">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 font-bold text-[11px] uppercase tracking-widest border border-violet-200 dark:border-violet-800"
                        >
                            <BadgePercent className="w-3.5 h-3.5" />
                            Premium Suite for Teams
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight"
                        >
                            Supercharge your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-amber-500 to-amber-600 animate-gradient-x">Project.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-zinc-500 dark:text-zinc-500 max-w-xl mx-auto font-medium leading-relaxed"
                        >
                            Whether you're a standard project team or running a complex capstone, we have the toolkit to ensure you finish first.
                        </motion.p>
                    </div>

                    {/* Cards Container */}
                    <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto pb-10 pt-8 snap-x snap-mandatory scrollbar-hide px-4 -mx-4">

                        {/* Student Pro (RECOMMENDED) */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            onHoverStart={() => setHoveredCard('pro')}
                            onHoverEnd={() => setHoveredCard(null)}
                            className="group relative p-1 rounded-[36px] transition-all duration-300 hover:scale-[1.01]"
                        >
                            {/* Moving Border Gradient */}
                            <div className="absolute inset-0 rounded-[36px] bg-gradient-to-r from-violet-400 via-fuchsia-500 to-violet-400 bg-[length:200%_200%] animate-gradient-xy opacity-100 shadow-[0_0_40px_-10px_rgba(139,92,246,0.25)]" />

                            <div className="relative bg-white dark:bg-zinc-900/90 backdrop-blur-3xl rounded-[34px] p-8 h-full border border-violet-100 dark:border-violet-900/50 text-left flex flex-col shadow-xl">
                                {/* Recommended Badge */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-violet-500/30 flex items-center gap-2 z-20">
                                    <Star className="w-4 h-4 fill-current animate-pulse" /> Recommended
                                </div>
                                <div className="flex justify-between items-start mb-6 pt-2">
                                    <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400">
                                        <Gem className="w-7 h-7" />
                                    </div>
                                    <div className="px-3.5 py-1.5 rounded-full bg-violet-100/50 dark:bg-violet-900/20 text-[11px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                                        Team Essentials
                                    </div>
                                </div>

                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Student Pro</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium mb-8">Everything for a semester project.</p>

                                <div className="space-y-6 flex-1 mb-8">
                                    <h4 className="text-[12px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-600">Necessary Features</h4>
                                    <ul className="space-y-4">
                                        {[
                                            { icon: Users, text: "Real-time Collaboration", desc: "Work together instantly" },
                                            { icon: Calendar, text: "Shared Team Calendar", desc: "Sync deadlines for everyone" },
                                            { icon: BrainCircuit, text: "AI Project Architect", desc: "Break down goals automatically" },
                                            { icon: MessageSquare, text: "Basic Team Chat", desc: "Contextual task discussions" },
                                            { icon: CheckCircle2, text: "Unlimited Tasks", desc: "No limits on project size" },
                                            { icon: History, text: "30-Day History", desc: "Restore deleted items" },
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3.5 text-zinc-700 dark:text-zinc-300 font-bold text-[13px] group/item">
                                                <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5">
                                                    <feature.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p>{feature.text}</p>
                                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mt-0.5 leading-tight">{feature.desc}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button className="w-full h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02]">
                                    Opening Soon
                                </Button>
                            </div>
                        </motion.div>

                        {/* Student Ultimate (GOLD THEME) */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            onHoverStart={() => setHoveredCard('ultimate')}
                            onHoverEnd={() => setHoveredCard(null)}
                            className="group relative p-1 rounded-[36px] transition-all duration-300 hover:scale-[1.01]"
                        >
                            {/* Moving Border Gradient - Subtle Gold */}
                            <div className="absolute inset-0 rounded-[36px] bg-gradient-to-r from-zinc-200 via-amber-300 to-zinc-200 dark:from-zinc-800 dark:via-amber-800/50 dark:to-zinc-800 bg-[length:200%_200%] animate-gradient-xy opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative bg-white dark:bg-zinc-900/80 backdrop-blur-3xl rounded-[34px] p-8 h-full border border-zinc-200 dark:border-zinc-800 group-hover:border-transparent transition-colors duration-300 text-left flex flex-col shadow-xl">

                                <div className="flex justify-between items-start mb-6 pt-2">
                                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-500">
                                        <Crown className="w-7 h-7" />
                                    </div>
                                    <div className="px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-[11px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-800">
                                        Advanced
                                    </div>
                                </div>

                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Student Ultimate</h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium mb-8">For Capstone projects & leaders.</p>

                                <div className="space-y-6 flex-1 mb-8">
                                    <h4 className="text-[12px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-600">Advanced Control</h4>
                                    <ul className="space-y-4">
                                        {[
                                            { icon: GraduationCap, text: "Professor Sync Portal", desc: "Live progress dashboard" },
                                            { icon: FileText, text: "Auto-Generate Reports", desc: "PDF export in one click" },
                                            { icon: Users, text: "Team Pulse & Contribution", desc: "Detect inactive members" },
                                            { icon: TrendingUp, text: "Project Timeline AI", desc: "Predicts missed deadlines" },
                                            //   { icon: GanttChartSquare, text: "Gantt Timeline View", desc: "Advanced scheduling" },
                                            // this one already implemented
                                            { icon: Database, text: "Unlimited File Storage", desc: "Store all project assets" },
                                            { icon: ShieldCheck, text: "Custom Permissions", desc: "Role-based access control" },
                                            { icon: Lock, text: "SAML / SSO", desc: "University authentication" },
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3.5 text-zinc-700 dark:text-zinc-300 font-bold text-[13px] group/item">
                                                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 flex-shrink-0 mt-0.5">
                                                    <feature.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p>{feature.text}</p>
                                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mt-0.5 leading-tight">{feature.desc}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button variant="outline" disabled className="w-full h-14 rounded-2xl border-2 border-amber-300 text-amber-700 dark:text-amber-500 font-bold text-sm shadow-sm opacity-80 cursor-not-allowed uppercase tracking-widest">
                                    Next Update
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom CTA with BITS Colors Insane Underline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-14 h-24 pt-6 text-center"
                    >
                        <p className="text-zinc-500 dark:text-zinc-500 text-[11px] font-bold tracking-wider uppercase mb-2">
                            Trusted by college students
                        </p>
                        <div className="relative inline-block pb-8">
                            <span className="text-xl md:text-[1.5rem] font-black text-zinc-800 dark:text-zinc-200 tracking-normal relative z-10 px-2 block">
                                <span className="text-pink-500 tracking-wider">B</span>
                                <span className="text-lime-500 tracking-wider">I</span>
                                <span className="text-yellow-500 tracking-wider">T</span>
                                <span className="text-blue-500 tracking-wider">S</span>
                                <span className="bg-gradient-to-r from-violet-600 to-amber-500 bg-clip-text text-transparent ml-2">VIZAG  </span> <span className="px-1"> Students</span>
                            </span>

                            {/* SVG with Gradient Definition */}
                            <motion.svg
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
                                className="absolute top-10 left-1/2 transform -translate-x-1/2 w-full h-[20px] z-0"
                                viewBox="0 0 200 12"
                                fill="none"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient id="bits-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ec4899" /> {/* Pink */}
                                        <stop offset="33%" stopColor="#84cc16" /> {/* Lime */}
                                        <stop offset="66%" stopColor="#eab308" /> {/* Yellow */}
                                        <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
                                    </linearGradient>
                                </defs>
                                <motion.path
                                    d="M2 9C40 2 90 -2 198 9"
                                    stroke="url(#bits-gradient)"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                            </motion.svg>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Premium;
