import { useEffect, useState, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatSidebar } from './ChatSidebar';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ChatInfoSidebar } from './ChatInfoSidebar';
import { supabase } from '@/lib/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Info, Search, Phone, Video, MoreHorizontal, Menu, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Globe, Users, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/lib/avatarUtils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface ChatLayoutProps {
    projectId: string;
    members?: any[];
    projectTitle?: string;
    canPostMessages?: boolean;
    onlineUsers?: Set<string>;
}

export const ChatLayout = ({ projectId, members = [], projectTitle = "Project Team", canPostMessages = true, onlineUsers = new Set() }: ChatLayoutProps) => {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
    const [projectAvatar, setProjectAvatar] = useState<string | null>(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false); // Toggle for right sidebar

    // Fetch project details including avatar
    useEffect(() => {
        const fetchProjectDetails = async () => {
            if (!projectId) return;
            const { data, error } = await supabase
                .from('projects')
                .select('avatar_url')
                .eq('id', projectId)
                .single();

            if (data && !error) {
                setProjectAvatar(data.avatar_url);
            }
        };
        fetchProjectDetails();
    }, [projectId]);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setCurrentUserId(data.user.id);
                const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', data.user.id).single();
                setCurrentUserProfile(profile);
            }
        };
        getUser();
    }, []);

    // Presence Tracking moved to Dashboard.tsx

    const {
        messages,
        isLoading,
        isConnected,
        sendMessage,
        sendTyping,
        markAsRead,
        editMessage,
        deleteMessage,
        addReaction,
        removeReaction,
        clearChatHistory,
        typingUsers,
        roomId,
        replyTo,
        setReplyTo,
    } = useChat(projectId, currentUserId || undefined);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('🔄 ChatLayout: Messages state changed!', {
            count: messages.length,
            messages: messages,
            isLoading,
            projectId,
            roomId
        });
    }, [messages]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, typingUsers, isInfoOpen]);

    const handleSendMessage = (content: string, attachmentData?: { url: string; name: string; size: number; type: string }, replyToId?: string) => {
        console.log('📨 ChatLayout: handleSendMessage called with:', { content, attachmentData, replyToId });
        console.log('📨 ChatLayout: Current messages count:', messages.length);
        console.log('📨 ChatLayout: Project ID:', projectId);
        console.log('📨 ChatLayout: Room ID:', roomId);
        sendMessage(content, attachmentData, replyToId);
    };

    const handleInputUserChanges = () => {
        if (currentUserProfile) {
            sendTyping(currentUserProfile.display_name || 'Someone');
        }
    };

    if (!projectId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 bg-white dark:bg-black p-8 text-center animate-in fade-in duration-700">
                <div className="relative mb-10">
                    <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 blur-3xl rounded-full scale-150 opacity-50" />
                    <div className="h-24 w-24 rounded-[40px] bg-white dark:bg-zinc-900 shadow-[0_20px_48px_-12px_rgba(0,0,0,0.1)] border-2 border-zinc-50 dark:border-zinc-800 flex items-center justify-center relative z-10">
                        <Globe className="h-10 w-10 text-zinc-900 dark:text-white" />
                    </div>
                </div>
                <h3 className="text-[28px] font-[900] text-zinc-900 dark:text-zinc-100 mb-3 tracking-tight font-satoshi">
                    Mission Hangar Empty
                </h3>
                <p className="max-w-sm text-[16px] font-medium text-zinc-400 leading-relaxed font-body">
                    Select a core project from your workspace to initialize secure team communication.
                </p>
                <Button className="mt-8 rounded-full px-8 py-6 h-auto bg-zinc-900 text-white font-satoshi font-black text-sm uppercase tracking-widest shadow-xl shadow-zinc-500/10 dark:bg-white dark:text-black">
                    Initialize Workspace
                </Button>
            </div>
        );
    }

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-full bg-[#F5F7FF] dark:bg-[#0c0c0c] w-full overflow-hidden relative font-body">
            {/* Texture Overlay for that premium "best" feel */}
            <div className="absolute inset-0 opacity-[0.2] dark:opacity-[0.05] pointer-events-none dotted-pattern" />

            {/* Left Sidebar - Clean White Palette like the image */}
            <div
                className={cn(
                    "hidden md:block h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0c] shrink-0 relative overflow-hidden",
                    isSidebarCollapsed ? "w-0 opacity-0 -translate-x-full" : "w-[320px] opacity-100 translate-x-0"
                )}
                style={{ transition: 'all 0.2s ease-out' }}
            >
                <div className="w-[320px] h-full">
                    <ChatSidebar
                        projectId={projectId}
                        members={members}
                        projectAvatar={projectAvatar}
                        onlineUsers={onlineUsers}
                        lastMessage={messages[messages.length - 1]}
                    />
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Floating Sidebar Toggle Button (when sidebar is collapsed or for small screens) */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className={cn(
                        "absolute left-4 top-[72px] z-50 p-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg transition-transform hover:scale-110 hidden md:flex",
                        isSidebarCollapsed ? "translate-x-0" : "translate-x-[-64px] opacity-0 pointer-events-none" // Move it out of way when sidebar open
                    )}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
                {/* Header - Modern Glassmorphism */}
                <div className="h-[72px] border-b border-zinc-200 dark:border-zinc-800 shrink-0 flex items-center justify-between px-6 bg-white/50 dark:bg-black/40 backdrop-blur-md z-40 sticky top-0 w-full">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        {/* Desktop Sidebar Toggle */}
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden md:flex p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                        >
                            {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                        </button>

                        {/* Mobile Side Menu Trigger */}
                                <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 -ml-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 border-r-0 w-80 bg-white dark:bg-[#0c0c0c]">
                                    <SheetHeader className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                                        <SheetTitle className="text-left font-black flex items-center gap-2">
                                            <div className="h-8 w-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center shadow-md">
                                                <Users className="h-4 w-4 text-white dark:text-black" />
                                            </div>
                                            Team Space
                                        </SheetTitle>
                                    </SheetHeader>
                                    <ChatSidebar
                                        projectId={projectId}
                                        members={members}
                                        projectAvatar={projectAvatar}
                                        onlineUsers={onlineUsers}
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Back button logic could go here for standalone views */}

                        <div className="flex flex-col min-w-0">
                            <h3 className="font-bold text-[15px] md:text-[17px] text-indigo-950 dark:text-zinc-50 truncate font-satoshi tracking-tight">
                                {members.map(m => m.users?.full_name || m.users?.display_name).join(', ') || projectTitle}
                            </h3>
                            <div className="flex items-center gap-2 mt-0">
                                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                                    {onlineUsers.size} ONLINE
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2 mr-2">
                            {members.slice(0, 3).map((member, i) => (
                                <Avatar key={i} className="h-8 w-8 ring-2 ring-white dark:ring-zinc-950 shadow-sm">
                                    <AvatarImage src={member.users?.avatar_url} />
                                    <AvatarFallback className={cn("text-[9px] font-black text-white", getAvatarColor(member.user_id))}>
                                        {getInitials(member.users?.full_name || '?')}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            <button className="h-8 w-8 rounded-full bg-pink-500 flex items-center justify-center text-white ring-2 ring-white dark:ring-zinc-950 shadow-sm hover:scale-110 mb-[-2px] ml-[-2px] z-10 transition-transform">
                                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2 border-l border-zinc-100 dark:border-zinc-800 pl-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsInfoOpen(!isInfoOpen)}
                            className={cn(
                                "h-11 w-11 rounded-2xl",
                                isInfoOpen
                                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-xl scale-105"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            )}
                        >
                            <Info className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Messages List */}
                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full px-4 md:px-8 relative z-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full pt-20 animate-in fade-in duration-700">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-violet-500/10 blur-[40px] rounded-full animate-pulse" />
                                    <Loader2 className="h-10 w-10 text-zinc-900 dark:text-white animate-spin duration-1000 relative z-10" />
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div
                                className="flex items-center justify-center h-full flex-col gap-6 text-center p-8 pt-32"
                            >
                                <div className="relative group cursor-default">
                                    <div className="absolute inset-0 bg-zinc-200/50 dark:bg-zinc-800/50 blur-[60px] rounded-full scale-150 transition-all duration-1000 group-hover:bg-zinc-300/50 dark:group-hover:bg-zinc-700/50"></div>
                                    <div className="h-24 w-24 rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-xl relative z-10 hover:scale-105 transition-transform duration-500">
                                        <div className="relative">
                                            <div className="absolute -right-1 -top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse"></div>
                                            <MessageSquare className="h-10 w-10 text-zinc-900 dark:text-zinc-100" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 relative z-10 max-w-md">
                                    <h3 className="font-bold text-xl md:text-2xl text-zinc-900 dark:text-zinc-50 tracking-tight">
                                        Welcome to {projectTitle}
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm leading-relaxed px-4 md:px-0">
                                        This is the beginning of your team's conversation.<br className="hidden md:block" />
                                        Coordinate tasks, share updates, and move work forward together.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => handleSendMessage("👋 Hi team, excited to work on this!")}
                                    className="mt-2 rounded-2xl h-11 px-8 bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-semibold text-xs uppercase tracking-wide shadow-lg shadow-zinc-500/10"
                                >
                                    Say Hello
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col pb-8 pt-6 max-w-5xl mx-auto min-h-full">
                                {/* Improved Date Divider */}
                                <div className="flex justify-center mb-10 sticky top-4 z-10 pointer-events-none">
                                    <span className="text-[10px] font-black text-zinc-500 bg-white/70 dark:bg-black/70 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-zinc-200/50 dark:border-zinc-800/50 px-6 py-2 rounded-full uppercase backdrop-blur-3xl pointer-events-auto transition-all hover:scale-105 active:scale-95 cursor-default">
                                        Today • {format(new Date(), 'MMMM d')}
                                    </span>
                                </div>

                                {messages.map((msg, index) => {
                                    // Check if previous message was from same sender
                                    const isSequence = index > 0 && messages[index - 1].sender_id === msg.sender_id;
                                    return (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            isOwnMessage={msg.sender_id === currentUserId}
                                            onVisible={markAsRead}
                                            onEdit={editMessage}
                                            onDelete={deleteMessage}
                                            onReact={addReaction}
                                            onRemoveReaction={removeReaction}
                                            onReply={() => setReplyTo(msg)}
                                            currentUserId={currentUserId || ''}
                                            totalProjectMembers={members.length}
                                            isSequence={isSequence}
                                        />
                                    );
                                })}

                                {typingUsers.size > 0 && (
                                    <div className="px-4 py-3 mb-2 text-xs font-bold text-zinc-400 flex items-center gap-3 animate-pulse bg-zinc-50/50 dark:bg-zinc-900/40 rounded-2xl w-fit border border-zinc-100/50 dark:border-zinc-800/50">
                                        <div className="flex -space-x-2">
                                            <Avatar className="h-6 w-6 border-2 border-white dark:border-black"><AvatarFallback>T</AvatarFallback></Avatar>
                                            <Avatar className="h-6 w-6 border-2 border-white dark:border-black"><AvatarFallback>...</AvatarFallback></Avatar>
                                        </div>
                                        <span>
                                            {Array.from(typingUsers).join(', ')} is typing
                                            <motion.span
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >...</motion.span>
                                        </span>
                                    </div>
                                )}

                                <div ref={messagesEndRef} className="h-2" />
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Input Area */}
                {canPostMessages ? (
                    <div onKeyDown={handleInputUserChanges} className="shrink-0 bg-transparent">
                        <ChatInput
                            onSendMessage={handleSendMessage}
                            isLoading={false}
                            projectId={projectId}
                            replyTo={replyTo}
                            setReplyTo={setReplyTo}
                        />
                    </div>
                ) : (
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-center">
                        <p className="text-xs font-bold text-zinc-500 uppercase">
                            You don't have permission to post messages in this project
                        </p>
                    </div>
                )}
            </div>

            {/* Right Info Sidebar (Collapsible on Desktop, Sheet on Mobile) */}
            <AnimatePresence>
                {isInfoOpen && (
                    <>
                        {/* Desktop View */}
                        <div className="hidden lg:block shrink-0 h-full border-l border-zinc-100 dark:border-zinc-800">
                            <ChatInfoSidebar
                                onClose={() => setIsInfoOpen(false)}
                                projectTitle={projectTitle}
                                members={members}
                                messages={messages}
                                onClearChat={clearChatHistory}
                                projectId={projectId}
                                projectAvatar={projectAvatar}
                                onAvatarUpdate={(url) => setProjectAvatar(url)}
                            />
                        </div>

                        {/* Mobile View - Using Sheet for better UX */}
                        <div className="lg:hidden">
                            <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                                <SheetContent side="right" className="p-0 border-l-0 w-full sm:w-[400px] bg-white dark:bg-black">
                                    <ChatInfoSidebar
                                        onClose={() => setIsInfoOpen(false)}
                                        projectTitle={projectTitle}
                                        members={members}
                                        messages={messages}
                                        onClearChat={clearChatHistory}
                                        projectId={projectId}
                                        projectAvatar={projectAvatar}
                                        onAvatarUpdate={(url) => setProjectAvatar(url)}
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
