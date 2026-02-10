import { motion } from 'framer-motion';
import { X, FileText, Image as ImageIcon, Trash2, Pencil, Bell, Clock, Camera, UserPlus, Search, Star, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { uploadFile } from '@/lib/fileUpload';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MessageWithSender } from '@/types/database';
import { format } from 'date-fns';
import { formatFileSize, downloadFile } from '@/lib/fileUpload';
import { getAvatarColor } from '@/lib/avatarUtils';

interface ChatInfoSidebarProps {
    onClose: () => void;
    projectTitle: string;
    members: any[];
    messages: MessageWithSender[];
    onClearChat: () => void;
    projectId?: string;
    projectAvatar?: string | null;
    onAvatarUpdate?: (url: string) => void;
}

export const ChatInfoSidebar = ({
    onClose,
    projectTitle: initialTitle,
    members,
    messages,
    onClearChat,
    projectId,
    projectAvatar,
    onAvatarUpdate
}: ChatInfoSidebarProps) => {
    const [projectTitle, setProjectTitle] = useState(initialTitle);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [localAvatar, setLocalAvatar] = useState<string | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        const loadUserId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        loadUserId();
    }, []);

    const sharedFiles = messages
        .filter(msg => msg.attachment_url)
        .map(msg => ({
            name: msg.attachment_name || 'File',
            date: format(new Date(msg.created_at), 'MMM d'),
            size: formatFileSize(msg.attachment_size || 0),
            type: msg.attachment_type || 'file',
            url: msg.attachment_url
        }))
        .reverse()
        .slice(0, 5);

    const handleClearChat = () => {
        if (confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
            onClearChat();
            toast.success('Chat cleared');
        }
    };

    const handleUpdateTitle = async () => {
        if (projectTitle === initialTitle) {
            setIsEditing(false);
            return;
        }

        const toastId = toast.loading('Updating group name...');
        try {
            const { error } = await supabase
                .from('projects')
                .update({ team_name: projectTitle })
                .eq('id', projectId);

            if (error) throw error;
            toast.success('Name updated!', { id: toastId });
            setIsEditing(false);
        } catch (err: any) {
            toast.error('Failed to update name', { id: toastId });
            setProjectTitle(initialTitle);
        }
    };

    return (
        <div className="w-80 h-full border-l border-white/20 dark:border-zinc-800/20 bg-white/40 dark:bg-black/40 backdrop-blur-md flex flex-col font-sans animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="h-16 flex items-center gap-4 px-4 shrink-0 border-b border-white/10 dark:border-zinc-800/10">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                    <X className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                </Button>
                <h2 className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">Contact Info</h2>
            </div>

            <ScrollArea className="flex-1 bg-transparent">
                <div className="space-y-4 pb-20">
                    {/* Centered Identity Section */}
                    <div className="flex flex-col items-center pt-8 pb-6 border-b border-white/10 dark:border-zinc-800/10">
                        <div className="relative group mb-6">
                            <div className="h-32 w-32 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden shadow-2xl relative">
                                {localAvatar || projectAvatar ? (
                                    <img src={localAvatar || projectAvatar || ''} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-zinc-900 text-white flex items-center justify-center text-4xl font-medium">
                                        {projectTitle.slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="absolute bottom-2 right-2 bg-zinc-800 dark:bg-zinc-700 p-2.5 rounded-full shadow-xl border-2 border-white dark:border-zinc-800 group-hover:scale-110 transition-transform">
                                        <Camera className="h-4 w-4 text-white" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-2 rounded-2xl border-white/20 dark:border-zinc-800 shadow-2xl bg-white/80 dark:bg-black/80 backdrop-blur-xl">
                                    <label className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm font-medium">
                                        <ImageIcon className="h-4 w-4" />
                                        Update photo
                                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const toastId = toast.loading('Updating...');
                                                const result = await uploadFile(file, 'chat-files', 'avatars');
                                                const { error } = await supabase.from('projects').update({ avatar_url: result.url }).eq('id', projectId);
                                                if (!error) {
                                                    setLocalAvatar(result.url);
                                                    if (onAvatarUpdate) onAvatarUpdate(result.url);
                                                    toast.success('Updated!', { id: toastId });
                                                }
                                            }
                                        }} />
                                    </label>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {isEditing ? (
                            <div className="flex items-center gap-2 mb-1 mt-4 px-4 w-full animate-in fade-in zoom-in-95 duration-200">
                                <Input
                                    value={projectTitle}
                                    onChange={(e) => setProjectTitle(e.target.value)}
                                    className="h-9 text-center font-semibold text-lg bg-white/50 dark:bg-black/50 border-white/20 dark:border-white/10"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateTitle();
                                        if (e.key === 'Escape') {
                                            setProjectTitle(initialTitle);
                                            setIsEditing(false);
                                        }
                                    }}
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 shrink-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                    onClick={handleUpdateTitle}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 shrink-0 text-zinc-400 hover:text-zinc-500 hover:bg-zinc-500/10"
                                    onClick={() => {
                                        setProjectTitle(initialTitle);
                                        setIsEditing(false);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-1 mt-4 group/title cursor-pointer p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors" onClick={() => setIsEditing(true)}>
                                <h3 className="font-semibold text-xl text-zinc-900 dark:text-zinc-100">{projectTitle}</h3>
                                <Pencil className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover/title:opacity-100 transition-all" />
                            </div>
                        )}
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium">
                            Group • {members.length} members
                        </p>
                    </div>

                    {/* Metadata Section */}
                    <div className="px-4">
                        <div className="bg-white/30 dark:bg-white/5 rounded-xl p-4 space-y-3 border border-white/20 dark:border-white/5">
                            <div className="flex items-center justify-between group cursor-pointer">
                                <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">Add group description</p>
                                <Pencil className="h-3.5 w-3.5 text-zinc-400 opacity-60 group-hover:opacity-100 transition-all" />
                            </div>
                            <p className="text-[11px] text-zinc-400">
                                Created by System on {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="px-4 space-y-px">
                        <div className="bg-white/30 dark:bg-white/5 rounded-xl overflow-hidden border border-white/20 dark:border-white/5">
                            <ListItem
                                icon={ImageIcon}
                                label="Media, links and docs"
                                count={sharedFiles.length}
                                onClick={() => { }}
                            />
                            <div className="h-px bg-white/10 dark:bg-white/5 mx-4" />
                            <ListItem
                                icon={Star}
                                label="Starred messages"
                                onClick={() => { }}
                            />
                            <div className="h-px bg-white/10 dark:bg-white/5 mx-4" />
                            <ListItem
                                icon={Bell}
                                label="Mute notifications"
                                hasToggle
                                onClick={() => { }}
                            />
                        </div>
                    </div>

                    {/* Clear Chat Section */}
                    <div className="px-5">
                        <div className="bg-white/30 dark:bg-white/5 rounded-xl overflow-hidden border border-white/20 dark:border-white/5">
                            <button
                                onClick={handleClearChat}
                                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-rose-500/10 transition-colors group"
                            >
                                <Trash2 className="h-4 w-4 text-rose-500" />
                                <span className="text-[13px] font-medium text-rose-500">Clear Chat History</span>
                            </button>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};

const ListItem = ({ icon: Icon, label, count, onClick, hasToggle }: any) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
    >
        <div className="flex items-center gap-3">
            <div className="h-5 w-5 text-zinc-400 dark:text-zinc-500 flex items-center justify-center">
                <Icon className="h-4 w-4" />
            </div>
            <span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {count !== undefined && <span className="text-xs font-medium text-zinc-400">{count}</span>}
            {!hasToggle && <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />}
            {hasToggle && (
                <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full relative">
                    <div className="absolute left-1 top-1 h-2 w-2 bg-white rounded-full shadow-sm" />
                </div>
            )}
        </div>
    </button>
);
