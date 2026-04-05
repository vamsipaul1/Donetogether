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
                className="w-80 md:w-96 rounded-2xl p-0 bg-white dark:bg-black border-zinc-100 dark:border-white/10 shadow-2xl overflow-hidden font-sans z-[100]"
                sideOffset={12}
            >
                <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
                    <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight">NOTIFICATIONS</h3>
                        <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-0.5">{unreadCount} Unread Alerts</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMarkAllAsRead}
                            className="h-7 px-2.5 rounded-lg text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 tracking-wider transition-all"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-[70vh] overflow-y-auto scrollbar-hide py-2">
                    {notifications.length > 0 ? (
                        notifications.slice(0, 10).map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "px-5 py-3.5 flex items-start gap-4 transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.03] cursor-pointer group",
                                    !notification.read && "bg-emerald-50/20 dark:bg-emerald-500/[0.02]"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all",
                                    notification.read
                                        ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-400"
                                        : "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800 text-emerald-600"
                                )}>
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={cn(
                                            "text-[13px] tracking-tight truncate",
                                            notification.read ? "text-zinc-500 font-medium" : "text-zinc-900 dark:text-zinc-100 font-bold"
                                        )}>
                                            {notification.title}
                                        </p>
                                        {!notification.read && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                                    </div>
                                    <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-wide">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-12 h-12 rounded-full border border-dashed border-zinc-400 flex items-center justify-center mb-4">
                                <Bell className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.2em]">All Caught Up!</p>
                            <p className="text-[10px] font-bold mt-1 max-w-[160px]">You have no new notifications at this time.</p>
                        </div>
                    )}
                </div>

                <div className="p-3 bg-zinc-50/50 dark:bg-white/[0.02] border-t border-zinc-100 dark:border-white/5">
                    <Button
                        variant="ghost"
                        className="w-full h-10 rounded-xl text-[11px] font-black uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white tracking-widest transition-all"
                        onClick={() => { }}
                    >
                        View Full Activity
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationDropdown;
