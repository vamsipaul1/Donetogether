import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Users, LogOut, Sun, Moon, Layout, CheckCircle2, User as UserIcon, Crown, Loader2, ArrowLeftToLine
    , Home, Inbox, BarChart3, Target, Briefcase, Settings, ChevronRight, MessageSquare,
    Calendar as CalendarIcon, FileText, List as ListIcon, Columns, Timer,
    MoreHorizontal, Share2, ChevronDown, UserPlus, Settings2, Trash2, Edit2, FolderPlus, StarIcon, Star, History, LayoutDashboard,
    ShieldCheck, Menu, Globe, PanelLeft, Sparkles, Activity, BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import WaitingRoom from '@/components/WaitingRoom';
import CreateTaskModal from '@/components/CreateTaskModal';
import InviteTeamModal from '@/components/InviteTeamModal';
import EditProjectModal from '@/components/EditProjectModal';
import GovernanceModal from '@/components/GovernanceModal';
import type { Project, ProjectMember, User as UserType, Task } from '@/types/database';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CompletionSummary from '@/components/dashboard/CompletionSummary';

type ProjectMemberWithUser = ProjectMember & { users?: UserType };
type TaskWithUser = Task & {
    assignedUser?: UserType;
    assignedByUser?: UserType;
};

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";

// Dashboard specialized components
import Overview from '@/components/dashboard/Overview';
import TaskList from '@/components/dashboard/TaskList';
import BoardView from '@/components/dashboard/BoardView';
import TimelineView from '@/components/dashboard/TimelineView';
import HistoryView from '@/components/dashboard/HistoryView';
import AnalyticsView from '@/components/dashboard/AnalyticsView';
import HomeView from '@/components/dashboard/HomeView';
import InboxView from '@/components/dashboard/InboxView';
import ProofOfWorkView from '@/components/dashboard/ProofOfWorkView';
import ProgressView from '@/components/dashboard/ProgressView';
import SettingsView from '@/components/dashboard/SettingsView';

import { WelcomeOverlay } from '@/components/dashboard/WelcomeOverlay';
import AIAssistant from '@/components/ai/AIAssistant';
import NotificationDropdown from '@/components/dashboard/NotificationDropdown';
import { useNotifications } from '@/hooks/useNotifications';
import StreakStats from '@/components/dashboard/StreakStats';

type DashboardView = 'home' | 'overview' | 'list' | 'board' | 'timeline' | 'dashboard' | 'calendar' | 'workflow' | 'messages' | 'files' | 'workspace' | 'history' | 'progress' | 'proof_of_work' | 'settings' | 'completion_summary';

