import { X, FileText, Image as ImageIcon, Video, Star, Trash2, Ban, Phone, Video as VideoCall, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface ChatInfoSidebarProps {
    onClose: () => void;
    projectTitle: string;
    members: any[];
}

export const ChatInfoSidebar = ({ onClose, projectTitle, members }: ChatInfoSidebarProps) => {
    // Mock files for UI demo
    const sharedFiles = [
        { name: 'Project_Proposal.pdf', date: '12 Aug 2025', size: '2.4 MB', type: 'pdf' },
        { name: 'Design_System_v2.fig', date: '14 Aug 2025', size: '15 MB', type: 'fig' },
        { name: 'Team_Photo.jpg', date: '15 Aug 2025', size: '4.2 MB', type: 'img' },
    ];

    return (
        <div className="w-80 h-full border-l border-border bg-white dark:bg-black flex flex-col font-sans animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b">
                <span className="font-bold text-sm">Chat Info</span>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-zinc-400 hover:text-zinc-600">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="flex flex-col items-center p-6 text-center">
                    <Avatar className="h-24 w-24 mb-4 shadow-xl ring-4 ring-zinc-50 dark:ring-zinc-900">
                        <AvatarFallback className="bg-emerald-100 text-emerald-600 text-2xl font-bold">
                            {projectTitle.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{projectTitle}</h3>
                    <p className="text-xs text-emerald-500 font-medium mt-1">Active Project Team</p>

                    <div className="flex items-center gap-2 mt-6">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-zinc-200 hover:bg-zinc-100 hover:text-emerald-600">
                            <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-zinc-200 hover:bg-zinc-100 hover:text-emerald-600">
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-zinc-200 hover:bg-zinc-100 hover:text-emerald-600">
                            <VideoCall className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Separator />

                <div className="p-4 space-y-6">
                    {/* Shared Files Section */}
                    <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Shared files</h4>
                        <div className="space-y-3">
                            {sharedFiles.map((file, i) => (
                                <div key={i} className="flex items-center gap-3 group cursor-pointer p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                    <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-500 group-hover:text-emerald-500 transition-colors">
                                        {file.type === 'pdf' ? <FileText className="h-5 w-5" /> :
                                            file.type === 'img' ? <ImageIcon className="h-5 w-5" /> :
                                                <Star className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium truncate text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600">{file.name}</p>
                                        <p className="text-[10px] text-zinc-400">{file.date} • {file.size}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Settings Section */}
                    <div>
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Options</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">Add to Favourites</div>
                                <Switch />
                            </div>
                            <button className="flex items-center gap-3 text-sm font-medium text-zinc-500 hover:text-red-500 w-full transition-colors">
                                <Trash2 className="h-4 w-4" />
                                Delete chat history
                            </button>
                            <button className="flex items-center gap-3 text-sm font-medium text-zinc-500 hover:text-red-500 w-full transition-colors">
                                <Ban className="h-4 w-4" />
                                Block notifications
                            </button>
                        </div>
                    </div>
                </div>

                {/* Members List Mini */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 mt-4 mx-4 rounded-xl">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex justify-between">
                        Members <span className="text-emerald-500">{members.length}</span>
                    </h4>
                    <div className="flex -space-x-2 overflow-hidden py-1">
                        {members.slice(0, 5).map((m, i) => (
                            <Avatar key={i} className="h-8 w-8 border-2 border-white dark:border-zinc-900 ring-1 ring-zinc-200">
                                <AvatarFallback className="text-[9px] font-bold bg-white text-zinc-600">
                                    {m.users?.email?.[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {members.length > 5 && (
                            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold border-2 border-white text-zinc-500">
                                +{members.length - 5}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};
