import { useEffect, useState, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatSidebar } from './ChatSidebar';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ChatInfoSidebar } from './ChatInfoSidebar';
import { supabase } from '@/lib/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Info, Search, Phone, Video, MoreHorizontal, Menu, ChevronLeft, Globe, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
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
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-white dark:bg-black p-8 text-center animate-in fade-in duration-700">
                <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <Globe className="h-10 w-10 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">No Project Selected</h3>
                <p className="max-w-xs text-sm text-zinc-500 leading-relaxed italic">
                    Select a project from your workspace to start collaborating with your team members.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-transparent w-full overflow-hidden relative">
            {/* Left Sidebar - Glassmorphism */}
            <div className="hidden md:block h-full border-r-2 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/40 backdrop-blur-md w-80 shrink-0">
                <ChatSidebar
                    projectId={projectId}
                    members={members}
                    projectAvatar={projectAvatar}
                    onlineUsers={onlineUsers}
                />
            </div>

            {/* Main Chat Area - Ultra Clean Minimalist */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-transparent relative">
                {/* Header - Modern Glassmorphism */}
                <div className="h-[72px] border-b border-zinc-200 dark:border-zinc-800 shrink-0 flex items-center justify-between px-6 bg-white/50 dark:bg-black/40 backdrop-blur-md z-40 sticky top-0 w-full">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        {/* Mobile Side Menu Trigger */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 -ml-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 border-r-0 w-80 bg-white dark:bg-black">
                                    <SheetHeader className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                                        <SheetTitle className="text-left font-black flex items-center gap-2">
                                            <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center shadow-md">
                                                <Users className="h-4 w-4 text-white" />
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

                        {/* Group Avatar with Subtle Glow */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                        >
                            <Avatar className="h-11 w-11 ring-4 ring-white dark:ring-zinc-950 shadow-2xl transition-all duration-500 cursor-pointer hover:ring-emerald-500/20">
                                <AvatarImage src={projectAvatar} />
                                <AvatarFallback className="bg-zinc-900 text-white font-bold text-base shadow-inner">
                                    {projectTitle.slice(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {isConnected && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-950 shadow-sm"
                                />
                            )}
                        </motion.div>

                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-sm md:text-base text-zinc-900 dark:text-zinc-50 truncate">
                                    {projectTitle}
                                </h3>
                                <div className={cn(
                                    "hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase transition-all duration-500",
                                    isConnected
                                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
                                        : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 animate-pulse border border-amber-200/50"
                                )}>
                                    <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-green-500" : "bg-amber-500")} />
                                    {isConnected ? 'Active' : 'Syncing'}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[12px] text-zinc-400 dark:text-zinc-500 font-medium lowercase">
                                    {onlineUsers.size} online
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsInfoOpen(!isInfoOpen)}
                            className={cn(
                                "h-11 w-11 rounded-2xl transition-all duration-300",
                                isInfoOpen
                                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-xl scale-105"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                            )}
                        >
                            <Info className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full px-4 md:px-8 relative z-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full flex-col gap-5 pt-20">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-zinc-200 blur-2xl rounded-full scale-110"></div>
                                    <Loader2 className="h-12 w-12 animate-spin text-zinc-900 relative z-10" />
                                </div>
                                <p className="text-[10px] font-black text-zinc-400 animate-pulse">Loading...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
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
                                    <h3 className="font-bold text-2xl text-zinc-900 dark:text-zinc-50 tracking-tight">
                                        Welcome to {projectTitle}
                                    </h3>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                        This is the beginning of your team's conversation.<br />
                                        Coordinate tasks, share updates, and move work forward together.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => handleSendMessage("👋 Hi team, excited to work on this!")}
                                    className="mt-2 rounded-2xl h-11 px-8 bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-semibold text-xs uppercase tracking-wide shadow-lg shadow-zinc-500/10"
                                >
                                    Say Hello
                                </Button>
                            </motion.div>
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
