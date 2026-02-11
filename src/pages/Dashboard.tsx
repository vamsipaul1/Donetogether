import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Users, LogOut, Sun, Moon, Layout, CheckCircle2, User, Crown, Loader2, ArrowLeftToLine
    , Home, Inbox, BarChart3, Target, Briefcase, Settings, ChevronRight, MessageSquare,
    Calendar as CalendarIcon, FileText, List as ListIcon, Columns, Timer,
    MoreHorizontal, Share2, ChevronDown, UserPlus, Settings2, Trash2, Edit2, FolderPlus, StarIcon, Star, History, LayoutDashboard,
    ShieldCheck, Menu, Globe, PanelLeft, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
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

// Dashboard specialized components
import Overview from '@/components/dashboard/Overview';
import TaskList from '@/components/dashboard/TaskList';
import BoardView from '@/components/dashboard/BoardView';
import TimelineView from '@/components/dashboard/TimelineView';
import HistoryView from '@/components/dashboard/HistoryView';
import AnalyticsView from '@/components/dashboard/AnalyticsView';
import HomeView from '@/components/dashboard/HomeView';
import InboxView from '@/components/dashboard/InboxView';
import ProgressView from '@/components/dashboard/ProgressView';

import { WelcomeOverlay } from '@/components/dashboard/WelcomeOverlay';
import AIAssistant from '@/components/ai/AIAssistant';

// import WorkspaceView from '@/components/dashboard/WorkspaceView';

type DashboardView = 'home' | 'overview' | 'list' | 'board' | 'timeline' | 'dashboard' | 'calendar' | 'workflow' | 'messages' | 'files' | 'workspace' | 'history' | 'progress';

