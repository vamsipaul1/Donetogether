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
    const [isInfoOpen, setIsInfoOpen] = useState(false); // Toggle for right sidebar

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
        typingUsers,
        roomId,
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

    const handleSendMessage = (content: string) => {
        console.log('📨 ChatLayout: handleSendMessage called with:', content);
        console.log('📨 ChatLayout: Current messages count:', messages.length);
        console.log('📨 ChatLayout: Project ID:', projectId);
        console.log('📨 ChatLayout: Room ID:', roomId);
        sendMessage(content);
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
                <ChatSidebar projectId={projectId} members={members} />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-[#f8f9fa] dark:bg-[#0a0a0a] relative">
                {/* Header */}
                <div className="h-[75px] border-b border-zinc-200/50 dark:border-zinc-800 shrink-0 flex items-center justify-between px-6 bg-gradient-to-r from-white/90 via-white/95 to-white/90 dark:from-black/90 dark:via-black/95 dark:to-black/90 backdrop-blur-2xl z-10 sticky top-0 w-full shadow-lg shadow-zinc-200/5 dark:shadow-none">
                    <div className="flex items-center gap-4">
                        {/* Group Avatar Stack */}
                        <div className="relative">
                            <Avatar className="h-12 w-12 ring-2 ring-emerald-500/30 dark:ring-emerald-500/20 shadow-xl shadow-emerald-500/20">
                                <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white font-black text-lg">
                                    {projectTitle.slice(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {isConnected && (
                                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-black shadow-lg animate-pulse" />
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-2.5">
                                <h3 className="font-black text-base text-zinc-900 dark:text-zinc-50 tracking-tight">
                                    {projectTitle}
                                </h3>
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all",
                                    isConnected
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-sm"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 animate-pulse"
                                )}>
                                    {isConnected ? '● LIVE' : '○ CONNECTING'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                {/* Member avatars preview */}
                                <div className="flex -space-x-2">
                                    {members.slice(0, 3).map((member, i) => (
                                        <Avatar key={i} className="h-5 w-5 border-2 border-white dark:border-black shadow-sm">
                                            <AvatarFallback className="text-[8px] font-bold bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 text-zinc-600">
                                                {member.display_name?.slice(0, 2).toUpperCase() || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {members.length > 3 && (
                                        <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-black flex items-center justify-center">
                                            <span className="text-[8px] font-black text-zinc-600 dark:text-zinc-400">+{members.length - 3}</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                                    {members.length} {members.length === 1 ? 'member' : 'members'} online
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
                    {/* Modern background pattern */}
                    <div className="absolute inset-0 opacity-[0.4] pointer-events-none dotted-pattern"></div>

                    <ScrollArea className="h-full px-4 md:px-8 pt-6 relative z-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full flex-col gap-4 opacity-70">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                                    <Loader2 className="h-10 w-10 animate-spin text-emerald-500 relative z-10" />
                                </div>
                                <p className="text-sm font-bold text-zinc-500 tracking-wide uppercase">Syncing chat...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full flex-col gap-6 text-center p-8 opacity-100">
                                <div className="h-32 w-32 rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                                    <span className="text-6xl filter drop-shadow-md">✨</span>
                                </div>
                                <div>
                                    <h3 className="font-black text-2xl text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">Welcome to Team Chat!</h3>
                                    <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
                                        This is the beginning of your legendary project history. Say hello to the team!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col pb-4 max-w-5xl mx-auto">
                                {/* Date Divider */}
                                <div className="flex justify-center my-8 sticky top-2 z-10">
                                    <span className="text-[10px] font-black text-zinc-500 bg-white/90 dark:bg-zinc-900/90 shadow-sm border border-zinc-100 dark:border-zinc-800 px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md">Today</span>
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
                                            totalProjectMembers={members.length}
                                            isSequence={isSequence}
                                        />
                                    );
                                })}

                                {typingUsers.size > 0 && (
                                    <div className="px-4 py-3 mb-2 text-xs font-bold text-zinc-400 flex items-center gap-3 animate-pulse bg-white/50 dark:bg-zinc-800/50 rounded-2xl w-fit">
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
                <div onKeyDown={handleInputUserChanges} className="shrink-0 bg-[#f8f9fa] dark:bg-[#0a0a0a]">
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        isLoading={false}
                        projectId={projectId}
                    />
                </div>
            </div>

            {/* Right Info Sidebar (Collapsible) */}
            {isInfoOpen && (
                <ChatInfoSidebar
                    onClose={() => setIsInfoOpen(false)}
                    projectTitle={projectTitle}
                    members={members}
                />
            )}
        </div>
    );
};
