import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'message' | 'task' | 'project' | 'system';
    created_at: string;
    read: boolean;
    project_id?: string;
    link?: string;
}

export const useNotifications = (userId: string | undefined) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        // Request Browser Notification Permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // 1. LISTEN FOR NEW MESSAGES (Group Chat)
        const messageSubscription = supabase
            .channel('global-messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
            }, (payload) => {
                const message = payload.new;
                if (message.sender_id !== userId) {
                    addInAppNotification({
                        title: 'New Message',
                        message: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
                        type: 'message',
                        link: `/messages/${message.project_id}`
                    });
                }
            })
            .subscribe();

        // 2. LISTEN FOR TASK ASSIGNMENTS/UPDATES
        const taskSubscription = supabase
            .channel('global-tasks')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'tasks',
                filter: `assigned_to=eq.${userId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    addInAppNotification({
                        title: 'New Task Assigned',
                        message: payload.new.title,
                        type: 'task',
                        link: '/project-room'
                    });
                } else if (payload.eventType === 'UPDATE' && payload.new.status === 'completed' && payload.old.status !== 'completed') {
                    addInAppNotification({
                        title: 'Task Completed',
                        message: `Congrats! ${payload.new.title} is done.`,
                        type: 'task',
                        link: '/project-room'
                    });
                }
            })
            .subscribe();

        // 3. LISTEN FOR PROJECT CREATION
        const projectSubscription = supabase
            .channel('global-projects')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'projects',
            }, (payload) => {
                // Since project creation is rare and usually current user knows it,
                // we only notify for others if there's a join system, but user specifically asked for "project creation" notification.
                if (payload.new.created_by !== userId) {
                    addInAppNotification({
                        title: 'New Project Live',
                        message: `Project "${payload.new.title}" has been started.`,
                        type: 'project',
                        link: '/project-room'
                    });
                }
            })
            .subscribe();

        return () => {
            messageSubscription.unsubscribe();
            taskSubscription.unsubscribe();
            projectSubscription.unsubscribe();
        };
    }, [userId]);

    const addInAppNotification = (notif: Omit<AppNotification, 'id' | 'created_at' | 'read'>) => {
        const newNotif: AppNotification = {
            ...notif,
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            read: false
        };

        setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Keep last 10
        setUnreadCount(prev => prev + 1);

        // Show Browser Notification if permitted
        if (Notification.permission === 'granted' && document.hidden) {
            new Notification(newNotif.title, { body: newNotif.message });
        }

        // Toast feedback
        toast(newNotif.title, {
            description: newNotif.message,
            action: newNotif.link ? {
                label: 'View',
                onClick: () => window.location.href = newNotif.link!
            } : undefined
        });
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return { notifications, unreadCount, markAllAsRead };
};
