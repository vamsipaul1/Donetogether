import { Bell, Check, Trash2, X, Sparkles } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import { AppNotification } from '@/hooks/useNotifications';

interface NotificationDropdownProps {
    notifications: AppNotification[];
    unreadCount: number;
    onMarkAllAsRead: () => void;
}

const NotificationDropdown = ({ notifications, unreadCount, onMarkAllAsRead }: NotificationDropdownProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="relative group cursor-pointer outline-none">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-white/5 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
                    >
                        <Bell className="w-[18px] h-[18px]" strokeWidth={2.2} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-black rounded-full text-[9px] font-black text-white flex items-center justify-center animate-in fade-in zoom-in duration-300">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </motion.div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 md:w-80 rounded-2xl p-0 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden font-sans z-[100]"
                sideOffset={12}
            >
                <div className="px-5 py-5 flex items-center justify-between border-b border-zinc-50 dark:border-white/5">
                    <div>
                        <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Notifications</h3>
                        <p className="text-[12px] text-zinc-500 mt-0.5">{unreadCount} unread alerts</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMarkAllAsRead}
                            className="h-8 px-3 rounded-lg text-[12px] font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all underline underline-offset-4"
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto scrollbar-hide py-1">
                    {notifications.length > 0 ? (
                        notifications.slice(0, 10).map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "px-5 py-4 flex items-start gap-4 transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.02] cursor-pointer group",
                                    !notification.read && "bg-zinc-50/50 dark:bg-white/[0.01]"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all",
                                    notification.read
                                        ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-400"
                                        : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600"
                                )}>
                                    <Sparkles className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={cn(
                                            "text-[13.5px] tracking-tight truncate",
                                            notification.read ? "text-zinc-500 font-normal" : "text-zinc-900 dark:text-zinc-100 font-semibold"
                                        )}>
                                            {notification.title}
                                        </p>
                                        {!notification.read && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                                    </div>
                                    <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-[1.4] mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-[11px] text-zinc-400 mt-2.5">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 flex flex-col items-center justify-center text-center opacity-60">
                            <div className="flex items-center justify-center mb-5">
                                <Bell className="w-8 h-8 text-zinc-300" strokeWidth={1.5} />
                            </div>
                            <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">All caught up!</p>
                            <p className="text-[13px] text-zinc-500 mt-1 max-w-[200px]">You have no new notifications at this time.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-zinc-50 dark:border-white/5">
                    <Button
                        variant="ghost"
                        className="w-full h-11 rounded-xl text-[13px] font-semibold text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-all bg-zinc-50 dark:bg-white/5"
                        onClick={() => { }}
                    >
                        View full activity
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
