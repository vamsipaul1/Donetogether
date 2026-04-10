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
import {
    ArrowLeft, Loader2, Calendar as CalendarIcon, ArrowRight, ShieldCheck,
    Users, Sparkles, Target, Settings2, History, CheckCircle2
} from 'lucide-react';

const domains = [
    'Web Development',
    'Java Development',
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

type ProjectType = 'student' | 'founder';

const steps = [
    { title: "Project Info", sub: "Basics & Goals" },
    { title: "Team Setup", sub: "Capacity & Name" },
    { title: "Timeline", sub: "Schedule & Deadlines" }
];

const CreateProject = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);

    const [formData, setFormData] = useState<{
        title: string;
        team_name: string;
        domain: string;
        goal: string;
        duration: string;
        projectType: ProjectType;
        teamSize: number;
        startDate: Date | undefined;
        endDate: Date | undefined;
    }>({
        title: '',
        team_name: '',
        domain: '',
        goal: '',
        duration: '',
        projectType: 'student',
        teamSize: 4,
        startDate: undefined,
        endDate: undefined,
    });

    const teamSizeOptions = formData.projectType === 'founder'
        ? Array.from({ length: 15 }, (_, i) => i + 1)
        : [4, 5, 6];

    const generateJoinCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const next = () => {
        if (step === 0) {
            if (!formData.title || !formData.domain) {
                toast.error("Please fill in the project title and domain");
                return;
            }
        }
        if (step === 1) {
            if (!formData.team_name) {
                toast.error("Please name your team");
                return;
            }
        }
        setStep((s) => Math.min(s + 1, 2));
    };

    const prev = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        if (!formData.startDate || !formData.endDate) {
            toast.error("Please select a timeline");
            return;
        }

        setLoading(true);

        try {
            const joinCode = generateJoinCode();

            // Noon Strategy for clean dates
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
                    project_type: formData.projectType,
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

            await supabase.from('users').update({ onboarding_completed: true }).eq('id', user?.id);

            toast.success('Project Created Successfully!', {
                description: "You've successfully set the stage. Time to head ahead, start managing tasks, and build something great with your buddies! 🚀✨"
            });

            // Product-level Notification for successful initialization
            if (Notification.permission === 'granted') {
                new Notification('Success! Your Project is Live 🚀', {
                    body: `"${formData.title}" is officially initialized. Let's start managing tasks and collaborating with your buddies! Ready for great results? ✨`,
                    icon: '/favicon.ico'
                });
            }

            navigate(`/invite/${project.id}`);
        } catch (error: unknown) {
            console.error('Error creating project:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] dotted-pattern flex flex-col items-center justify-center p-4 md:p-12 font-body">
            <div className="w-full max-w-6xl">
                {/* Top Bar */}
                <div className="mb-8 flex items-center justify-between px-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/project-room')}
                        className="group text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-2 font-bold tracking-tight bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-full px-5 py-2.5 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="  font-body

      text-[14px]
      sm:text-[15px]
      leading-[22px]
      sm:leading-[24px]

      tracking-[-0.02em]
      sm:tracking-[-0.03em]

      text-zinc-600
      dark:text-zinc-300

      max-w-[340px]
      sm:max-w-[480px]

      mx-auto

      antialiased">Exit to Dashboard</span>
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end mr-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Step {step + 1} of 3</span>
                            <span className="text-[14px] font-bold text-zinc-900 dark:text-white">{steps[step].title}</span>
                        </div>
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className={cn(
                                    "h-1.5 rounded-full",
                                    i === step ? "w-8 bg-violet-600" : (i < step ? "w-4 bg-emerald-500" : "w-4 bg-zinc-200 dark:bg-zinc-800")
                                )} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 rounded-[40px] md:rounded-[56px] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden flex flex-col md:flex-row min-h-[640px]">

                    {/* Visual Sidebar */}
                    <div className="md:w-[38%] bg-zinc-950 p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden border-r border-white/5">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 blur-[120px] -mr-40 -mt-40" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 blur-[120px] -ml-40 -mb-40" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center mb-5 backdrop-blur-2xl shadow-inner group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <svg
                                    viewBox="0 0 24 24"
                                    className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-500"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {/* Center Person */}
                                    <circle cx="12" cy="10" r="2.5" />
                                    <path d="M9 18c0-2 1.5-3 3-3s3 1 3 3" />

                                    {/* Top Left */}
                                    <circle cx="5" cy="4.5" r="2" />
                                    <path d="M3 10c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />

                                    {/* Top Right */}
                                    <circle cx="19" cy="4.5" r="2" />
                                    <path d="M17 10c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />

                                    {/* Bottom Left */}
                                    <circle cx="5" cy="19" r="2" />
                                    <path d="M3 23c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />

                                    {/* Bottom Right */}
                                    <circle cx="19" cy="19" r="2" />
                                    <path d="M17 23c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />

                                    {/* Connection Lines */}
                                    <line x1="7.5" y1="10" x2="10" y2="10" />
                                    <line x1="14" y1="10" x2="16.5" y2="10" />
                                </svg>
                            </div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-500">Builder Mode</h2>
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 pb-6 leading-[1.05] tracking-tighter">
                                {step === 0 && <> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Project</span><br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Creation</span></>}
                                {step === 1 && <><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">Assemble</span><br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">Unit</span></>}
                                {step === 2 && <><span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-300">Define</span><br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-300">Launch</span></>}
                            </h1>
                            <p className="text-zinc-500 text-[15px] font-semibold leading-relaxed max-w-xs">
                                {step === 0 && "Define your core objectives and market domain to set the right foundation."}
                                {step === 1 && "Select your team role and specify capacity to find the perfect collaborators."}
                                {step === 2 && "Set a realistic schedule and duration to keep your development on track."}
                            </p>
                        </div>

                        <div className="relative z-8 pt-10 space-y-10">
                            {/* Vertical Line Connector */}
                            <div className="absolute left-[23px] top-[108px] bottom-14 w-0.5 bg-gradient-to-b from-white/10 via-white/5 to-white/0" />

                            {steps.map((s, i) => (
                                <div key={i} className={cn(
                                    "flex items-start gap-5 relative",
                                    i === step ? "opacity-100" : "opacity-40"
                                )}>
                                    <div className={cn(
                                        "w-[40px] h-[40px] rounded-full border flex items-center justify-center text-sm font-black z-10",
                                        i === step ? "bg-violet-600 border-violet-400 text-white shadow-violet-500/20" :
                                            (i < step ? "bg-emerald-500 border-emerald-400 text-white" : "bg-white/5 border-white/10 text-zinc-500")
                                    )}>
                                        {i < step ? <CheckCircle2 className="w-5 h-5" /> : `0${i + 1}`}
                                    </div>
                                    <div className="flex flex-col pt-1.5">
                                        <span className="text-[12px] font-black uppercase tracking-widest text-white">{s.title}</span>
                                        <span className="text-[11px] text-zinc-500 mt-1 font-bold">{s.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step Card Content */}
                    <div className="flex-1 bg-white dark:bg-[#0a0a0a] p-8 md:p-14 flex flex-col justify-between">
                        <div className="max-w-xl mx-auto w-full">
                            {step === 0 && (
                                <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-1.5 h-6 rounded-full bg-violet-600" />
                                                <Label className="text-[13px] font-bold text-zinc-600 font-body">Project Name</Label>
                                            </div>
                                            <div className="relative group">
                                                <Input
                                                    placeholder="e.g. Smart Library System"
                                                    className="h-16 bg-zinc-50/50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 rounded-[20px] px-7 text-[16px] font-bold dark:text-white shadow-sm focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/60"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                />
                                                <Target className="absolute right-7 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <Label className="text-[14px] font-black text-zinc-600 font-body">Domain</Label>
                                                <Select value={formData.domain} onValueChange={(val) => setFormData({ ...formData, domain: val })}>
                                                    <SelectTrigger className="h-16 bg-zinc-50/50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 rounded-[20px] px-7 text-[14px] font-bold dark:text-white shadow-sm hover:bg-zinc-100">
                                                        <SelectValue placeholder="Domain" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-zinc-200 dark:border-white/10 dark:bg-[#0d0d0d] shadow-2xl max-h-[300px]">
                                                        {domains.map(d => (
                                                            <SelectItem key={d} value={d} className="text-[13px] text-zinc-900 font-body py-3 dark:focus:bg-white/5">{d}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[14px] font-black text-zinc-600 tracking-widest ml-1">I am a...</Label>
                                                <Select value={formData.projectType} onValueChange={(val) => setFormData({ ...formData, projectType: val as ProjectType })}>
                                                    <SelectTrigger className="h-16 bg-zinc-50/50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 rounded-[20px] px-7 text-[14px] font-bold dark:text-white shadow-sm hover:bg-zinc-100">
                                                        <SelectValue placeholder="I am a..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-zinc-200 dark:border-white/10 dark:bg-[#0d0d0d] shadow-2xl">
                                                        <SelectItem value="student" className="text-[13px] text-zinc-900 font-body py-3 dark:focus:bg-white/5">Active Student</SelectItem>
                                                        <SelectItem value="founder" className="text-[13px] text-zinc-900 font-body py-3 dark:focus:bg-white/5">Startup Founder</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[14px] font-black text-zinc-600">The Mission</Label>
                                            <Textarea
                                                placeholder="What are you trying to achieve with this project? Outline your core objectives."
                                                className="min-h-[140px] bg-zinc-50/50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 rounded-[22px] p-7 text-[14px] font-semibold dark:text-zinc-200 resize-none shadow-sm focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/50"
                                                value={formData.goal}
                                                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                            />
                                        </div>
                                </div>
                                )}

                                {step === 1 && (
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-1.5 h-6 rounded-full bg-blue-500" />
                                                    <Label className="text-[13px] font-bold text-zinc-600">Collective Identity</Label>
                                                </div>
                                                <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase text-zinc-600 tracking-widest">Global ID</div>
                                            </div>
                                            <div className="relative group">
                                                <Input
                                                    placeholder="e.g. CodeWarriors"
                                                    className="h-16 bg-zinc-50/50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 rounded-[20px] px-7 text-[16px] font-bold dark:text-white shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/60"
                                                    value={formData.team_name}
                                                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                                                />
                                                <Users className="absolute right-7 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50" />
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50/80 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 rounded-[32px] p-4 pt-2 space-y-2">
                                            <div className="flex items-center gap-1 mb-2 p-0">
                                                <Settings2 className="w-5 h-5 text-zinc-400" />
                                                <Label className="text-[14px] font-black text-zinc-600">Workload Configuration</Label>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[11px] font-bold text-zinc-400 ml-1">Proposed Team Size</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {teamSizeOptions.map(n => (
                                                        <button
                                                            key={n}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, teamSize: n })}
                                                            className={cn(
                                                                "px-6 py-3 rounded-xl text-[13px] font-bold transition-all border",
                                                                formData.teamSize === n
                                                                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xl"
                                                                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-500 hover:border-zinc-300"
                                                            )}
                                                        >
                                                            {n} {n === 1 ? 'Hero' : 'Members'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-1.5 h-6 rounded-full bg-amber-500" />
                                                <Label className="text-[13px] font-bold text-zinc-600">Development Cycle</Label>
                                            </div>
                                            <Select value={formData.duration} onValueChange={(val) => setFormData({ ...formData, duration: val })}>
                                                <SelectTrigger className="h-16 bg-zinc-50/50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 rounded-[20px] px-7 text-[16px] font-bold dark:text-white shadow-sm hover:bg-zinc-100">
                                                    <SelectValue placeholder="Project Duration" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-zinc-200 dark:border-white/10 dark:bg-[#0d0d0d] shadow-2xl">
                                                    {durations.map(d => (
                                                        <SelectItem key={d} value={d} className="text-[13px] text-zinc-900 font-body py-3 dark:focus:bg-white/5">{d}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="bg-zinc-50/80 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/5 rounded-[32px] p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <History className="w-5 h-5 text-zinc-400" />
                                                <Label className="text-[14px] font-black text-zinc-600">Active Roadmap</Label>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label className="text-[13px] text-zinc-900 font-body py-3 dark:focus:bg-white/5">Start Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full h-14 justify-start rounded-xl border-zinc-200 dark:border-white/10 bg-white dark:bg-black px-5 font-bold text-[13px] hover:bg-zinc-50"
                                                            >
                                                                <CalendarIcon className="mr-3 h-4 w-4 text-zinc-400" />
                                                                {formData.startDate ? format(formData.startDate, "PP") : "Start Date"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className=" text-[13px] text-zinc-900 font-body py-3 dark:focus:bg-white/5 w-auto p-0 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95" align="start">
                                                            <Calendar mode="single" selected={formData.startDate} onSelect={(d) => setFormData({ ...formData, startDate: d })} />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-[13px] text-zinc-900 font-body py-3 dark:focus:bg-white/5">End Date</Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full h-14 justify-start rounded-xl border-zinc-200 dark:border-white/10 bg-white dark:bg-black px-5 font-bold text-[13px] hover:bg-zinc-50"
                                                            >
                                                                <CalendarIcon className="text-[13px] text-zinc-900 font-body py-3 dark:focus:bg-white/5" />
                                                                {formData.endDate ? format(formData.endDate, "PP") : "End Date"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="text-[13px] text-zinc-900 font-body py-3 dark:focus:bg-white/5 w-auto p-0 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95" align="start">
                                                            <Calendar mode="single" selected={formData.endDate} onSelect={(d) => setFormData({ ...formData, endDate: d })} />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>

                        {/* Pagination Actions */}
                        <div className="mt-auto pt-10 flex items-center justify-between max-w-xl mx-auto w-full">
                            <button
                                onClick={prev}
                                disabled={step === 0}
                                className="px-8 py-4 rounded-2xl text-[14px] font-bold text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-0 transition-all"
                            >
                                Previous
                            </button>

                            <Button
                                onClick={step === 2 ? handleSubmit : next}
                                disabled={loading}
                                className={cn(
                                    "h-12 px-10 rounded-[16px] text-[15px] font-bold uppercase shadow-xl group",
                                    step === 2
                                        ? "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30"
                                        : "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
                                ) : (
                                    <span className="flex items-center capitalize gap-3">
                                        {step === 2 ? "Finalize" : "Continue"}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex items-center justify-center gap-2.5 text-[13px] font-medium text-zinc-500 opacity-60">
                    <ShieldCheck className="w-4 h-4 text-emerald-500/80" strokeWidth={1.5} />
                    <span>Tier-1 Encrypted Project Cloud</span>
                </div>
            </div>
        </div>
    );
};

export default CreateProject;