const Dashboard = () => {
    const { user, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    const currentUser: UserType | null = useMemo(() => {
        if (!user) return null;
        return {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at,
        };
    }, [user]);

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
    const [isOwner, setIsOwner] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
    const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [userRole, setUserRole] = useState<'LEADER' | 'MEMBER' | null>(null);
    const [isAIOpen, setIsAIOpen] = useState(false);

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [isMobile]);

    useEffect(() => {
        let isMounted = true;
        const fetchUserData = async () => {
            if (!currentUser) return;
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
                    .eq('user_id', currentUser.id);

                if (memError) throw memError;

                const userProjects = (memberships || []).map((m: { projects: any }) => m.projects);
                if (isMounted) {
                    setProjects(userProjects);
                    // Only auto-select if we don't have a selection and we aren't explicitly on the home view
                    if (userProjects.length > 0 && !selectedProject && activeView !== 'home' && activeView !== 'messages') {
                        setSelectedProject(userProjects[0]);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching dashboard:', error instanceof Error ? error.message : String(error));
            } finally {
                if (isMounted) setLoading(false);
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
            const { data: projData } = await supabase.from('projects').select('*').eq('id', selectedProject.id).single();
            if (projData) setSelectedProject(projData);

            const { data: membersData } = await supabase
                .from('project_members')
                .select('*, users(*)')
                .eq('project_id', selectedProject.id);

            setMembers(membersData || []);
            setIsOwner(!!membersData?.find(m => m.user_id === currentUser.id && m.role === 'owner'));

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
        if (!selectedProject || !isOwner) return;
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

    // State to allow owner to bypass waiting room
    const [bypassedWaitingRoom, setBypassedWaitingRoom] = useState(false);

    // Removed auto-redirect to onboarding to prevent loops
    // useEffect(() => {
    //     if (!loading && projects.length === 0) {
    //         navigate('/onboarding');
    //     }
    // }, [loading, projects.length, navigate]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-950 font-outfit"><Loader2 className="animate-spin text-emerald-500" /></div>;

    // Show Waiting Room only if:
    // 1. Team is incomplete
    // 2. User hasn't bypassed it (for owners)
    // 3. Members list is loaded (to check role)
    // Bypassed Waiting Room for user request
    /*
    if (selectedProject && !selectedProject.is_team_complete && !bypassedWaitingRoom) {
        // If owner, they can bypass. If member, they stick here until team complete.
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
        <div className="flex h-screen bg-background dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-300">
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
                    width: isSidebarOpen ? (isMobile ? 220 : 280) : 0,
                    opacity: isSidebarOpen ? 1 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                }}
                className={`
                    bg-[hsl(var(--sidebar-background))] dark:bg-[#050505] border-r border-zinc-200 dark:border-zinc-800 
                    flex flex-col z-50 overflow-hidden dotted-pattern
                    ${isMobile ? 'fixed inset-y-0 left-0 h-full w-[280px] shadow-2xl safe-area-left' : 'relative'}
                `}
            >
                <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-[hsl(var(--sidebar-background))] dark:bg-[#050505] z-10">
                    <div className="flex items-center gap-3 group cursor-pointer">
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
                    </div>
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
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900">
                            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
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
                        <NavItem icon={Inbox} label="Inbox" active={activeView === 'messages'} onClick={() => { setActiveView('messages'); setSelectedProject(null); }} />

                        {selectedProject && (
                            <button
                                onClick={() => setIsAIOpen(true)}
                                className="flex items-center justify-start gap-2 px-4 py-3 w-full rounded-xl transition-all group active:scale-95 hover:bg-zinc-100 dark:hover:bg-[#3d3e40]"
                            >
                                <span className="text-[16px] font-semibold tracking-wide text-[#3b82f6] dark:text-[#60a5fa] transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-pink-600">
                                    ThinkSense <span className="text-[10px]">AI</span>
                                </span>
                            </button>
                        )}
                    </div>

                    <div className="space-y-1">
                        <div className="px-4 py-2 flex items-center justify-between group">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Projects</span>
                            {isOwner && projects.length > 0 && <Plus className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => navigate('/create-project')} />}
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
                                    className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-bold transition-all group active:scale-95 ${selectedProject?.id === proj.id
                                        ? 'bg-zinc-200 dark:bg-[#454547] text-zinc-900 dark:text-white shadow-sm'
                                        : 'text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-[#3d3e40]'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="w-5 h-5 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-transform group-hover:scale-110">
                                            <AvatarImage src={proj.avatar_url} />
                                            <AvatarFallback className={cn("text-[8px] font-black text-white", selectedProject?.id === proj.id ? "bg-emerald-600" : "bg-zinc-400 group-hover:bg-emerald-500")}>
                                                {proj.team_name?.slice(0, 1).toUpperCase() || proj.title.slice(0, 1).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {selectedProject?.id === proj.id && (
                                            <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full ring-1 ring-white dark:ring-black animate-pulse" />
                                        )}
                                    </div>
                                    <span className="truncate tracking-normal font-medium">{proj.team_name || proj.title}</span>
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
                            <DropdownMenuContent side="right" align="start" className={`${isMobile ? 'w-52' : 'w-64'} ml-2 rounded-xl p-2 font-sans bg-white dark:bg-black border-zinc-200 dark:border-[#3d3e40] shadow-xl`}>
                                <DropdownMenuLabel className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest px-2 py-1.5 mb-1">My workspace</DropdownMenuLabel>

                                {isOwner && (
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
                                                        <User className="w-3 h-3 text-zinc-300 dark:text-zinc-600" />
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
                                {!isOwner && (
                                    <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-default opacity-50">
                                        <span className="text-xs text-zinc-500">Member access only</span>
                                    </DropdownMenuItem>
                                )}

                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2 mx-2" />

                                <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 focus:bg-zinc-100 dark:focus:bg-[#2e2f31] rounded-lg cursor-pointer bg-zinc-50 dark:bg-[#2e2f31]/50">
                                    <div className="w-8 flex justify-center"><div className="w-3 h-3 rounded-[3px] bg-emerald-500" /></div>
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

                <div className="p-4 border-t border-zinc-200 dark:border-[#3d3e40]">
                    <div className="p-4 rounded-[20px] bg-zinc-100 dark:bg-zinc-800/50 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">v0.1.0-alpha</span>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-black relative overflow-hidden dotted-pattern">
                {/* Header */}
                <header className="h-14 md:h-16 border-b border-zinc-200/50 dark:border-white/5 flex items-center justify-between px-4 md:px-6 bg-background/80 dark:bg-black/80 backdrop-blur-xl z-30 sticky top-0">
                    <div className="flex items-center gap-4 min-w-0">
                        {!isSidebarOpen && (
                            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                <Menu className="w-4 h-4" />
                            </Button>
                        )}

                        {isOwner && (
                            <div className="flex items-center gap-2 group cursor-pointer px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors max-w-full overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                    {selectedProject?.avatar_url ? (
                                        <img src={selectedProject.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <LayoutDashboard className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                    )}
                                </div>
                                <h1 className="text-xl font-bold font-sans text-zinc-900 dark:text-white tracking-tight truncate">
                                    {selectedProject ? (selectedProject.team_name || selectedProject.title) : (activeView === 'workspace' ? 'Workspace' : (activeView === 'home' ? 'Home' : activeView))}
                                </h1>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-64 rounded-2xl p-2 font-outfit shadow-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Project Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => setIsCreateTaskOpen(true)} className="gap-2 cursor-pointer">
                                            <img src="/image copy 4.png" alt="" className="w-4 h-4 dark:invert" /> <span>New task</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/create-project')} className="gap-2 cursor-pointer">
                                            <FolderPlus className="w-4 h-4" /> <span>New project</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setIsEditProjectOpen(true)} className="gap-2 cursor-pointer">
                                            <Settings className="w-4 h-4" /> <span>Edit details</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDeleteProject} className="gap-2 cursor-pointer text-red-500 ">
                                            <Trash2 className="w-4 h-4" /> <span>Delete project</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                        {!isOwner && (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-lg max-w-full overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                    {selectedProject?.avatar_url ? (
                                        <img src={selectedProject.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <LayoutDashboard className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                    )}
                                </div>
                                <h1 className="text-xl font-bold font-sans text-zinc-900 dark:text-white tracking-tight truncate">
                                    {selectedProject ? (selectedProject.team_name || selectedProject.title) : (activeView === 'workspace' ? 'Workspace' : (activeView === 'home' ? 'Home' : activeView))}
                                </h1>
                            </div>
                        )}
                    </div>


                    <div className="flex items-center gap-6">
                        {/* Team Chat Button - Always visible if a project is selected */}
                        {selectedProject && (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={() => setActiveView('messages')}
                                    className="h-10 px-4 rounded-2xl hidden md:flex items-center gap-3 
                                     bg-zinc-200 dark:bg-white text-black dark:text-black hover:bg-black hover:text-white dark:hover:bg-zinc-300 transition-colors"

                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Team Chat</span>
                                </Button>
                            </motion.div>
                        )}


                        {isOwner && (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={() => setIsCreateTaskOpen(true)}
                                    className="bg-zinc-950 dark:bg-white text-white dark:text-black font-bold text-[13px] px-6 h-10 rounded-2xl  bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                                >
                                    <img src="/image copy 4.png" alt="" className="w-4 h-4 invert brightness-200 dark:invert-0 dark:brightness-100" />
                                    <span>Add Task</span>
                                </Button>
                            </motion.div>
                        )}


                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-600 dark:bg-zinc-800 text-zinc-900 hover:text-white dark:hover:text-white border dark:bg-white hover:bg-black dark:hover:bg-zinc-700 transition-all shadow-sm group"
                                    title="Back to Landing Page"
                                >
                                    <ArrowLeftToLine className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="relative w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-900 transition-all">
                                    {user?.email?.[0]?.toUpperCase() || '?'}
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-black rounded-full"></span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <DropdownMenuLabel className="p-3 font-normal">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                                            {user?.email?.[0]?.toUpperCase() || '?'}
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-black rounded-full"></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-zinc-900 dark:text-white truncate leading-tight">
                                                {currentUser?.full_name || 'Vamsi Rangumudri'}
                                            </p>
                                            <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 truncate mt-0.5 uppercase tracking-wider">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="mx-2 opacity-50" />
                                <div className="p-1.5 space-y-1">
                                    <DropdownMenuItem onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-zinc-900 dark:text-zinc-400 focus:bg-zinc-100/80 dark:focus:bg-zinc-800/40 cursor-pointer transition-colors tracking-tight outline-none">
                                        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        {isDark ? 'Light Mode' : 'Dark Mode'}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-rose-700 hover:text-rose-300 focus:bg-rose-50/50 dark:focus:bg-rose-950/10 cursor-pointer transition-colors tracking-tight outline-none">
                                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center shrink-0">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                        Log Out
                                    </DropdownMenuItem>
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
                        {/* <Tab active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')}>Analytics</Tab> */}
                    </nav>
                )}

                {/* View Content with Chat Sidebar */}
                <div className="flex-1 flex overflow-hidden bg-transparent relative font-sans">
                    {/* Main View Content */}
                    <div className={`flex-1 overflow-auto bg-transparent ${isMobile ? 'pb-[85px]' : ''}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeView + (selectedProject?.id || '')}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="h-full"
                            >
                                {renderView()}
                            </motion.div>
                        </AnimatePresence>
                    </div>


                </div>

                {/* Bottom Navigation for Mobile - Premium Glassmorphism */}
                {isMobile && (
                    <nav className="fixed bottom-6 left-4 right-4 bg-black/80 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/10 dark:border-white/10 rounded-[32px] flex items-center justify-between h-[64px] px-6 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                        <button
                            onClick={() => { setActiveView('home'); setSelectedProject(null); setIsSidebarOpen(false); }}
                            className={`flex flex-col items-center justify-center gap-1 ${activeView === 'home' ? 'text-white' : 'text-zinc-500'}`}
                        >
                            <Home className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => { if (selectedProject) setActiveView('board'); setIsSidebarOpen(false); }}
                            disabled={!selectedProject}
                            className={`flex flex-col items-center justify-center gap-1 ${activeView === 'board' ? 'text-white' : (selectedProject ? 'text-zinc-500' : 'text-zinc-700 opacity-50')}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setIsCreateTaskOpen(true)}
                            className="relative -top-8 bg-violet-600 hover:bg-violet-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(124,58,237,0.5)] border-4 border-[#F9F8F6] dark:border-black transition-transform active:scale-95"
                        >
                            <Plus className="w-7 h-7" />
                        </button>

                        {selectedProject && (
                            <button
                                onClick={() => { setActiveView('messages'); setIsSidebarOpen(false); }}
                                className={`flex flex-col items-center justify-center gap-1 ${activeView === 'messages' ? 'text-white' : 'text-zinc-500'}`}
                            >
                                <MessageSquare className="w-5 h-5" />
                            </button>
                        )}

                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`flex flex-col items-center justify-center gap-1 ${isSidebarOpen ? 'text-white' : 'text-zinc-500'}`}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
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

            {/* AI Assistant */}
            {selectedProject && (
                <AIAssistant
                    isOpen={isAIOpen}
                    onClose={() => setIsAIOpen(false)}
                    project={selectedProject}
                    tasks={projectTasks}
                    members={members}
                    user={currentUser}
                    currentUserId={currentUser?.id || ''}
                />
            )}
        </div>
    );

    function renderView() {
        switch (activeView) {
            case 'home': return <HomeView user={currentUser} tasks={userTasks} onAddTask={handleAddTask} onTasksUpdated={fetchUserTasks} />;
            case 'overview': return selectedProject ? <Overview project={selectedProject} members={members} tasks={projectTasks} onProjectUpdated={fetchProjectDetails} isOwner={isOwner} /> : <HomeView user={currentUser} tasks={userTasks} onAddTask={handleAddTask} onTasksUpdated={fetchUserTasks} />;
            case 'list': return <TaskList tasks={selectedProject ? projectTasks : userTasks} members={members} currentUserId={currentUser?.id || ''} isOwner={isOwner} onTasksUpdated={selectedProject ? fetchProjectDetails : fetchUserTasks} onAddTask={() => setIsCreateTaskOpen(true)} onEditTask={(task) => { setSelectedTask(task); setIsCreateTaskOpen(true); }} />;
            case 'board': return selectedProject ? <BoardView tasks={projectTasks} members={members} currentUserId={currentUser?.id || ''} isOwner={isOwner} onTasksUpdated={fetchProjectDetails} onAddTask={() => setIsCreateTaskOpen(true)} onEditTask={(task) => { setSelectedTask(task); setIsCreateTaskOpen(true); }} /> : <ComingSoon view="Board" />;
            case 'timeline': return selectedProject ? <TimelineView tasks={projectTasks} members={members} currentUserId={currentUser?.id || ''} isOwner={isOwner} onTasksUpdated={fetchProjectDetails} onAddTask={() => setIsCreateTaskOpen(true)} /> : <ComingSoon view="Timeline" />;
            case 'dashboard': return <AnalyticsView tasks={projectTasks} members={members} />;
            case 'progress': return <ProgressView tasks={projectTasks} members={members} />;
            case 'messages': return <InboxView projectId={selectedProject?.id} members={members} />;
            case 'history': return <HistoryView tasks={selectedProject ? projectTasks : userTasks} members={members} onTasksUpdated={selectedProject ? fetchProjectDetails : fetchUserTasks} />;
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
        {active && <motion.div layoutId="activeNav" className="ml-auto w-1 h-4 bg-zinc-950 dark:bg-white rounded-full" />}
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
            <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 dark:bg-white rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
