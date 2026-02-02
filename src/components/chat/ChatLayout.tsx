import { useEffect, useState, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatSidebar } from './ChatSidebar';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ChatInfoSidebar } from './ChatInfoSidebar';
import { supabase } from '@/lib/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Info, Search, Phone, Video, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface ChatLayoutProps {
    projectId: string;
    members?: any[];
    projectTitle?: string;
}

export const ChatLayout = ({ projectId, members = [], projectTitle = "Project Team" }: ChatLayoutProps) => {
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
            <div className="flex items-center justify-center h-full text-muted-foreground bg-white dark:bg-black">
                <p>Select a project to view chat</p>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-white dark:bg-black w-full overflow-hidden relative">
            {/* Left Sidebar */}
            <div className="hidden md:block h-full border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-black w-80 shrink-0">
                <ChatSidebar projectId={projectId} members={members} projectAvatar={projectAvatar} />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 chat-bg relative">
                {/* Header - Premium Minimal Design */}
                <div className="h-[70px] border-b border-zinc-200/40 dark:border-zinc-800/40 shrink-0 flex items-center justify-between px-6 bg-white/95 dark:bg-black/95 backdrop-blur-3xl z-30 sticky top-0 w-full shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* Group Avatar with Subtle Glow */}
                        <div className="relative group">
                            <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-zinc-900 shadow-lg transition-all duration-500 group-hover:scale-105">
                                <AvatarImage src={projectAvatar} />
                                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-semibold text-sm">
                                    {projectTitle.slice(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {isConnected && (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-sm animate-pulse" />
                            )}
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-50 truncate max-w-[150px] md:max-w-xs">
                                    {projectTitle}
                                </h3>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase transition-all duration-500",
                                    isConnected
                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                        : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 animate-pulse"
                                )}>
                                    <span className={cn("h-1 w-1 rounded-full", isConnected ? "bg-emerald-500" : "bg-amber-500")} />
                                    {isConnected ? 'Online' : 'Loading...'}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Member avatars preview - More compact */}
                                <div className="flex -space-x-1.5">
                                    {members.slice(0, 3).map((member, i) => (
                                        <Avatar key={i} className="h-5 w-5 border-2 border-white dark:border-zinc-900 ring-1 ring-zinc-100 dark:ring-zinc-800 shadow-sm transition-transform hover:translate-y-[-2px] cursor-pointer">
                                            <AvatarImage src={member.avatar_url} />
                                            <AvatarFallback className="text-[8px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                                {member.display_name?.slice(0, 1).toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                                <span className="text-[11px] text-zinc-400 font-medium">
                                    {members.length} members
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all">
                            <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all">
                            <Video className="h-5 w-5" />
                        </Button>
                        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsInfoOpen(!isInfoOpen)}
                            className={cn("h-10 w-10 rounded-xl transition-all", isInfoOpen ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100")}
                        >
                            <Info className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Background is handled by .chat-bg class on parent */}

                    <ScrollArea className="h-full px-4 md:px-8 pt-6 relative z-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full flex-col gap-4 opacity-70">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                                    <Loader2 className="h-10 w-10 animate-spin text-emerald-500 relative z-10" />
                                </div>
                                <p className="text-xs font-bold text-zinc-400">Loading messages...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full flex-col gap-6 text-center p-8 opacity-100">
                                <div className="h-32 w-32 rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                                    <span className="text-6xl filter drop-shadow-md">✨</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-2">Welcome to the group!</h3>
                                    <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                                        Start chatting with your team members here.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col pb-4 max-w-5xl mx-auto">
                                {/* Date Divider */}
                                <div className="flex justify-center my-8 sticky top-2 z-10">
                                    <span className="text-[10px] font-bold text-zinc-500 bg-white/90 dark:bg-black/90 shadow-sm border border-zinc-100 dark:border-zinc-800 px-4 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md">Today</span>
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
                                            {Array.from(typingUsers).join(', ')} is typing...
                                        </span>
                                    </div>
                                )}

                                <div ref={messagesEndRef} className="h-2" />
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Input Area */}
                <div onKeyDown={handleInputUserChanges} className="shrink-0 bg-transparent">
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        isLoading={false}
                        projectId={projectId}
                        replyTo={replyTo}
                        setReplyTo={setReplyTo}
                    />
                </div>
            </div>

            {/* Right Info Sidebar (Collapsible) */}
            {isInfoOpen && (
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
            )}
        </div>
    );
};
