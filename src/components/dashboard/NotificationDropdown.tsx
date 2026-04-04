import { Bell, Check, MessageSquare, Target, Settings, Zap, MoreHorizontal, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/hooks/useNotifications';

interface NotificationDropdownProps {
    notifications: AppNotification[];
    unreadCount: number;
    onMarkAllAsRead: () => void;
}

const NotificationDropdown = ({ notifications, unreadCount, onMarkAllAsRead }: NotificationDropdownProps) => {
    return (
        <Popover onOpenChange={(open) => { if (open && unreadCount > 0) onMarkAllAsRead(); }}>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-10 w-10 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 transition-all group outline-none ring-0 focus-visible:ring-0"
                >
                    <Bell className={cn(
                        "h-[18px] w-[18px] text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors",
                        unreadCount > 0 && "animate-none"
                    )} strokeWidth={2} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-red-500 rounded-full ring-[2px] ring-[#fafafa] dark:ring-[#0b0c10] z-20" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0 rounded-[32px] border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden font-body" align="end" sideOffset={12}>
                <div className="p-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-black">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">Notifications</h3>
                            <p className="text-[12px] font-medium text-zinc-500 mt-0.5">{unreadCount === 0 ? 'No new updates' : `${unreadCount} unread alerts`}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                        <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                    </Button>
                </div>

                <ScrollArea className="h-[420px]">
                    {notifications.length > 0 ? (
                        <div className="p-3 space-y-1">
                            {notifications.map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => { if (notif.link) window.location.href = notif.link; }}
                                    className={cn(
                                        "w-full flex items-start gap-4 p-4 rounded-[20px] transition-all group relative overflow-hidden",
                                        notif.read ? "hover:bg-zinc-100 dark:hover:bg-white/5" : "bg-zinc-100/50 dark:bg-white/5"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl shrink-0 flex items-center justify-center border transition-all duration-300 shadow-sm",
                                        notif.type === 'message' && "bg-blue-500/10 border-blue-500/20 text-blue-500",
                                        notif.type === 'task' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                                        notif.type === 'project' && "bg-amber-500/10 border-amber-500/20 text-amber-500",
                                        notif.type === 'system' && "bg-zinc-900 dark:bg-white text-white dark:text-black"
                                    )}>
                                        {notif.type === 'message' && <MessageSquare className="h-4 w-4" />}
                                        {notif.type === 'task' && <Zap className="h-4 w-4" />}
                                        {notif.type === 'project' && <Target className="h-4 w-4" />}
                                        {notif.type === 'system' && <Settings className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-[14px] font-bold text-zinc-900 dark:text-white truncate leading-tight mb-1">{notif.title}</h4>
                                            {!notif.read && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] shrink-0 mt-1" />}
                                        </div>
                                        <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 leading-tight line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <span className="text-[11px] font-medium text-zinc-400 mt-2 block">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 px-10 text-center">
                            <div className="h-16 w-16 rounded-[22px] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-inner mb-6">
                                <Bell className="h-6 w-6 text-zinc-300 dark:text-zinc-700" />
                            </div>
                            <h4 className="text-[15px] font-bold text-zinc-900 dark:text-white mb-2">No new updates</h4>
                            <p className="text-[13px] font-medium text-zinc-500 leading-relaxed max-w-[240px]">
                                You've seen all your latest activity. We'll let you know when something new pops up.
                            </p>
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 bg-zinc-50 dark:bg-white/5 border-t border-zinc-100 dark:border-white/5">
                    <Button variant="ghost" className="w-full rounded-xl h-10 font-bold text-[13px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">
                        View all activity
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationDropdown;
