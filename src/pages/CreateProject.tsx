import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Calendar as CalendarIcon, ArrowRight, ShieldCheck, Search, Users, Sparkles, Target } from 'lucide-react';

const domains = [
    'Web Development',
    'Mobile Apps',
    'Machine Learning',
    'UI/UX Design',
    'Data Science',
    'Game Development',
    'Blockchain',
    'IoT',
    'Data Analytics',
    'Other',
];

const durations = [
    '1-2 weeks',
    '2-4 weeks',
    '1-2 months',
    '2-3 months',
    '3-6 months',
    '6+ months',
];

const CreateProject = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<{
        title: string;
        team_name: string;
        domain: string;
        goal: string;
        duration: string;
        teamSize: number;
        startDate: Date | undefined;
        endDate: Date | undefined;
    }>({
        title: '',
        team_name: '',
        domain: '',
        goal: '',
        duration: '',
        teamSize: 4,
        startDate: undefined,
        endDate: undefined,
    });

    const generateJoinCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.team_name || !formData.domain) {
            toast.error('Please fill in all required fields');
            return;
        }
        setLoading(true);

        try {
            const joinCode = generateJoinCode();

            // Safe date conversion (Noon Strategy)
            let startIso = null;
            let endIso = null;

            if (formData.startDate) {
                const s = new Date(formData.startDate);
                s.setHours(12, 0, 0, 0);
                startIso = s.toISOString();
            }

            if (formData.endDate) {
                const e = new Date(formData.endDate);
                e.setHours(12, 0, 0, 0);
                endIso = e.toISOString();
            }

            const { data: project, error: projectError } = await supabase
                .from('projects')
                .insert({
                    title: formData.title,
                    team_name: formData.team_name,
                    domain: formData.domain,
                    goal: formData.goal,
                    duration: formData.duration,
                    join_code: joinCode,
                    created_by: user?.id,
                    is_active: false,
                    expected_team_size: formData.teamSize,
                    is_team_complete: false,
                    start_date: startIso,
                    end_date: endIso,
                })
                .select()
                .single();

            if (projectError) throw projectError;

            const { error: memberError } = await supabase
                .from('project_members')
                .insert({
                    project_id: project.id,
                    user_id: user?.id,
                    role: 'owner',
                });

            if (memberError) throw memberError;

            // Mark onboarding complete
            await supabase.from('users').update({ onboarding_completed: true }).eq('id', user?.id);

            toast.success('Project created successfully!');
            navigate(`/invite/${project.id}`);
        } catch (error: unknown) {
            console.error('Error creating project:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 dotted-pattern flex flex-col items-center justify-center p-4 md:p-8 transition-colors duration-500 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl"
            >
                {/* Back Link */}
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="group text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-full px-0 py-2 flex items-center gap-2 transition-all hover:bg-transparent"
                    >
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm group-hover:scale-105 transition-transform">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wide">Back to Dashboard</span>
                    </Button>
                </div>

                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden flex flex-col md:flex-row">

                    {/* Left Info Panel */}
                    <div className="md:w-[35%] bg-zinc-900 dark:bg-zinc-900 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 blur-[100px] -ml-32 -mb-32" />

                        {/* Decorative grid */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center mb-8 backdrop-blur-md">
                                <Sparkles className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
                                Start New <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-200">
                                    Project
                                </span>
                            </h1>
                            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xs">
                                Setup your project basics to invite team members and start collaborating.
                            </p>
                        </div>

                        <div className="relative z-10 pt-12 space-y-6">
                            <div className="group flex items-center gap-4 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-sm font-bold shadow-lg shadow-black/20 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-colors">01</div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase text-white tracking-wider">Project Info</span>
                                    <span className="text-[10px] text-zinc-500">Basics & Goals</span>
                                </div>
                            </div>
                            <div className="group flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-sm font-bold text-zinc-500">02</div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Team Setup</span>
                                    <span className="text-[10px] text-zinc-600">Identity & Size</span>
                                </div>
                            </div>
                            <div className="group flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-sm font-bold text-zinc-500">03</div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Timeline</span>
                                    <span className="text-[10px] text-zinc-600">Schedule & Deadlines</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Form Panel */}
                    <div className="flex-1 bg-white dark:bg-black p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                                {/* Project Title */}
                                <div className="space-y-2.5 md:col-span-2">
                                    <Label htmlFor="title" className="text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 ml-1">Project Title</Label>
                                    <div className="relative">
                                        <Input
                                            id="title"
                                            placeholder="e.g. Smart Library System"
                                            className="h-14 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 text-base font-semibold placeholder:text-zinc-400 dark:text-white transition-all shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Target className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                                        </div>
                                    </div>
                                </div>

                                {/* Team Name */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between px-1">
                                        <Label htmlFor="team_name" className="text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400">Team Name</Label>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-500">Public ID</span>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            id="team_name"
                                            placeholder="e.g. CodeWarriors"
                                            className="h-14 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 text-base font-semibold placeholder:text-zinc-400 dark:text-white transition-all shadow-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50"
                                            value={formData.team_name}
                                            onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Users className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                                        </div>
                                    </div>
                                </div>

                                {/* Domain */}
                                <div className="space-y-2.5">
                                    <Label htmlFor="domain" className="text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 ml-1">Project Domain</Label>
                                    <Select onValueChange={(val) => setFormData({ ...formData, domain: val })}>
                                        <SelectTrigger className="h-14 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 text-sm font-semibold dark:text-white shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                                            <SelectValue placeholder="Select domain" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-xl max-h-[300px]">
                                            {domains.map(d => (
                                                <SelectItem key={d} value={d} className="text-xs font-bold uppercase py-3 dark:text-zinc-300 dark:focus:bg-zinc-800">
                                                    {d}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Goal */}
                                <div className="space-y-2.5 md:col-span-2">
                                    <Label htmlFor="goal" className="text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 ml-1">Project Goal</Label>
                                    <Textarea
                                        id="goal"
                                        placeholder="What are you trying to achieve with this project? Outline your main objectives."
                                        className="min-h-[100px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm font-medium dark:text-zinc-200 resize-none transition-all shadow-sm focus:ring-2 focus:ring-zinc-500/20 dark:focus:ring-zinc-700/50"
                                        value={formData.goal}
                                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                    />
                                </div>

                                {/* Team Size & Duration */}
                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 ml-1">Team Size</Label>
                                    <Select
                                        value={formData.teamSize.toString()}
                                        onValueChange={(val) => setFormData({ ...formData, teamSize: parseInt(val) })}
                                    >
                                        <SelectTrigger className="h-14 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 text-sm font-semibold dark:text-white shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                                            <SelectValue placeholder="Size" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-zinc-800 shadow-xl">
                                            {[4, 5, 6].map(n => (
                                                <SelectItem key={n} value={n.toString()} className="text-xs font-bold uppercase py-3 dark:text-zinc-300 dark:focus:bg-zinc-800">
                                                    {n} Members
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 ml-1">Expected Duration</Label>
                                    <Select
                                        value={formData.duration}
                                        onValueChange={(val) => setFormData({ ...formData, duration: val })}
                                    >
                                        <SelectTrigger className="h-14 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 text-sm font-semibold dark:text-white shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                                            <SelectValue placeholder="Duration" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-zinc-800 shadow-xl">
                                            {durations.map(d => (
                                                <SelectItem key={d} value={d} className="text-xs font-bold uppercase py-3 dark:text-zinc-300 dark:focus:bg-zinc-800">
                                                    {d}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <div className="space-y-2.5">
                                        <Label className="text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 ml-1">Start Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full h-14 justify-start text-left font-semibold rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 text-sm shadow-sm dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                                                        !formData.startDate && "text-zinc-400 dark:text-zinc-500"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                                    <span className="truncate">{formData.startDate ? format(formData.startDate, "PP") : "Pick a date"}</span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl dark:bg-zinc-900 dark:border-zinc-800" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.startDate}
                                                    onSelect={(date) => setFormData({ ...formData, startDate: date })}
                                                    initialFocus
                                                    className="dark:text-white"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-[11px] font-black uppercase text-zinc-500 dark:text-zinc-400 ml-1">End Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full h-14 justify-start text-left font-semibold rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 text-sm shadow-sm dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                                                        !formData.endDate && "text-zinc-400 dark:text-zinc-500"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                                    <span className="truncate">{formData.endDate ? format(formData.endDate, "PP") : "Pick a date"}</span>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl dark:bg-zinc-900 dark:border-zinc-800" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.endDate}
                                                    onSelect={(date) => setFormData({ ...formData, endDate: date })}
                                                    initialFocus
                                                    className="dark:text-white"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-8">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-black uppercase transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:pointer-events-none group overflow-hidden"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            Create Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </Button>
                                <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-bold text-zinc-800 dark:text-zinc-500 opacity-60 transition-opacity cursor-default">
                                    <ShieldCheck className="w-3 h-3 text-green-600" />
                                    <span>Encrypted & Secure Environment</span>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateProject;
