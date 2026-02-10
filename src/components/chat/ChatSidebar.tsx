import { Search, MessageSquare, Users, Circle, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getAvatarColor, getInitials } from '@/lib/avatarUtils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ChatSidebarProps {
    className?: string;
    projectId?: string;
    members?: any[];
    projectAvatar?: string | null;
}

export const ChatSidebar = ({ className, projectId, members = [], projectAvatar }: ChatSidebarProps) => {

    return (
        <div className={cn("flex flex-col h-full bg-transparent w-80 font-sans", className)}>
            <div className="p-4 pt-6">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight">Team Chat</h2>
                </div>

                <div className="relative mb-4 group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-zinc-800 dark:text-zinc-400 transition-colors" />
                    <input
                        placeholder="Search or start new chat"
                        className="w-full pl-10 h-10 rounded-[10px] border border-white/30 dark:border-zinc-700/30 bg-white/50 dark:bg-black/50 px-3 py-1 text-sm font-medium shadow-sm transition-all placeholder:text-zinc-500/70 focus-visible:outline-none focus:bg-white/80 dark:focus:bg-black/80 focus:border-zinc-300 dark:focus:border-zinc-700 backdrop-blur-sm"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 px-2">
                <div className="space-y-6 pb-4">
                    {/* Main Group Item */}
                    <div>
                        {/* <div className="flex items-center justify-between px-3 mb-2">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Channels</span>
                        </div> */}
                        <button
                            className={cn(
                                "flex items-center justify-between w-full p-3 text-left rounded-lg transition-all group bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 shadow-sm backdrop-blur-md"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 text-white shadow-md">
                                    {projectAvatar ? (
                                        <img src={projectAvatar} alt="" className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <Users className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[15px] text-zinc-900 dark:text-white">General</span>
                                    <span className="text-[12px] text-zinc-600 dark:text-zinc-400 font-medium">Project Team Chat</span>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Members Section */}
                    <div>
                        <div className="flex items-center justify-between px-4 mb-3 mt-4">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Members ({members.length})</span>
                        </div>
                        <div className="space-y-0.5">
                            {members.map((member: any, i: number) => {
                                const isOnline = i % 3 === 0;
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-all hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer group border border-transparent hover:border-white/20"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 shadow-md ring-2 ring-white/50 dark:ring-zinc-800/50 transition-transform duration-300">
                                                {/* {member.users?.avatar_url && <AvatarImage src={member.users.avatar_url} />} */}
                                                <AvatarFallback className={cn(
                                                    "text-[12px] font-bold text-white bg-gradient-to-tr",
                                                    i % 4 === 0 ? "from-pink-500 to-rose-500" :
                                                        i % 4 === 1 ? "from-indigo-500 to-purple-500" :
                                                            i % 4 === 2 ? "from-cyan-500 to-blue-500" :
                                                                "from-emerald-500 to-teal-500"
                                                )}>
                                                    {getInitials(member.users?.full_name || member.users?.display_name || member.users?.email || '?')}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isOnline && (
                                                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white dark:bg-black flex items-center justify-center shadow-sm">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center h-10 border-b border-zinc-200/30 dark:border-zinc-700/30 group-hover:border-transparent pb-3 mb-[-12px]">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-[14px] text-zinc-900 dark:text-zinc-100 truncate">
                                                    {member.users?.full_name || member.users?.display_name || member.users?.email?.split('@')[0] || 'Team Member'}
                                                </p>
                                            </div>
                                            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                                                {isOnline ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};
