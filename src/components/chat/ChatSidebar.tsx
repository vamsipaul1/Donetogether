import { useState } from 'react';
import { Search, Users, ChevronDown, Hash } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/lib/avatarUtils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
    className?: string;
    projectId?: string;
    members?: any[];
    projectAvatar?: string | null;
    onlineUsers?: Set<string>;
    lastMessage?: any;
}

export const ChatSidebar = ({ className, members = [], onlineUsers, lastMessage }: ChatSidebarProps) => {
    const [isMembersOpen, setIsMembersOpen] = useState(false);

    const formatLastActive = (dateString?: string) => {
        if (!dateString) return "Offline";
        try {
            const date = new Date(dateString);
            return `Last active ${formatDistanceToNow(date, { addSuffix: true })}`;
        } catch (e) {
            return "Offline";
        }
    };

    return (
        <div className={cn("flex flex-col h-full bg-zinc-50/50 dark:bg-[#0c0c0b] w-full font-body", className)}>
            <div className="px-5 pt-8 pb-4">
                <div className="mb-6">
                    <h2 className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight">Messages</h2>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-zinc-600" />
                    <input
                        placeholder="Search workspace..."
                        className="w-full pl-9 h-10 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900/50 px-4 py-2 text-sm font-medium transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-purple-500/10 outline-none"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 px-4">
                <div className="space-y-6 pb-10">


                    {/* Members Toggle Selection */}
                    <div className="space-y-1">
                        <button
                            onClick={() => setIsMembersOpen(!isMembersOpen)}
                            className={cn(
                                "flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all group",
                                isMembersOpen ? "bg-zinc-100 dark:bg-zinc-900/80" : "hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                            )}
                        >
                            <div className="flex flex-col items-start transition-all">
                                <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5" />
                                    Members ({members.length})
                                </span>
                                <span className={cn(
                                    "text-[12px] font-bold transition-all mt-0.5",
                                    isMembersOpen ? "text-purple-600" : "text-zinc-400"
                                )}>
                                    Group • {members.length} members
                                </span>
                            </div>
                            <motion.div
                                animate={{ rotate: isMembersOpen ? 0 : -90 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isMembersOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden space-y-1.5 pt-2"
                                >
                                    {members.map((member: any, i: number) => {
                                        const isOnline = onlineUsers?.has(member.user_id);
                                        const name = member.users?.full_name || member.users?.display_name || member.users?.email?.split('@')[0] || 'Member';
                                        const lastActive = isOnline ? "Active now" : formatLastActive(member.users?.updated_at || member.users?.last_seen);
                                        
                                        return (
                                            <div
                                                key={i}
                                                className="flex items-center gap-4 w-full px-4 py-3 rounded-2xl transition-all hover:bg-white dark:hover:bg-zinc-800/80 cursor-pointer group hover:shadow-sm border border-transparent hover:border-zinc-100 dark:hover:border-white/5"
                                            >
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-950 shadow-sm group-hover:scale-105 transition-transform">
                                                        <AvatarImage src={member.users?.avatar_url} />
                                                        <AvatarFallback className={cn(
                                                            "text-[10px] font-black text-white uppercase",
                                                            getAvatarColor(member.user_id)
                                                        )}>
                                                            {getInitials(name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {isOnline && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white dark:bg-[#0c0c0b] flex items-center justify-center p-0.5">
                                                            <div className="h-full w-full rounded-full bg-emerald-500 ring-2 ring-emerald-500/10" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-[14px] text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-tight">
                                                        {name}
                                                    </p>
                                                    <p className={cn(
                                                        "text-[11px] font-bold truncate mt-0.5",
                                                        isOnline ? "text-emerald-500" : "text-zinc-400"
                                                    )}>
                                                        {lastActive}
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
