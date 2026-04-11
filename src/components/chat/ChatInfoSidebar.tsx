import { motion } from 'framer-motion';
import { X, FileText, Image as ImageIcon, Trash2, Pencil, Bell, Clock, Camera, UserPlus, Search, Star, ChevronRight, Check, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { uploadFile } from '@/lib/fileUpload';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
    const [isMediaVaultOpen, setIsMediaVaultOpen] = useState(false);

    useEffect(() => {
        const loadUserId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        loadUserId();
    }, []);

    const allSharedFiles = useMemo(() => messages
        .filter(msg => msg.attachment_url)
        .map(msg => ({
            name: msg.attachment_name || 'File',
            date: format(new Date(msg.created_at), 'MMM d'),
            size: formatFileSize(msg.attachment_size || 0),
            type: msg.attachment_type || 'file',
            url: msg.attachment_url
        }))
        .reverse()
        , [messages]);

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
        <div className="w-full h-full border-l border-zinc-200/50 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-2xl flex flex-col font-body animate-in slide-in-from-right duration-500">
            {/* Header - Balanced & Neat */}
            <div className="h-[72px] flex items-center px-4 shrink-0 border-b border-zinc-200/50 dark:border-white/5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-10 w-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                    <X className="h-5 w-5 text-zinc-500" />
                </Button>
                <h2 className="ml-2 text-base font-bold text-zinc-900 dark:text-white">Contact Info</h2>
            </div>

            <ScrollArea className="flex-1">
                <div className="space-y-6 pb-20">
                    {/* Centered Identity Section - Premium feel */}
                    <div className="flex flex-col items-center pt-8 px-6 text-center">
                        <div className="relative group mb-6">
                            <div className="h-32 w-32 rounded-full ring-4 ring-white dark:ring-zinc-900 shadow-2xl flex items-center justify-center overflow-hidden relative bg-zinc-100 dark:bg-zinc-800 transition-transform duration-500 group-hover:scale-[1.02]">
                                {localAvatar || projectAvatar ? (
                                    <img src={localAvatar || projectAvatar || ''} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-purple-600 text-white flex items-center justify-center text-4xl font-bold">
                                        {projectTitle.slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="absolute bottom-1 right-1 bg-purple-600 dark:bg-zinc-100 p-2.5 rounded-full shadow-2xl border-4 border-white dark:border-zinc-950 group-hover:scale-110 transition-all">
                                        <Camera className="h-3.5 w-3.5 text-white dark:text-black" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-2 rounded-2xl border-white/20 dark:border-zinc-800 shadow-2xl bg-white/80 dark:bg-black/80 backdrop-blur-xl" side="bottom" align="end">
                                    <label className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer text-sm font-medium transition-colors">
                                        <ImageIcon className="h-4 w-4 text-zinc-500" />
                                        Update group photo
                                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const toastId = toast.loading('Uploading photo...');
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
                            <div className="flex items-center gap-2 mb-2 w-full animate-in fade-in zoom-in-95 duration-200">
                                <Input
                                    value={projectTitle}
                                    onChange={(e) => setProjectTitle(e.target.value)}
                                    className="h-10 text-center font-bold text-lg bg-white/50 dark:bg-black/50 border-zinc-200 dark:border-white/10 rounded-xl"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateTitle();
                                        if (e.key === 'Escape') {
                                            setProjectTitle(initialTitle);
                                            setIsEditing(false);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-2 group/title cursor-pointer p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all" onClick={() => setIsEditing(true)}>
                                <h3 className="font-bold text-xl text-zinc-900 dark:text-white">{projectTitle}</h3>
                                <Pencil className="h-4 w-4 text-zinc-400 opacity-0 group-hover/title:opacity-100 transition-all" />
                            </div>
                        )}
                        <p className="text-sm text-zinc-500 font-medium">
                            Group • {members.length} member{members.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Metadata Section - Detailed & Neatly Aligned as per screenshot */}
                    <div className="px-5">
                        <div className="bg-zinc-50 dark:bg-white/5 rounded-2xl p-5 space-y-4 border border-zinc-200/50 dark:border-white/5">
                            <div className="flex items-center justify-between group cursor-pointer">
                                <p className="text-[13px] font-medium text-zinc-600 dark:text-zinc-400">Add group description</p>
                                <Pencil className="h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                            <div className="pt-4 border-t border-zinc-200/50 dark:border-white/5">
                                <p className="text-[11px] text-zinc-400 uppercase tracking-tight font-bold">
                                    Created by System on {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* List Items - Orderly and Clean */}
                    <div className="px-5 space-y-px">
                        <div className="bg-zinc-50 dark:bg-white/5 rounded-2xl overflow-hidden border border-zinc-200/50 dark:border-white/5">
                            <ListItem
                                icon={ImageIcon}
                                label="Media, links and docs"
                                count={allSharedFiles.length}
                                onClick={() => setIsMediaVaultOpen(true)}
                            />
                            <div className="h-px bg-zinc-200/50 dark:bg-white/5 mx-4" />
                            <ListItem
                                icon={Star}
                                label="Starred messages"
                                onClick={() => { }}
                            />
                            <div className="h-px bg-zinc-200/50 dark:bg-white/5 mx-4" />
                            <ListItem
                                icon={Bell}
                                label="Mute notifications"
                                hasToggle
                                checked={notificationsEnabled}
                                onToggle={setNotificationsEnabled}
                            />
                        </div>
                    </div>

                    {/* Clear Chat Section - Destructive but refined */}
                    <div className="px-5">
                        <div className="bg-rose-50 dark:bg-rose-500/5 rounded-2xl overflow-hidden border border-rose-100 dark:border-rose-500/10">
                            <button
                                onClick={handleClearChat}
                                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-rose-500 hover:text-white transition-all group"
                            >
                                <Trash2 className="h-4 w-4 text-rose-500 group-hover:text-white" />
                                <span className="text-[13px] font-bold text-rose-500 group-hover:text-white">Clear Chat History</span>
                            </button>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Media Vault Sheet - Opens without changing the main sidebar UI */}
            <Sheet open={isMediaVaultOpen} onOpenChange={setIsMediaVaultOpen}>
                <SheetContent className="w-[400px] sm:w-[450px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-l-2 border-zinc-200 dark:border-white/5 p-0 font-body shadow-2xl">
                    <SheetHeader className="px-8 py-8 border-b border-zinc-200/50 dark:border-white/5 bg-zinc-50/50 dark:bg-white/5 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white">
                                <HardDrive className="h-6 w-6" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Media Vault</SheetTitle>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">
                                    {allSharedFiles.length} Shared Fragments
                                </p>
                            </div>
                        </div>
                    </SheetHeader>

                    <ScrollArea className="h-[calc(100vh-104px)]">
                        <div className="p-8 space-y-4">
                            {allSharedFiles.length > 0 ? (
                                allSharedFiles.map((file, i) => (
                                    <button
                                        key={i}
                                        onClick={() => downloadFile(file.url, file.name)}
                                        className="w-full p-5 bg-zinc-50 dark:bg-white/5 rounded-[2rem] border border-zinc-200/50 dark:border-white/5 flex items-center gap-5 hover:scale-[1.02] active:scale-[0.98] transition-all group shadow-sm"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20 group-hover:scale-110 transition-transform">
                                            {file.type.startsWith('image/') ? (
                                                <ImageIcon className="h-7 w-7 text-violet-500" />
                                            ) : (
                                                <FileText className="h-7 w-7 text-violet-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-[14px] font-bold text-zinc-900 dark:text-white truncate group-hover:text-violet-500 transition-colors">{file.name}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{file.size}</span>
                                                <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                                <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{file.date}</span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="h-4 w-4 text-zinc-500" />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-24 h-24 rounded-[3rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                        <HardDrive className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Vault is clear</h4>
                                        <p className="text-sm text-zinc-500 font-medium">No fragments detected in this conversation history.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    );
};

const ListItem = ({ icon: Icon, label, count, onClick, hasToggle, checked, onToggle }: any) => (
    <div
        onClick={onClick}
        className={cn(
            "w-full flex items-center justify-between px-5 py-4 transition-all",
            !hasToggle ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5" : ""
        )}
    >
        <div className="flex items-center gap-4">
            <div className="h-9 w-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 shadow-sm">
                <Icon className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            {count !== undefined && <span className="text-xs font-bold text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800">{count}</span>}
            {!hasToggle && <ChevronRight className="h-4 w-4 text-zinc-300" />}
            {hasToggle && (
                <Switch checked={checked} onCheckedChange={onToggle} />
            )}
        </div>
    </div>
);
