import { ChatLayout } from '@/components/chat/ChatLayout';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import ProofReviewList from './ProofReviewList';
import { MessageSquare, ShieldCheck } from 'lucide-react';

interface InboxViewProps {
    projectId?: string;
    members?: any[];
    currentUserId?: string;
    onlineUsers?: Set<string>;
}

const InboxView = ({ projectId, members = [], currentUserId, onlineUsers }: InboxViewProps) => {
    // If we're passed a projectId (e.g. from Dashboard), use it.
    // Otherwise could potentially fetch last used project.

    // We also need the project title for the header
    const [projectTitle, setProjectTitle] = useState("Project Team");
    const [activeTab, setActiveTab] = useState<'chat' | 'approvals'>('chat');

    useEffect(() => {
        if (projectId) {
            const fetchTitle = async () => {
                const { data } = await supabase.from('projects').select('title, team_name').eq('id', projectId).single();
                if (data) {
                    setProjectTitle(data.team_name || data.title);
                }
            };
            fetchTitle();
        }
    }, [projectId]);

    const currentUserMember = members.find((m: any) => m.user_id === currentUserId);
    const canVerify = currentUserMember?.role === 'owner' || currentUserMember?.can_verify_tasks;

    if (!projectId) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-black font-sans">
                <h2 className="text-xl font-bold mb-2">Select a Project</h2>
                <p className="text-zinc-500">Please select a project from the sidebar to view its team inbox.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-white dark:bg-black flex flex-col">
            {/* Inbox Tabs Header */}
            <div className={`h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-4 shrink-0 shadow-sm z-10 ${!canVerify ? 'hidden' : ''}`}>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`
                        h-full flex items-center gap-2 text-sm font-bold border-b-2 transition-colors px-2
                        ${activeTab === 'chat'
                            ? 'border-emerald-500 text-zinc-900 dark:text-white'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }
                    `}
                >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`
                        h-full flex items-center gap-2 text-sm font-bold border-b-2 transition-colors px-2
                        ${activeTab === 'approvals'
                            ? 'border-emerald-500 text-zinc-900 dark:text-white'
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }
                    `}
                >
                    <ShieldCheck className="w-4 h-4" />
                    Approvals
                </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'chat' ? (
                    <div className="absolute inset-0">
                        <ChatLayout
                            projectId={projectId!}
                            members={members}
                            projectTitle={projectTitle}
                            onlineUsers={onlineUsers}
                        />
                    </div>
                ) : (
                    <ProofReviewList projectId={projectId} />
                )}
            </div>
        </div>
    );
};

export default InboxView;
