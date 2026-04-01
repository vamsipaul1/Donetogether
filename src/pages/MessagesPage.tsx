import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { useNavigate, useParams } from 'react-router-dom';
import {
    MessageSquare,
    ArrowLeft,
    Home,
    Settings,
    Search,
    Users,
    ChevronLeft,
    Phone,
    Video,
    MoreVertical,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const MessagesPage = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { projectId: routeProjectId } = useParams();

    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(routeProjectId || null);
    const [isLoading, setIsLoading] = useState(true);
    const [members, setMembers] = useState<any[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [projectSearch, setProjectSearch] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading]);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user) return;
            try {
                const { data: memberships } = await supabase
                    .from('project_members')
                    .select('projects(*)')
                    .eq('user_id', user.id)
                    .order('joined_at', { ascending: false });

                const userProjects = (memberships || []).map((m: any) => m.projects).filter(Boolean);
                setProjects(userProjects);

                if (userProjects.length > 0 && !selectedProjectId) {
                    setSelectedProjectId(userProjects[0].id);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [user]);

    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchMembers = async () => {
            const { data } = await supabase
                .from('project_members')
                .select('*, users(*)')
                .eq('project_id', selectedProjectId);
            setMembers(data || []);
        };

        fetchMembers();

        // Presence logic (Simplified for this view)
        const channel = supabase.channel(`presence-messages-${selectedProjectId}`)
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const users = new Set<string>();
                for (const id in state) {
                    (state[id] as any).forEach((p: any) => users.add(p.user_id));
                }
                setOnlineUsers(users);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ user_id: user?.id, online_at: new Date().toISOString() });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedProjectId, user?.id]);

    const activeProject = projects.find(p => p.id === selectedProjectId);
    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        p.team_name?.toLowerCase().includes(projectSearch.toLowerCase())
    );

    if (authLoading || isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#0c0c0c] font-body animate-in fade-in duration-1000">
                <div className="relative flex flex-col items-center gap-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-violet-500/10 blur-[60px] rounded-full scale-150 animate-pulse"></div>

                    </div>
                    <div className="space-y-3 text-center relative z-10">
                        <h2 className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Loading ...</h2>
                        <p className="text-[14px] text-zinc-600 font-medium">Entering your chat Room</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#f0f2f5] dark:bg-[#0c0c0c] flex overflow-hidden font-body">
            {/* Sidebar - WhatsApp Look (Project List) */}
            <div className={cn(
                "w-full md:w-[420px] h-full flex flex-col bg-white dark:bg-[#111] border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300",
                selectedProjectId && "hidden md:flex"
            )}>
                {/* Header */}
                <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-[22px] font-black tracking-tight text-zinc-900 dark:text-white font-body">Messages</h1>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="rounded-full text-zinc-500"><Users className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="rounded-full text-zinc-500"><MoreVertical className="h-5 w-5" /></Button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-3 shrink-0">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search projects or teams..."
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-none rounded-xl text-sm transition-all focus:ring-1 focus:ring-zinc-900/5 dark:focus:ring-white/5 focus:outline-none dark:text-zinc-200 placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
                        />
                    </div>
                </div>

                {/* Project/Chat List */}
                <ScrollArea className="flex-1">
                    <div className="px-2 space-y-1 py-1">
                        {filteredProjects.map((proj) => {
                            const isActive = selectedProjectId === proj.id;
                            const isOnline = members.some(m => onlineUsers.has(m.user_id) && m.project_id === proj.id);

                            return (
                                <button
                                    key={proj.id}
                                    onClick={() => setSelectedProjectId(proj.id)}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative group",
                                        isActive
                                            ? "bg-white dark:bg-zinc-800/40 shadow-sm border border-zinc-200/50 dark:border-white/5"
                                            : "hover:bg-white/60 dark:hover:bg-zinc-800/20"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="h-14 w-14 rounded-2xl shadow-lg border border-zinc-900 dark:border-white">
                                            <AvatarImage src={proj.avatar_url} />
                                            <AvatarFallback className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-black text-lg">
                                                {proj.title.slice(0, 1).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {isOnline && (
                                            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={cn(
                                                "font-black text-[16px] truncate font-body tracking-tight leading-tight",
                                                isActive ? "text-zinc-900 dark:text-white" : "text-zinc-900 dark:text-zinc-100"
                                            )}>
                                                {proj.title}
                                            </h3>
                                        </div>
                                        <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-400 font-body truncate leading-tight">
                                            {proj.team_name || 'Project Team'}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="absolute left-0 w-1.5 h-10 bg-zinc-900 dark:bg-white rounded-r-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>

                {/* Footer / Account */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-zinc-900 dark:border-white shadow-md">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-black text-xs uppercase">
                                {user?.user_metadata?.full_name?.slice(0, 1) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-zinc-900 dark:text-white truncate max-w-[120px]">
                                {user?.user_metadata?.full_name || 'User'}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Now</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate('/dashboard')}>
                        <Home className="h-5 w-5 text-zinc-500" />
                    </Button>
                </div>
            </div>

            {/* Chat Area - Full access view */}
            <div className={cn(
                "flex-1 flex flex-col h-full bg-white dark:bg-black relative",
                !selectedProjectId && "hidden md:flex"
            )}>
                {selectedProjectId ? (
                    <div className="h-full relative animate-in fade-in zoom-in-95 duration-500">
                        {/* Mobile Back Button */}
                        <div className="md:hidden absolute top-4 left-4 z-[99]">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedProjectId(null)}
                                className="h-11 w-11 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-xl backdrop-blur-xl"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </div>

                        <ChatLayout
                            projectId={selectedProjectId}
                            members={members}
                            projectTitle={activeProject?.title}
                            onlineUsers={onlineUsers}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#111] animate-in fade-in duration-700">
                        <div className="relative group mb-8">
                            <div className="absolute inset-0 bg-zinc-900/5 dark:bg-zinc-100/5 blur-[50px] rounded-full scale-150 group-hover:bg-zinc-900/10 dark:group-hover:bg-zinc-100/10 transition-all duration-1000"></div>
                            <div className="h-32 w-32 rounded-[40px] bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-10 hover:scale-105 transition-all duration-500">
                                <MessageSquare className="h-16 w-16 text-zinc-900 dark:text-zinc-100" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Select a conversation</h3>
                        <p className="max-w-xs text-center text-zinc-500 dark:text-zinc-400 text-sm mt-3 leading-relaxed">
                            Start collaborating with your project partners. Choose a team from the list to view the full chat.
                        </p>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/dashboard')}
                            className="mt-8 rounded-2xl h-11 px-8 font-black text-xs uppercase tracking-widest bg-zinc-900 text-white dark:bg-white dark:text-black hover:scale-105 transition-all shadow-xl"
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
