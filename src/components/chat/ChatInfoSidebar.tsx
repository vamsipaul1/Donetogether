import { X, FileText, Image as ImageIcon, Video, Star, Trash2, Ban, Phone, Video as VideoCall, MessageSquare, Pencil, Check, Bell, Shield, Users, Clock, Flame, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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

    // Extract shared files
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
        <div className="w-80 h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col font-sans animate-in slide-in-from-right duration-300">
            {/* Header - Simple & Clean */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-100 dark:border-zinc-800/50 shrink-0">
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Group Info</span>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <X className="h-4 w-4 text-zinc-400" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                    {/* Identity Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group mb-4">
                            <div className="h-24 w-24 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300 hover:border-emerald-500/30">
                                {localAvatar || projectAvatar ? (
                                    <img src={localAvatar || projectAvatar || ''} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
                                        {projectTitle.slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="absolute -bottom-1 -right-1 bg-zinc-900 dark:bg-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-zinc-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95">
                                        <Pencil className="h-3.5 w-3.5 text-white dark:text-zinc-900" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent side="bottom" align="center" className="w-64 p-4 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold text-zinc-500 text-center">Change group photo</p>
                                        <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs cursor-pointer hover:opacity-90 transition-all">
                                            <ImageIcon className="h-4 w-4" />
                                            Upload Image
                                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const toastId = toast.loading('Uploading...');
                                                    const result = await uploadFile(file, 'chat-files', 'avatars');
                                                    const { error } = await supabase.from('projects').update({ avatar_url: result.url }).eq('id', projectId);
                                                    if (!error) {
                                                        setLocalAvatar(result.url);
                                                        if (onAvatarUpdate) onAvatarUpdate(result.url);
                                                        toast.success('Updated!', { id: toastId });
                                                    } else {
                                                        toast.error('DB update failed');
                                                    }
                                                }
                                            }} />
                                        </label>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {isEditing ? (
                            <div className="w-full space-y-2 animate-in fade-in duration-200">
                                <Input
                                    value={projectTitle}
                                    onChange={(e) => setProjectTitle(e.target.value)}
                                    className="h-10 text-center font-bold text-base rounded-xl border-zinc-200 dark:border-zinc-800"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                                />
                                <div className="flex gap-2 justify-center">
                                    <Button size="sm" className="rounded-lg px-4 h-8 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs" onClick={handleUpdateTitle}>Save</Button>
                                    <Button size="sm" variant="ghost" className="rounded-lg px-4 h-8 font-bold text-xs" onClick={() => { setIsEditing(false); setProjectTitle(initialTitle); }}>Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center group cursor-pointer w-full" onClick={() => setIsEditing(true)}>
                                <div className="flex items-center justify-center gap-1.5">
                                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 truncate max-w-[220px]">{projectTitle}</h3>
                                    <Pencil className="h-3.5 w-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                                <p className="text-[10px] font-semibold text-emerald-500 mt-0.5 tracking-wide">Team Workspace</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex justify-center gap-6 mt-6">
                        {[
                            { icon: Phone, label: 'Call', color: 'hover:bg-blue-500/10 hover:text-blue-600' },
                            { icon: VideoCall, label: 'Video', color: 'hover:bg-emerald-500/10 hover:text-emerald-600' },
                            { icon: MessageSquare, label: 'Search', color: 'hover:bg-purple-500/10 hover:text-purple-600' }
                        ].map((action, i) => (
                            <button key={i} className={cn(
                                "flex flex-col items-center justify-center gap-1.5 p-3 w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-110 active:scale-95 group",
                                action.color
                            )} onClick={() => toast.info(`${action.label} feature coming soon!`)}>
                                <action.icon className="h-4.5 w-4.5 text-zinc-400 group-hover:text-current" />
                                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-current uppercase tracking-tight">{action.label}</span>
                            </button>
                        ))}
                    </div>

                    <Separator className="bg-zinc-100 dark:bg-zinc-900" />

                    {/* Shared Files */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Shared Files</h4>
                            <span className="text-[10px] font-bold text-zinc-400">{sharedFiles.length}</span>
                        </div>
                        <div className="space-y-1.5">
                            {sharedFiles.length > 0 ? (
                                sharedFiles.map((file, i) => (
                                    <div
                                        key={i}
                                        onClick={() => file.url && downloadFile(file.url, file.name)}
                                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 group cursor-pointer transition-colors"
                                    >
                                        <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                                            {file.type.includes('image') ? <ImageIcon className="h-4 w-4 text-zinc-500" /> : <FileText className="h-4 w-4 text-zinc-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{file.name}</p>
                                            <p className="text-[10px] text-zinc-400 font-medium">{file.date} • {file.size}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-zinc-400 text-center py-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">No files shared yet</p>
                            )}
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">Settings</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">Notifications</span>
                                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                            </div>
                            <button
                                onClick={handleClearChat}
                                className="flex items-center gap-2 w-full p-3 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear chat history
                            </button>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="space-y-4 pb-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Members</h4>
                            <span className="text-[10px] font-bold text-zinc-400">{members.length}</span>
                        </div>
                        <div className="space-y-1">
                            {members.slice(0, 5).map((member, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={member.users?.avatar_url || member.avatar_url} />
                                            <AvatarFallback className={cn("rounded-lg font-bold text-[10px] text-white", getAvatarColor(member.user_id || `u-${i}`))}>
                                                {(member.users?.display_name || member.users?.email || 'A').slice(0, 1).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{member.users?.display_name || member.users?.email?.split('@')[0]}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase opacity-0 group-hover:opacity-100 transition-opacity">{i === 0 ? 'Admin' : 'Member'}</span>
                                </div>
                            ))}
                            {members.length > 5 && (
                                <button className="w-full py-2 text-[10px] font-bold text-zinc-400 hover:text-emerald-500 transition-colors">
                                    Show {members.length - 5} more
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};