const Dashboard = () => {
    const { user, signOut, loading: authLoading } = useAuth();
    const { notifications, unreadCount, markAllAsRead } = useNotifications(user?.id);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    const [userRole, setUserRole] = useState<'LEADER' | 'MEMBER' | null>(null);

    const currentUser: UserType | null = useMemo(() => {
        if (!user) return null;
        return {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at,
            role: userRole || undefined
        };
    }, [user, userRole]);

    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskWithUser | null>(null);
    const [members, setMembers] = useState<ProjectMemberWithUser[]>([]);
    const [projectTasks, setProjectTasks] = useState<TaskWithUser[]>([]);
    const [userTasks, setUserTasks] = useState<TaskWithUser[]>([]);
    const [activeView, setActiveView] = useState<DashboardView>('home');
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isLead, setIsLead] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
    const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [isCompletionConfirmOpen, setIsCompletionConfirmOpen] = useState(false);


    // State for Online Users Presence (Moved to top level)
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

    // PRESENCE TRACKING - Global for the project
    useEffect(() => {
        if (!selectedProject || !currentUser) return;

        const channel = supabase.channel(`presence-project-${selectedProject.id}`)
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();
                const activeIds = new Set<string>();

                Object.values(newState).forEach((presences: any) => {
                    presences.forEach((presence: any) => {
                        if (presence.user_id) activeIds.add(presence.user_id);
                    });
                });

                setOnlineUsers(activeIds);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: currentUser.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
            setOnlineUsers(new Set());
        };
    }, [selectedProject?.id, currentUser?.id]);

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }

        // Clean up trailing '#' from URL fragment (common after Social Login)
        if (window.location.hash === '#' || window.location.hash === '') {
            const currentUrl = window.location.pathname + window.location.search;
            window.history.replaceState(null, '', currentUrl);
        }
    }, [isMobile]);

    // Handle early loading resolution if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            setLoading(false);
        }
    }, [authLoading, user]);

    const isFirstLoad = useRef(true);
    const fetchingProjects = useRef(false);

    useEffect(() => {
        let isMounted = true;
        const fetchUserData = async () => {
            if (!currentUser || fetchingProjects.current) {
                if (!currentUser) setLoading(false);
                return;
            }
            fetchingProjects.current = true;
            try {
                // Check Welcome Status & Role
                const { data: userData } = await supabase
                    .from('users')
                    .select('has_seen_welcome, role')
                    .eq('id', currentUser.id)
                    .single();

                if (userData && isMounted) {
                    setUserRole(userData.role as 'LEADER' | 'MEMBER');
                    if (!userData.has_seen_welcome) {
                        setShowWelcome(true);
                    }
                }

                const { data: memberships, error: memError } = await supabase
                    .from('project_members')
                    .select('role, projects(*)')
                    .eq('user_id', currentUser.id)
                    .order('joined_at', { ascending: true }); // Ensure stable order

                if (memError) throw memError;

                const userProjects = (memberships || [])
                    .map((m: any) => m.projects)
                    .filter((p: any) => !!p); // Ensure no nulls

                if (isMounted) {
                    setProjects(userProjects);
                    // Only auto-select if we don't have a selection and we aren't explicitly on the home view
                    if (userProjects.length > 0 && !selectedProject && activeView !== 'home' && isFirstLoad.current) {
                        setSelectedProject(userProjects[0]);
                        isFirstLoad.current = false;
                    }
                }
            } catch (error: any) {
                console.error('Error fetching dashboard:', error instanceof Error ? error.message : String(error));
            } finally {
                fetchingProjects.current = false;
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchUserData();
        return () => { isMounted = false; };
    }, [currentUser?.id]);

    // REALTIME TASK SYNC - Instant updates for the whole team
    useEffect(() => {
        if (!selectedProject) return;

        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                    filter: `project_id=eq.${selectedProject.id}`
                },
                () => {
                    // Fast background refresh when any task changes
                    fetchProjectDetails();
                    fetchUserTasks();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedProject?.id]);

    const fetchProjectDetails = async () => {
        if (!selectedProject || !currentUser) return;
        try {
            // Use ID only to check if data changed meaningfully to avoid re-renders
            const { data: projData } = await supabase.from('projects')
                .select('*')
                .eq('id', selectedProject.id)
                .single();

            if (projData && (projData.id !== selectedProject.id || projData.title !== selectedProject.title || projData.avatar_url !== selectedProject.avatar_url)) {
                setSelectedProject(projData);
            }

            const { data: membersData } = await supabase
                .from('project_members')
                .select('*, users(*)')
                .eq('project_id', selectedProject.id);

            setMembers(membersData || []);
            setIsLead(!!membersData?.find(m => m.user_id === currentUser.id && m.role === 'lead'));

            // Fetch tasks regardless of team completion status so early joiners can see them
            const { data: tasksData } = await supabase
                .from('tasks')
                .select(`
                    *,
                    assignedUser:users!tasks_assigned_to_fkey(*),
                    assignedByUser:users!tasks_assigned_by_fkey(*)
                `)
                .eq('project_id', selectedProject.id)
                .neq('status', 'deleted')
                .order('due_date', { ascending: true });

            setProjectTasks(tasksData || []);
        } catch (err) {
            console.error('Error fetching project details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedProject || !isLead) return;
        if (!confirm(`Are you sure you want to delete "${selectedProject.title}"? This action cannot be undone.`)) return;
        try {
            const { error } = await supabase.from('projects').delete().eq('id', selectedProject.id);
            if (error) throw error;
            toast.success('Project deleted');
            setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
            setSelectedProject(null);
            setActiveView('home');
        } catch (err: any) { toast.error(err.message); }
    };

    const fetchUserTasks = async () => {
        if (!currentUser) return;
        try {
            const { data: tasksData } = await supabase
                .from('tasks')
                .select(`
                    *,
                    assignedUser:users!tasks_assigned_to_fkey(*),
                    assignedByUser:users!tasks_assigned_by_fkey(*)
                `)
                .eq('assigned_to', currentUser.id)
                .neq('status', 'deleted')
                .order('due_date', { ascending: true });

            setUserTasks(tasksData || []);
        } catch (err) {
            console.error('Error fetching user tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserTasks(); // Always fetch user tasks for Home/List
        if (selectedProject) {
            fetchProjectDetails();
        }
    }, [selectedProject?.id, activeView]);

    const handleAddTask = async () => {
        if (!selectedProject && projects.length > 0) {
            // Helper to fetch members for the default project (first one)
            // so the modal works even in Home view
            const defaultProj = projects[0];
            try {
                const { data: membersData } = await supabase
                    .from('project_members')
                    .select('*, users(*)')
                    .eq('project_id', defaultProj.id);
                setMembers(membersData || []);
            } catch (e) {
                console.error("Failed to load members for default project", e);
            }
        }
        setIsCreateTaskOpen(true);
    };

    const handleCompleteProject = async () => {
        if (!selectedProject) return;

        try {
            const { error } = await supabase
                .from('projects')
                .update({ is_active: false })
                .eq('id', selectedProject.id);

            if (error) throw error;

            setActiveView('completion_summary');
            fetchProjectDetails();
        } catch (err) {
            console.error('Project completion failed:', err);
            toast.error('Could not complete project. Please try again.');
        }
    };

    // State to allow lead to bypass waiting room
    const [bypassedWaitingRoom, setBypassedWaitingRoom] = useState(false);

    useEffect(() => {
        if (!loading && projects.length === 0 && !activeView) {
            navigate('/onboarding');
        }
    }, [loading, projects.length, navigate, activeView]);

    if (loading) return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black font-sans" style={{ fontFamily: "'Outfit', sans-serif" }}>


            {/* Rich Text Reveal */}
            <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center gap-4 text-center z-10"
            >
                <h1 className="text-4xl md:text-5xl font-black tracking-[0.2em] text-white drop-shadow-sm uppercase">
                    DoneTogether
                </h1>
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "120px", opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
                />
            </motion.div>
        </div>
    );

    // Show Waiting Room only if:
    // 1. Team is incomplete
    // 2. User hasn't bypassed it (for leads)
    // 3. Members list is loaded (to check role)
    // Bypassed Waiting Room for user request
    /*
    if (selectedProject && !selectedProject.is_team_complete && !bypassedWaitingRoom) {
        // If lead, they can bypass. If member, they stick here until team complete.
        return (
            <WaitingRoom
                project={selectedProject}
                members={members}
                currentUserId={currentUser?.id || ''}
                onEnterDashboard={() => setBypassedWaitingRoom(true)}
            />
        );
    }
    */

    return (
        <div className="dashboard-theme flex h-screen bg-background dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-300">
            <AnimatePresence>
                {showWelcome && currentUser && (
                    <WelcomeOverlay
                        user={{ ...currentUser, role: userRole || undefined }}
                        onComplete={() => setShowWelcome(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: isMobile ? (isSidebarOpen ? 0 : -300) : 0,
                    width: isMobile ? 280 : (isSidebarOpen ? 280 : 0),
                    opacity: isSidebarOpen ? 1 : (isMobile ? 0 : 0),
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 40
                }}
                className={`
                    bg-[hsl(var(--sidebar-background))] dark:bg-[#050505] border-r border-zinc-200 dark:border-zinc-800 
                    flex flex-col z-50 overflow-hidden dotted-pattern
                    ${isMobile ? 'fixed inset-y-0 left-0 h-full w-[280px] shadow-2xl safe-area-left' : 'relative'}
                `}
            >
                <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-[hsl(var(--sidebar-background))] dark:bg-[#050505] z-10">
                    <a href="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative w-8 h-8 flex items-center justify-center bg-zinc-900 dark:bg-white rounded-xl shadow-lg shadow-zinc-500/20 dark:shadow-none transition-transform group-hover:scale-105">
                            <img
                                src="/favicon.ico"
                                alt="Logo"
                                className="w-4 h-4 invert-0 dark:invert-0"
                            />
                        </div>
                        <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                            DoneTogether
                        </span>
                    </a>
                    {isMobile ? (
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                            <ChevronDown className="w-5 h-5 rotate-90" />
                        </Button>
                    ) : (
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                            <PanelLeft className="w-5 h-5" />
                        </Button>
                    )}
                </div>

                {/* Mobile User Profile in Sidebar (optional, but good for easy access) */}
                {isMobile && (
                    <div className="px-4 pb-4">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 shadow-sm">
                            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-xs font-bold text-white dark:text-black shadow-inner">
                                {user?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold truncate">{currentUser?.full_name}</p>
                                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1 px-2 py-4 space-y-6 overflow-y-auto scrollbar-hide font-sans">
                    <div className="space-y-1">
                        <NavItem icon={Home} label="Home" active={activeView === 'home'} onClick={() => { setActiveView('home'); setSelectedProject(null); }} />
                        <NavItem icon={CheckCircle2} label="My tasks" active={activeView === 'list' && !selectedProject} onClick={() => { setActiveView('list'); setSelectedProject(null); }} />
                        <NavItem
                            icon={MessageSquare}
                            label="Team Chat"
                            active={activeView === 'messages'}
                            onClick={() => navigate(selectedProject ? `/messages/${selectedProject.id}` : '/messages')}
                        />

                        <button
                            onClick={() => setIsAIOpen(true)}
                            className="flex items-center justify-start gap-2 px-4 py-3 w-full rounded-xl transition-all group active:scale-95 hover:bg-zinc-100 dark:hover:bg-[#3d3e40]"
                        >
                            <span className="text-[16px] font-semibold tracking-wide text-zinc-900 dark:text-white transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-pink-600">
                                ThinkSense <span className="text-[10px]">AI</span>
                            </span>
                        </button>
                    </div>

                    <div className="space-y-1">
                        <div className="px-4 py-2 flex items-center justify-between group">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Projects</span>
                            {isLead && projects.length > 0 && <Plus className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => navigate('/create-project')} />}
                        </div>

                        {/* Empty State - No Projects */}
                        {projects.length === 0 ? (
                            <div className="px-3 py-6 space-y-3">
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center mb-1">
                                        <Layout className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed px-1">
                                        No projects yet
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/create-project')}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-violet-500/20"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Project
                                </button>
                            </div>
                        ) : (
                            /* Project List */
                            projects.map(proj => (
                                <button
                                    key={proj.id}
                                    onClick={() => { setSelectedProject(proj); setActiveView('overview'); }}
                                    className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-bold transition-all group active:scale-95 ${selectedProject?.id === proj.id
                                        ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                                        : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className={cn("w-6 h-6 border-2 transition-all group-hover:scale-105", selectedProject?.id === proj.id ? "border-violet-200 dark:border-violet-800 shadow-sm" : "border-transparent group-hover:border-zinc-200")}>
                                            <AvatarImage src={proj.avatar_url} />
                                            <AvatarFallback className={cn("text-[9px] font-black text-white", selectedProject?.id === proj.id ? "bg-violet-600" : "bg-zinc-400 group-hover:bg-violet-500")}>
                                                {proj.team_name?.slice(0, 1).toUpperCase() || proj.title?.slice(0, 1).toUpperCase() || 'P'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {selectedProject?.id === proj.id && (
                                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#050505] shadow-sm animate-pulse" />
                                        )}
                                    </div>
                                    <span className="truncate tracking-tight font-black text-[13px] text-zinc-900 dark:text-white">
                                        {((proj.team_name || proj.title || 'Project')).charAt(0).toUpperCase() + (proj.team_name || proj.title || 'Project').slice(1).toLowerCase()}
                                    </span>
                                    {selectedProject?.id === proj.id && (
                                        <ChevronRight className="ml-auto w-3.5 h-3.5 opacity-50" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                    {/* 
                    <div className="space-y-1">
                        <div className="px-4 py-2 flex items-center justify-between group">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">History</span>
                        </div>
                        <NavItem icon={History} label="Deleted tasks" active={activeView === 'history'} onClick={() => { setActiveView('history'); setSelectedProject(null); }} />
                    </div> */}

                    {/* <div className="space-y-1">
                        <div className="px-4 py-2 flex items-center justify-between group">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Insights</span>
                            <Plus className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 cursor-pointer" />
                        </div>
                        <NavItem icon={BarChart3} label="Reporting" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                    </div> */}

                    <div className="space-y-1">
                        <div className="px-4 py-2 flex items-center justify-between group">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Workspace</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium transition-all group active:scale-95 ${activeView === 'workspace'
                                        ? 'bg-zinc-200 dark:bg-[#454547] text-zinc-900 dark:text-white shadow-sm'
                                        : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#3d3e40] hover:text-zinc-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Users className={`w-4 h-4 transition-colors ${activeView === 'workspace' ? 'text-emerald-500' : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`} />
                                    <span className="truncate tracking-normal">My workspace</span>
                                    <ChevronRight className="ml-auto w-4 h-4 text-zinc-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start" className={`${isMobile ? 'w-52' : 'w-64'} ml-2 rounded-xl p-2 font-body bg-white dark:bg-black border-zinc-200 dark:border-[#3d3e40] shadow-xl`}>
                                <DropdownMenuLabel className="text-[11px] text-zinc-500 font-bold uppercase tracking-normal px-2 py-1.5 mb-1">My workspace</DropdownMenuLabel>

                                {isLead && (
                                    <>
                                        <DropdownMenuItem onClick={() => setIsInviteOpen(true)} className="flex items-center justify-between px-2 py-2 focus:bg-zinc-100 dark:focus:bg-[#2e2f31] rounded-lg cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <UserPlus className="w-4 h-4 text-zinc-500" />
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Invite teammates</span>
                                            </div>
                                            <div className="flex -space-x-1.5">
                                                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[8px] font-bold text-white">VR</div>
                                                {[1, 2, 3].map((_, i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 bg-transparent flex items-center justify-center">
                                                        <UserIcon className="w-3 h-3 text-zinc-300 dark:text-zinc-600" />
                                                    </div>
                                                ))}
                                            </div>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={() => navigate('/create-project')} className="flex items-center gap-2 px-2 py-2 focus:bg-zinc-100 dark:focus:bg-[#2e2f31] rounded-lg cursor-pointer">
                                            <div className="w-8 flex justify-center"><Layout className="w-4 h-4 text-zinc-500" /></div>
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Create project</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={() => setIsGovernanceOpen(true)} className="flex items-center gap-2 px-2 py-2 focus:bg-zinc-100 dark:focus:bg-[#2e2f31] rounded-lg cursor-pointer">
                                            <div className="w-8 flex justify-center"><ShieldCheck className="w-4 h-4 text-zinc-500" /></div>
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Project Permissions</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {!isLead && (
                                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-default opacity-50">
                                        <span className="text-xs text-zinc-500">Member access only</span>
                                    </DropdownMenuItem>
                                )}

                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-2" />

                                <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 focus:bg-zinc-100 dark:focus:bg-[#2e2f31] rounded-lg cursor-pointer bg-zinc-50 dark:bg-[#2e2f31]/50">
                                    <div className="w-8 flex justify-cener"><div className="w-3 h-3 rounded-[3px] bg-emerald-500" /></div>
                                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">donetogether</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="space-y-1 p-2">
                            <div className="px-2 py-4 my-2 rounded-lg flex items-center justify-between group">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">History</span>
                            </div>
                            <NavItem icon={History} label="Deleted tasks" active={activeView === 'history'} onClick={() => { setActiveView('history'); setSelectedProject(null); }} />
                        </div>

                    </div>
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-[#3d3e40] space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest opacity-50">v1.2.4-PRO</span>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-black relative overflow-x-hidden dotted-pattern">
                {/* Header */}
                <header className="h-14 md:h-16 border-b border-zinc-200/50 dark:border-white/5 flex items-center justify-between px-4 md:px-6 bg-background/80 dark:bg-black/80 backdrop-blur-xl z-30 sticky top-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {!isSidebarOpen && (
                            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="h-8 w-8 shrink-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                <Menu className="w-4 h-4" />
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 group cursor-pointer px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors max-w-[calc(100%-40px)] overflow-hidden outline-none">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-700 hidden sm:flex">
                                        {selectedProject?.avatar_url ? (
                                            <img src={selectedProject.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <LayoutDashboard className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                        )}
                                    </div>
                                    <h1 className="text-lg md:text-xl font-black font-sans text-black dark:text-white tracking-tight truncate">
                                        {selectedProject ? (selectedProject.team_name || selectedProject.title) : (activeView === 'workspace' ? 'Workspace' : (activeView === 'home' ? 'Home' : activeView))}
                                    </h1>
                                    <ChevronDown className="w-4 h-4 shrink-0 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" sideOffset={8} className="w-[210px] p-1.5 rounded-2xl bg-white dark:bg-[#09090b] border-zinc-200 dark:border-zinc-800 shadow-2xl font-body z-[100]">
                                <DropdownMenuLabel className="px-3 pt-2 pb-1 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                                    {activeView === 'home' ? 'Get Started' : 'Actions'}
                                </DropdownMenuLabel>

                                <DropdownMenuItem onClick={() => navigate('/create-project')} className="flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 transition-all outline-none group">
                                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 transition-colors">
                                        <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                    </div>
                                    <span className="text-[13.5px] font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">New Project</span>
                                </DropdownMenuItem>

                                {activeView !== 'home' && (
                                    <>
                                        <DropdownMenuItem onClick={() => setIsCreateTaskOpen(true)} className="flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 transition-all outline-none group">
                                            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 transition-colors">
                                                <ListIcon className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                            </div>
                                            <span className="text-[13.5px] font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">Create Task</span>
                                        </DropdownMenuItem>

                                        {isLead && (
                                            <>
                                                <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 my-1 mx-2" />
                                                <DropdownMenuLabel className="px-3 py-1 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest opacity-80">
                                                    Admin
                                                </DropdownMenuLabel>

                                                <DropdownMenuItem onClick={() => setIsEditProjectOpen(true)} className="flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 transition-all outline-none group">
                                                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 transition-colors">
                                                        <Settings className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                                    </div>
                                                    <span className="text-[13.5px] font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">Settings</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={() => setIsInviteOpen(true)} className="flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 transition-all outline-none group">
                                                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 transition-colors">
                                                        <UserPlus className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                                    </div>
                                                    <span className="text-[13.5px] font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">Invite Team</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={() => setIsGovernanceOpen(true)} className="flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 transition-all outline-none group">
                                                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 transition-colors">
                                                        <ShieldCheck className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                                    </div>
                                                    <span className="text-[13.5px] font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white">Permissions</span>
                                                </DropdownMenuItem>

                                                <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 my-1 mx-2" />

                                                <DropdownMenuItem onClick={() => handleDeleteProject()} className="flex items-center gap-3 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 transition-all outline-none group">
                                                    <div className="w-7 h-7 rounded-lg bg-red-100/50 dark:bg-red-900/20 flex items-center justify-center shrink-0 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-500 group-hover:text-red-700" />
                                                    </div>
                                                    <span className="text-[13.5px] font-bold text-red-600 dark:text-red-500 group-hover:text-red-700 dark:group-hover:text-red-400">Delete Project</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>


                    <div className="flex items-center gap-2 md:gap-6 shrink-0">
                        {/* Team Chat Button - Always visible if a project is selected */}



                        {isLead && activeView !== 'home' && activeView !== 'list' && (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="hidden sm:block">
                                <Button
                                    onClick={() => setIsCreateTaskOpen(true)}
                                    className="bg-zinc-950 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-bold text-[13.5px] px-4 h-9 rounded-full flex items-center gap-2 shadow-lg shadow-zinc-500/10 transition-all border-none active:scale-[0.98]"
                                >
                                    <Plus className="w-4 h-4" strokeWidth={3} />
                                    <span>Add Mission</span>
                                </Button>
                            </motion.div>
                        )}


                        <NotificationDropdown
                            notifications={notifications}
                            unreadCount={unreadCount}
                            onMarkAllAsRead={markAllAsRead}
                        />




                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100 border border-zinc-900 dark:border-white flex items-center justify-center text-sm font-bold text-white dark:text-black outline-none hover:bg-zinc-800 dark:hover:bg-white/90 transition-all shrink-0 group shadow-lg">
                                    {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                                    <span className="absolute bottom-2 right-2 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 dark:border-white rounded-full group-hover:scale-110 transition-transform shadow-sm"></span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[310px] rounded-[24px] p-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden font-body">
                                {/* Header Info */}
                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 mt-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="relative shrink-0">
                                                <Avatar className="w-10 h-10 border border-zinc-900 dark:border-white rounded-full shadow-lg">
                                                    <AvatarImage src={currentUser?.avatar_url} />
                                                    <AvatarFallback className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-bold">
                                                        {currentUser?.full_name?.[0]?.toUpperCase() || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex flex-col min-w-0 pt-0.5 pr-2">
                                                <div className="flex items-center gap-1.5 no-wrap">
                                                    <span className="text-[14.5px] font-bold text-zinc-900 dark:text-white leading-tight tracking-tight truncate max-w-[160px]">
                                                        {currentUser?.full_name || user?.user_metadata?.full_name || 'Innovator'}
                                                    </span>
                                                    <BadgeCheck className="w-3.5 h-3.5 text-[#3b82f6] fill-[#3b82f6]/5 shrink-0" />
                                                </div>
                                                <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-500 truncate mt-1 tracking-tight">
                                                    {user?.email || 'vickyvamsi683@gmail.com'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 pt-0.5">
                                            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-emerald-100/50 dark:border-emerald-500/20">
                                                Early Access
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    {/* Dark Mode Toggle */}
                                    <div className="px-4 py-2.5 flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 flex items-center justify-center">
                                                <Moon className="w-[18px] h-[18px] text-zinc-600 dark:text-zinc-400" />
                                            </div>
                                            <span className="text-[14.5px] font-medium text-zinc-700 dark:text-zinc-300">Dark Mode</span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleTheme();
                                            }}
                                            className={cn(
                                                "w-9 h-5 rounded-full relative transition-all duration-300",
                                                isDark ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                                                isDark ? "left-[18px]" : "left-0.5"
                                            )} />
                                        </button>
                                    </div>

                                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1" />

                                    {isLead && selectedProject && activeView !== 'completion_summary' && !selectedProject.is_completed && (
                                        <div className="px-2 py-1">
                                            <DropdownMenuItem
                                                onClick={() => setIsCompletionConfirmOpen(true)}
                                                className="px-4 py-3 rounded-[1.25rem] flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 focus:bg-emerald-100 dark:focus:bg-emerald-900/20 cursor-pointer outline-none group transition-all border border-emerald-100 dark:border-emerald-500/20"
                                            >
                                                <div className="w-9 h-9 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-[14px] font-black text-emerald-800 dark:text-emerald-400 tracking-tight leading-none">Completed your project?</span>
                                                    <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/50 mt-1 uppercase tracking-widest leading-none">Mark as finished</span>
                                                </div>
                                            </DropdownMenuItem>
                                        </div>
                                    )}

                                    <DropdownMenuItem
                                        onClick={() => {
                                            if (!selectedProject && projects.length > 0) {
                                                setSelectedProject(projects[0]);
                                            }
                                            setActiveView('overview');
                                        }}
                                        className="px-4 py-2.5 flex items-center gap-3 focus:bg-zinc-50 dark:focus:bg-zinc-900 cursor-pointer outline-none group transition-colors"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <Activity className="w-[18px] h-[18px] text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-[14.5px] font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors tracking-tight">Activity</span>
                                    </DropdownMenuItem>


                                    <DropdownMenuItem onClick={() => setActiveView('settings')} className="px-4 py-2.5 flex items-center gap-3 focus:bg-zinc-50 dark:focus:bg-zinc-900 cursor-pointer outline-none group transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <Settings className="w-[18px] h-[18px] text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-[14.5px] font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors tracking-tight">Settings</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={() => navigate('/')} className="px-4 py-2.5 flex items-center gap-3 focus:bg-zinc-50 dark:focus:bg-zinc-900 cursor-pointer outline-none group transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <ArrowLeftToLine className="w-[18px] h-[18px] text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-[14.5px] font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors tracking-tight">Back to Home</span>
                                    </DropdownMenuItem>
                                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1" />

                                    {/* <DropdownMenuItem className="px-4 py-2.5 flex items-center gap-3 focus:bg-zinc-50 dark:focus:bg-zinc-900 cursor-pointer outline-none group transition-colors">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <Plus className="w-[18px] h-[18px] text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-[14.5px] font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Add Account</span>
                                    </DropdownMenuItem> */}

                                    <DropdownMenuItem onClick={signOut} className="px-4 py-2.5 flex items-center gap-3 m-2 mx-1.5 rounded-xl cursor-all-scroll focus:bg-zinc-50 dark:focus:bg-zinc-900 group transition-all duration-300 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 outline-none">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <LogOut className="w-[18px] h-[18px] text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-[14.5px] font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Logout</span>
                                    </DropdownMenuItem>
                                </div>

                                {/* Footer info */}
                                <div className="px-4 py-4 border-t border-zinc-100 dark:border-zinc-900">
                                    <p className="text-[12px] font-medium text-zinc-400 dark:text-zinc-500">
                                        v.1.5.69 · Terms & Conditions
                                    </p>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Navigation Tabs */}
                {selectedProject && (
                    <nav className="h-12 border-b border-zinc-100 dark:border-white/5 flex items-center px-4 md:px-6 gap-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-20 overflow-x-auto scrollbar-hide w-full sticky top-14 md:top-16 transition-all">
                        <Tab active={activeView === 'overview'} onClick={() => setActiveView('overview')}>Team Activity</Tab>
                        <Tab active={activeView === 'board'} onClick={() => setActiveView('board')}>Task List</Tab>
                        <Tab active={activeView === 'timeline'} onClick={() => setActiveView('timeline')}>Timeline</Tab>
                        <Tab active={activeView === 'progress'} onClick={() => setActiveView('progress')}>Progress</Tab>
                        <Tab active={activeView === 'proof_of_work'} onClick={() => setActiveView('proof_of_work')}>Proof of Work</Tab>
                        {/* <Tab active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')}>Analytics</Tab> */}
                    </nav>
                )}

                {/* View Content with Chat Sidebar */}
                <div className="flex-1 flex overflow-hidden bg-transparent relative font-sans">
                    {/* Main View Content */}
                    <div className={`flex-1 overflow-auto bg-transparent ${isMobile ? 'pb-[85px]' : ''}`}>
                        <div className="h-full">
                            {renderView()}
                        </div>
                    </div>


                </div>

                {/* Bottom Navigation for Mobile - Premium Glassmorphism */}
                {isMobile && (
                    <nav className="fixed bottom-6 left-6 right-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl border border-zinc-200/50 dark:border-white/10 rounded-[32px] flex items-center h-[72px] px-4 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300">
                        {/* Navigation Items - Redistributed for better spacing without the Plus button */}
                        <div className="flex-1 flex items-center justify-between px-2">
                            <button
                                onClick={() => { setActiveView('home'); setSelectedProject(null); setIsSidebarOpen(false); }}
                                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${activeView === 'home' ? 'bg-blue-50 text-blue-600' : 'text-zinc-400'}`}
                            >
                                <Home className={activeView === 'home' ? "w-6 h-6" : "w-5 h-5"} />
                            </button>

                            <button
                                onClick={() => { if (selectedProject) setActiveView('board'); setIsSidebarOpen(false); }}
                                disabled={!selectedProject}
                                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${activeView === 'board' ? 'bg-emerald-50 text-emerald-600' : (selectedProject ? 'text-zinc-400' : 'text-zinc-200 opacity-50')}`}
                            >
                                <LayoutDashboard className={activeView === 'board' ? "w-6 h-6" : "w-5 h-5"} />
                            </button>

                            {selectedProject ? (
                                <button
                                    onClick={() => { setActiveView('messages'); setIsSidebarOpen(false); }}
                                    className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${activeView === 'messages' ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-400'}`}
                                >
                                    <MessageSquare className={activeView === 'messages' ? "w-6 h-6" : "w-5 h-5"} />
                                </button>
                            ) : (
                                <div className="w-12" />
                            )}

                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${isSidebarOpen ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400'}`}
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </nav>
                )}

            </main>

            {/* Modals */}
            <CreateTaskModal
                isOpen={isCreateTaskOpen}
                onClose={() => { setIsCreateTaskOpen(false); setSelectedTask(null); }}
                onTaskCreated={selectedProject ? fetchProjectDetails : fetchUserTasks}
                projectId={selectedProject?.id || projects[0]?.id || ''}
                projectDomain={selectedProject?.domain || projects[0]?.domain || 'Other'}
                members={members}
                currentUserId={currentUser?.id || ''}
                task={selectedTask}
                projectStartDate={selectedProject?.start_date}
                projectEndDate={selectedProject?.end_date}
            />

            {selectedProject && (
                <EditProjectModal
                    isOpen={isEditProjectOpen}
                    onClose={() => setIsEditProjectOpen(false)}
                    project={selectedProject}
                    onProjectUpdated={fetchProjectDetails}
                    members={members}
                />
            )}

            {selectedProject && (
                <InviteTeamModal
                    isOpen={isInviteOpen}
                    onClose={() => setIsInviteOpen(false)}
                    project={selectedProject}
                />
            )}

            {selectedProject && (
                <GovernanceModal
                    isOpen={isGovernanceOpen}
                    onClose={() => setIsGovernanceOpen(false)}
                    project={selectedProject}
                    members={members}
                    currentUserId={currentUser?.id || ''}
                    onPermissionsUpdated={fetchProjectDetails}
                />
            )}

            <AIAssistant
                isOpen={isAIOpen}
                onClose={() => setIsAIOpen(false)}
                project={selectedProject ?? { id: '', title: 'No project selected', description: '' }}
                tasks={selectedProject ? projectTasks : userTasks}
                members={members}
                user={currentUser}
                currentUserId={currentUser?.id || ''}
            />

            <AlertDialog open={isCompletionConfirmOpen} onOpenChange={setIsCompletionConfirmOpen}>
                <AlertDialogContent className="rounded-3xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 font-body">
                    <AlertDialogHeader>
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black text-zinc-900 dark:text-white">Complete this project?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400 font-medium text-base mt-2">
                            Are you sure you want to mark <span className="font-bold text-zinc-900 dark:text-white">"{selectedProject?.title}"</span> as completed? You will see a final summary report after this.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-3">
                        <AlertDialogCancel className="h-11 px-6 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold text-zinc-600 dark:text-zinc-400">
                            Go back
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCompleteProject}
                            className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-500/10"
                        >
                            Yes, Complete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );




    function renderView() {
        switch (activeView) {
            case 'home': return <HomeView user={currentUser} tasks={userTasks} onAddTask={handleAddTask} onTasksUpdated={fetchUserTasks} onEditTask={(task) => { setSelectedTask(task); setIsCreateTaskOpen(true); }} />;
            case 'overview': return selectedProject ? <Overview project={selectedProject} members={members} tasks={projectTasks} onProjectUpdated={fetchProjectDetails} isLead={isLead} /> : <HomeView user={currentUser} tasks={userTasks} onAddTask={handleAddTask} onTasksUpdated={fetchUserTasks} onEditTask={(task) => { setSelectedTask(task); setIsCreateTaskOpen(true); }} />;
            case 'list': return <TaskList tasks={selectedProject ? projectTasks : userTasks} members={members} currentUserId={currentUser?.id || ''} isLead={isLead} onTasksUpdated={selectedProject ? fetchProjectDetails : fetchUserTasks} onAddTask={() => setIsCreateTaskOpen(true)} onEditTask={(task) => { setSelectedTask(task); setIsCreateTaskOpen(true); }} />;
            case 'board': return selectedProject ? <BoardView tasks={projectTasks} members={members} currentUserId={currentUser?.id || ''} isLead={isLead} onTasksUpdated={fetchProjectDetails} onAddTask={() => setIsCreateTaskOpen(true)} onEditTask={(task) => { setSelectedTask(task); setIsCreateTaskOpen(true); }} /> : <ComingSoon view="Board" />;
            case 'timeline': return selectedProject ? <TimelineView tasks={projectTasks} members={members} currentUserId={currentUser?.id || ''} isLead={isLead} onTasksUpdated={fetchProjectDetails} onAddTask={() => setIsCreateTaskOpen(true)} /> : <ComingSoon view="Timeline" />;
            case 'dashboard': return <AnalyticsView tasks={projectTasks} members={members} />;
            case 'progress': return <ProgressView tasks={projectTasks} members={members} />;
            case 'proof_of_work': return selectedProject && currentUser ? <ProofOfWorkView projectId={selectedProject.id} currentUser={currentUser} members={members} isLead={isLead} /> : <div />;
            case 'messages': return <InboxView projectId={selectedProject?.id} members={members} currentUserId={currentUser?.id || ''} onlineUsers={onlineUsers} />;
            case 'history': return <HistoryView tasks={selectedProject ? projectTasks : userTasks} members={members} onTasksUpdated={selectedProject ? fetchProjectDetails : fetchUserTasks} />;
            case 'settings': return <SettingsView user={user} currentUser={currentUser} onUserUpdated={fetchUserTasks} />;
            case 'completion_summary': return selectedProject ? (
                <CompletionSummary
                    project={selectedProject}
                    tasks={projectTasks}
                    members={members}
                    onBack={() => setActiveView('overview')}
                />
            ) : <div />;
            default: return <ComingSoon view={activeView} />;
        }
    }
};

interface NavItemProps {
    icon: any;
    label: string;
    active: boolean;
    onClick: () => void;
    color?: string;
}

const NavItem = ({ icon: Icon, label, active, onClick, color }: NavItemProps) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-bold transition-all group active:scale-95 ${active
            ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm border border-zinc-200/50 dark:border-white/5'
            : 'text-zinc-500 dark:text-zinc-500 hover:bg-white/50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white'
            }`}
    >
        <Icon className={`w-4 h-4 transition-colors ${active ? (color || 'text-zinc-950 dark:text-white') : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`} />
        <span className="truncate tracking-tight">{label}</span>
        {active && <div className="ml-auto w-1 h-4 bg-zinc-950 dark:bg-white rounded-full" />}
    </button>
);

interface TabProps {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
}

const Tab = ({ children, active, onClick }: TabProps) => (
    <button
        onClick={onClick}
        className={`h-full px-5 relative font-bold text-[13px] transition-all whitespace-nowrap active:scale-95 ${active
            ? 'text-zinc-950 dark:text-white'
            : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white'
            }`}
    >
        <span className="relative z-10">{children}</span>
        {active && (
            <div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white rounded-full"
            />
        )}
    </button>
);

interface ComingSoonProps {
    view: string;
}

const ComingSoon = ({ view }: ComingSoonProps) => (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center text-zinc-500 font-sans">
        <Timer className="w-16 h-16 mb-4 opacity-80" />
        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">Developing...</h3>
        <p className="max-w-xs mt-2 font-medium uppercase text-[11px] tracking-widest leading-loose">developers hardly working on this , it will come soon</p>
    </div>
);
export default Dashboard;
