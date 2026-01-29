import { useEffect, useState, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatSidebar } from './ChatSidebar';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ChatInfoSidebar } from './ChatInfoSidebar';
import { supabase } from '@/lib/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Info, MoreVertical, Phone, Video, Search } from 'lucide-react';
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
        roomId
    } = useChat(projectId, currentUserId || undefined);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, typingUsers, isInfoOpen]);

    const handleSendMessage = (content: string) => {
        sendMessage(content);
    };

    const handleInputUserChanges = () => {
        if (currentUserProfile) {
            sendTyping(currentUserProfile.display_name || 'Someone');
        }
    };

    if (!projectId) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a project to view chat</p>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-background border rounded-2xl overflow-hidden shadow-sm relative">
            {/* Left Sidebar */}
            <div className="hidden md:block h-full border-r border-border bg-zinc-50/50 dark:bg-zinc-900/20 w-80">
                <ChatSidebar projectId={projectId} />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-black/40 relative">
                {/* Header */}
                <div className="h-16 border-b flex items-center justify-between px-6 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-zinc-100 dark:ring-zinc-800">
                            <AvatarFallback className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 font-bold text-zinc-700 dark:text-zinc-300">
                                {projectTitle.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                {projectTitle}
                                {isConnected ? (
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black"></span>
                                ) : (
                                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                                <div className="flex -space-x-1.5 items-center">
                                    {members.slice(0, 3).map((m, i) => (
                                        <div key={i} className="h-4 w-4 rounded-full border border-white dark:border-black bg-zinc-200 flex items-center justify-center text-[8px]">
                                            {m.users?.email?.[0].toUpperCase()}
                                        </div>
                                    ))}
                                    {members.length > 3 && <span className="pl-1">+{members.length - 3}</span>}
                                </div>
                                <span className="text-emerald-500">{members.length} Online</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                        <Search className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Search Messages</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsInfoOpen(!isInfoOpen)}
                            className={cn("text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-all", isInfoOpen && "bg-zinc-100 text-emerald-600")}
                        >
                            <Info className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Messages List - Background Pattern */}
                <div className="flex-1 overflow-hidden relative bg-[#fdfdfd] dark:bg-[#050505]">
                    {/* Subtle optional background pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

                    <ScrollArea className="h-full px-4 pt-4 relative z-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full flex-col gap-2 opacity-50">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                <p className="text-sm font-medium">Loading conversation...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full flex-col gap-4 text-center p-8 opacity-60">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-50 to-zinc-50 flex items-center justify-center mb-2 shadow-inner">
                                    <span className="text-4xl text-emerald-200">👋</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">No messages yet</h3>
                                    <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-1">
                                        Start the conversation with your team!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col pb-4 max-w-5xl mx-auto">
                                {/* Date Divider Mock */}
                                <div className="flex justify-center my-6">
                                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
                                </div>

                                {messages.map((msg) => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        isOwnMessage={msg.sender_id === currentUserId}
                                        onVisible={markAsRead}
                                        totalProjectMembers={members.length}
                                    />
                                ))}

                                {typingUsers.size > 0 && (
                                    <div className="px-4 py-2 mb-2 text-xs italic text-zinc-400 flex items-center gap-2 animate-pulse">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-[8px]">...</AvatarFallback>
                                        </Avatar>
                                        <span className="flex gap-0.5">
                                            {Array.from(typingUsers).join(', ')} is typing...
                                        </span>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Input Area */}
                <div onKeyDown={handleInputUserChanges}>
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        isLoading={!isConnected}
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
