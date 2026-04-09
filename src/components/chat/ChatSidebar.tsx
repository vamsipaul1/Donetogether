import { useState } from 'react';
import { Search, MessageSquare, Users, Circle, ChevronDown, ChevronRight, Hash } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/lib/avatarUtils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatSidebarProps {
    className?: string;
    projectId?: string;
    members?: any[];
    projectAvatar?: string | null;
    onlineUsers?: Set<string>;
    lastMessage?: any;
}

export const ChatSidebar = ({ className, projectId, members = [], projectAvatar, onlineUsers, lastMessage }: ChatSidebarProps) => {
    const [isMembersOpen, setIsMembersOpen] = useState(false);

    return (
        <div className={cn("flex flex-col h-full bg-white dark:bg-[#0c0c0c] w-full font-body", className)}>
            <div className="px-5 pt-7 pb-3">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-bold text-2xl text-indigo-950 dark:text-white tracking-tighter font-satoshi">Chats</h2>
                    <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-50">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* New Conversation Button - Pink Theme exactly like the image */}
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-pink-100 bg-pink-50/20 text-pink-600 mb-8 font-bold text-[14px] hover:bg-pink-50 transition-all group">
                    <div className="w-5 h-5 rounded-full border-2 border-pink-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-pink-500" />
                    </div>
                    New conversation
                </button>

                <div className="flex items-center justify-between px-2 mb-4">
                    <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] font-body">CHANNELS</span>
                </div>
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="space-y-4 pb-6 mt-1">
                    {/* Main Group Item */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-[0.2em] font-body">CHANNELS</span>
                        </div>
                        <button
                            className={cn(
                                "flex items-center justify-between w-full p-4 text-left rounded-2xl transition-all group bg-zinc-900 text-white shadow-xl shadow-zinc-500/10 dark:bg-white dark:text-black hover:scale-[1.02] active:scale-95"
                            )}
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="flex items-center justify-center w-11 h-11 rounded-[1.25rem] bg-white/10 dark:bg-black/5 backdrop-blur-sm border border-white/10 dark:border-black/5 group-hover:scale-110 transition-transform flex-shrink-0">
                                    <Hash className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-[16px] tracking-tight">general</span>
                                    {lastMessage ? (
                                        <p className="text-[11px] font-medium text-zinc-300 dark:text-zinc-500 truncate mt-0.5 leading-none">
                                            {lastMessage.content?.substring(0, 30)}{lastMessage.content?.length > 30 ? '...' : ''}
                                        </p>
                                    ) : (
                                        <p className="text-[11px] font-medium text-zinc-400/60 truncate mt-0.5 leading-none italic">No messages yet</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Members Section Dropdown */}
                    <div className="space-y-1">
                        <button
                            onClick={() => setIsMembersOpen(!isMembersOpen)}
                            className="flex items-center justify-between w-full px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-2xl transition-all group"
                        >
                            <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-[0.2em] font-body flex items-center gap-2.5">
                                <Users className="h-3.5 w-3.5" />
                                MEMBERS ({members.length})
                            </span>
                            <motion.div
                                animate={{ rotate: isMembersOpen ? 0 : -90 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isMembersOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden space-y-1 pt-1"
                                >
                                    {members.map((member: any, i: number) => {
                                        const isOnline = onlineUsers?.has(member.user_id);
                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "flex items-center gap-3 w-full px-3 py-3 rounded-2xl transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer group"
                                                )}
                                            >
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 shadow-sm ring-2 ring-white dark:ring-zinc-950 group-hover:scale-105 transition-transform">
                                                        <AvatarImage src={member.users?.avatar_url} />
                                                        <AvatarFallback className={cn(
                                                            "text-[10px] font-black text-white",
                                                            getAvatarColor(member.user_id)
                                                        )}>
                                                            {getInitials(member.users?.full_name || member.users?.display_name || member.users?.email || '?')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {isOnline && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center shadow-sm">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <p className="font-bold text-[14px] text-zinc-800 dark:text-zinc-200 truncate group-hover:text-black dark:group-hover:text-white transition-colors uppercase tracking-tight">
                                                        {member.users?.full_name || member.users?.display_name || member.users?.email?.split('@')[0] || 'Partner'}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-500 truncate mt-0.5 leading-none">
                                                        {isOnline ? "Active now" : "Last active 2h ago"}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};
