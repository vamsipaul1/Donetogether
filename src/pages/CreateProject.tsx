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
import { ArrowLeft, Loader2, Sun, Moon, Calendar as CalendarIcon, ArrowRight, ShieldCheck, Search } from 'lucide-react';

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
    const { isDark, toggleTheme } = useTheme();
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
        <div className="min-h-screen bg-[#f8faf9] dark:bg-black dotted-pattern flex flex-col items-center justify-center p-4 md:p-8 transition-colors duration-500 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-4xl"
            >
                {/* Back Link */}
                <div className="mb-8 flex items-center justify-center md:justify-start">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="group text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-full px-4 py-2 flex items-center gap-2 transition-all hover:bg-white/50 dark:hover:bg-zinc-900/50"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase">Back to Dashboard</span>
                    </Button>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[32px] md:rounded-[48px] shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Left Info Panel */}
                        <div className="md:w-[35%] bg-zinc-900 dark:bg-zinc-950 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 blur-[100px] -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 blur-[100px] -ml-32 -mb-32" />

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center mb-8 shadow-xl">
                                    <Sun className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                                    Start New <br />Project
                                </h1>
                                <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                                    Setup your project basics to invite team members and start collaborating.
                                </p>
                            </div>

                            <div className="relative z-10 pt-12">
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/10">01</div>
                                        <span className="text-[10px] font-black uppercase text-zinc-400">Project Info</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/10 opacity-50">02</div>
                                        <span className="text-[10px] font-black uppercase text-zinc-400 opacity-50">Team Setup</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold border border-white/10 opacity-50">03</div>
                                        <span className="text-[10px] font-black uppercase text-zinc-400 opacity-50">Timeline</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Form Panel */}
                        <div className="flex-1 p-8 md:p-12">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Project Title */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="title" className="text-[11px] font-black uppercase text-zinc-500 ml-1">Project Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g. Smart Library System"
                                            className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl px-5 text-sm font-semibold transition-all shadow-sm focus:ring-zinc-500"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    {/* Team Name */}
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between px-1">
                                            <Label htmlFor="team_name" className="text-[11px] font-black uppercase text-zinc-400">Team Name</Label>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                                <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                                <span className="text-[9px] font-black uppercase text-amber-600">Unique Identity</span>
                                            </div>
                                        </div>
                                        <div className="relative group">
                                            <Input
                                                id="team_name"
                                                placeholder="e.g. CodeWarriors"
                                                className="h-14 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 text-base font-bold transition-all shadow-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50"
                                                value={formData.team_name}
                                                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-[11px] text-zinc-500 font-bold flex items-center gap-2 pl-1">
                                            <Search className="w-3 h-3 text-zinc-400" />
                                            Others can search for this to join
                                        </p>
                                    </div>

                                    {/* Domain */}
                                    <div className="space-y-2">
                                        <Label htmlFor="domain" className="text-[11px] font-black uppercase text-zinc-500 ml-1">Project Domain</Label>
                                        <Select onValueChange={(val) => setFormData({ ...formData, domain: val })}>
                                            <SelectTrigger className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl px-5 text-sm font-semibold shadow-sm">
                                                <SelectValue placeholder="Select domain" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                                                {domains.map(d => (
                                                    <SelectItem key={d} value={d} className="text-xs font-bold uppercase py-2.5">
                                                        {d}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Goal */}
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="goal" className="text-[11px] font-black uppercase text-zinc-500 ml-1">Project Goal</Label>
                                        <Textarea
                                            id="goal"
                                            placeholder="What are you trying to achieve?"
                                            className="min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm font-medium resize-none transition-all shadow-sm"
                                            value={formData.goal}
                                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                        />
                                    </div>

                                    {/* Team Size & Duration */}
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase text-zinc-500 ml-1">Team Size</Label>
                                        <Select
                                            value={formData.teamSize.toString()}
                                            onValueChange={(val) => setFormData({ ...formData, teamSize: parseInt(val) })}
                                        >
                                            <SelectTrigger className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl px-5 text-sm font-semibold shadow-sm">
                                                <SelectValue placeholder="Size" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-xl">
                                                {[4, 5, 6].map(n => (
                                                    <SelectItem key={n} value={n.toString()} className="text-xs font-bold uppercase py-2.5">
                                                        {n} Members
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase text-zinc-500 ml-1">Expected Duration</Label>
                                        <Select
                                            value={formData.duration}
                                            onValueChange={(val) => setFormData({ ...formData, duration: val })}
                                        >
                                            <SelectTrigger className="h-12 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 rounded-xl px-5 text-sm font-semibold shadow-sm">
                                                <SelectValue placeholder="Duration" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-xl">
                                                {durations.map(d => (
                                                    <SelectItem key={d} value={d} className="text-xs font-bold uppercase py-2.5">
                                                        {d}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-zinc-500 ml-1">Start Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-12 justify-start text-left font-semibold rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm shadow-sm",
                                                            !formData.startDate && "text-zinc-400"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
                                                        <span className="truncate">{formData.startDate ? format(formData.startDate, "PP") : "Start"}</span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.startDate}
                                                        onSelect={(date) => setFormData({ ...formData, startDate: date })}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-zinc-500 ml-1">End Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-12 justify-start text-left font-semibold rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-4 text-sm shadow-sm",
                                                            !formData.endDate && "text-zinc-400"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
                                                        <span className="truncate">{formData.endDate ? format(formData.endDate, "PP") : "End"}</span>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.endDate}
                                                        onSelect={(date) => setFormData({ ...formData, endDate: date })}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-black uppercase transition-all hover:opacity-90 active:scale-[0.98] shadow-xl group relative overflow-hidden"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                        ) : (
                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                Create & Invite Members <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                    <div className="mt-8 flex items-center justify-center gap-2 text-[12px] font-bold text-zinc-500  ">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>Secure Project Environment</span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateProject;
