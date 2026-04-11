import { useEffect, useState, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatSidebar } from './ChatSidebar';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ChatInfoSidebar } from './ChatInfoSidebar';
import { supabase } from '@/lib/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Info, Menu, PanelLeftClose, PanelLeftOpen, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
    const [projectAvatar, setProjectAvatar] = useState<string | null>(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

    // Initial data fetching
    useEffect(() => {
        const initChat = async () => {
            if (!projectId) return;
            
            // Fetch project avatar
            const { data: projData } = await supabase
                .from('projects')
                .select('avatar_url')
                .eq('id', projectId)
                .single();
            if (projData) setProjectAvatar(projData.avatar_url);

            // Get current user
            const { data: authData } = await supabase.auth.getUser();
            if (authData.user) setCurrentUserId(authData.user.id);
        };
        initChat();
    }, [projectId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages, typingUsers, isInfoOpen]);

    const handleSendMessage = (content: string, attachmentData?: any, replyToId?: string) => {
        sendMessage(content, attachmentData, replyToId);
    };

    if (!projectId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 bg-white dark:bg-black p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-100 dark:border-white/5">
                    <MessageSquare className="h-8 w-8 text-zinc-300" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Select a project</h3>
                <p className="text-sm font-medium max-w-xs leading-relaxed">
                    Pick a project from the workspace to view your team's messages.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-white dark:bg-[#09090b] w-full overflow-hidden relative font-body">
            {/* Main Column Sidebar */}
            {!isSidebarCollapsed && (
                <div className="hidden md:block w-80 h-full border-r border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/10 shrink-0 overflow-hidden">
                    <ChatSidebar
                        projectId={projectId}
                        members={members}
                        projectAvatar={projectAvatar}
                        onlineUsers={onlineUsers}
                        lastMessage={messages[messages.length - 1]}
                    />
                </div>
            )}

            {/* Chat Content Column */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#09090b] relative">
                {/* Clean Product Header */}
                <header className="h-[64px] border-b border-zinc-100 dark:border-white/5 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-black/80 backdrop-blur-md z-30 select-none">
                    <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden md:flex h-9 w-9 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        >
                            {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                        </Button>

                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-80">
                                    <ChatSidebar projectId={projectId} members={members} projectAvatar={projectAvatar} onlineUsers={onlineUsers} />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-zinc-200 dark:border-white/10">
                                <AvatarImage src={projectAvatar} />
                                <AvatarFallback className="bg-zinc-900 text-white font-bold">{projectTitle[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{projectTitle}</h3>
                                <p className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
                                    <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-emerald-500" : "bg-amber-500")} />
                                    {onlineUsers.size} members online
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsInfoOpen(!isInfoOpen)}
                        className={cn(
                            "h-9 w-9 rounded-lg transition-colors",
                            isInfoOpen ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        )}
                    >
                        <Info className="h-5 w-5" />
                    </Button>
                </header>

                {/* Message Scroll Area */}
                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full px-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 pt-20">
                                <div className="h-20 w-20 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 flex items-center justify-center shadow-sm">
                                    <Plus className="h-8 w-8 text-zinc-300" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-zinc-900 dark:text-white">Start the conversation</h4>
                                    <p className="text-sm text-zinc-500 mt-1">Send a message to sync with your team.</p>
                                </div>
                                <Button 
                                    onClick={() => handleSendMessage("👋 Hey team!")}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-purple-600/10"
                                >
                                    Quick Intro
                                </Button>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto py-8">
                                <div className="flex justify-center mb-8">
                                    <div className="text-[10px] font-black uppercase text-zinc-400 bg-zinc-100/50 dark:bg-zinc-800/50 px-4 py-1.5 rounded-full tracking-[0.2em]">
                                        {format(new Date(), 'MMMM d, yyyy')}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {messages.map((msg, idx) => {
                                        const isSequence = idx > 0 && messages[idx - 1].sender_id === msg.sender_id;
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
                                </div>
                                <div ref={messagesEndRef} className="h-10" />
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Chat Input Bottom Section */}
                {canPostMessages ? (
                    <div className="px-6 py-4 bg-white dark:bg-[#09090b] border-t border-zinc-100 dark:border-white/5">
                        <ChatInput
                            onSendMessage={handleSendMessage}
                            projectId={projectId}
                            replyTo={replyTo}
                            setReplyTo={setReplyTo}
                        />
                    </div>
                ) : (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 text-center border-t border-zinc-100 dark:border-white/5">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            Read-only channel
                        </p>
                    </div>
                )}
            </div>

            {/* Info Sidebar (Simple Product Style) */}
            <div className="hidden lg:block">
                {isInfoOpen && (
                    <div className="w-[360px] h-full border-l border-zinc-100 dark:border-white/5 shrink-0 bg-white dark:bg-[#09090b]">
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
                )}
            </div>

            {/* Mobile Info Sheet */}
            <div className="lg:hidden">
                <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                    <SheetContent side="right" className="p-0 w-full sm:w-[360px]">
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
        </div>
    );
};
