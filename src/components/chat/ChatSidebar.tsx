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
}

export const ChatSidebar = ({ className, projectId, members = [] }: ChatSidebarProps) => {

    return (
        <div className={cn("flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black w-80 font-sans", className)}>
            <div className="p-4 pt-6">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">Team Chat</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 uppercase tracking-wider">{members.length} Members</span>
                </div>

                <div className="relative mb-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                        placeholder="Search members or messages..."
                        className="w-full pl-9 h-10 rounded-xl border-none bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-sm font-medium shadow-none transition-all placeholder:text-zinc-400 focus-visible:outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-emerald-500/20"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="space-y-6 pb-4">
                    {/* Main Group Item */}
                    <div>
                        <div className="flex items-center justify-between px-3 mb-2">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Channel</span>
                        </div>
                        <button
                            className={cn(
                                "flex items-center justify-between w-full p-3 text-left rounded-xl transition-all group bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transform hover:scale-[1.02] active:scale-95 duration-200"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[14px]">General</span>
                                    <span className="text-[11px] opacity-80 font-medium">Project Team</span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 opacity-50" />
                        </button>
                    </div>

                    {/* Members Section */}
                    <div>
                        <div className="flex items-center justify-between px-3 mb-2">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Project Squad</span>
                        </div>
                        <div className="space-y-1">
                            {members.map((member: any, i: number) => {
                                const isOnline = i % 3 === 0;
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer group"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-9 w-9 shadow-md ring-2 ring-white dark:ring-black group-hover:scale-105 transition-transform">
                                                {member.users?.avatar_url && <AvatarImage src={member.users.avatar_url} />}
                                                <AvatarFallback className={cn(
                                                    "text-[10px] font-black text-white shadow-inner",
                                                    getAvatarColor(member.user_id || member.users?.id || `user-${i}`)
                                                )}>
                                                    {getInitials(member.users?.display_name || member.users?.email || '?')}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isOnline && (
                                                <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-emerald-500 text-emerald-500 dark:ring-black" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                                {member.users?.display_name || member.users?.email?.split('@')[0] || 'Team Member'}
                                            </p>
                                            <p className="text-[11px] font-medium text-zinc-500 flex items-center gap-1">
                                                {isOnline ? (
                                                    <>
                                                        <Circle className="h-1.5 w-1.5 fill-emerald-500 text-emerald-500 animate-pulse" />
                                                        <span className="text-emerald-600 dark:text-emerald-500">Online</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Circle className="h-1.5 w-1.5 fill-zinc-400 text-zinc-400" />
                                                        <span>Last seen recently</span>
                                                    </>
                                                )}
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
