import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatSidebarProps {
    className?: string;
    projectId?: string;
}

export const ChatSidebar = ({ className, projectId }: ChatSidebarProps) => {
    // For now, we only have one main "General" room per project support.
    // In future, we can fetch real rooms from the DB.

    return (
        <div className={cn("flex flex-col h-full border-r bg-muted/10 w-80", className)}>
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search chats..."
                        className="w-full pl-9 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    <button
                        className={cn(
                            "flex items-center gap-3 w-full p-3 text-left rounded-lg hover:bg-muted/50 transition-colors bg-muted"
                        )}
                    >
                        <Avatar className="h-10 w-10">
                            <AvatarFallback>GE</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="font-medium text-sm truncate">General</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                                Team Chat
                            </p>
                        </div>
                    </button>
                    {/* Placeholder for future rooms */}

                </div>
            </ScrollArea>
        </div>
    );
};
