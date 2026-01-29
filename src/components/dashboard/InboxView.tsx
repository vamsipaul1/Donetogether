import { ChatLayout } from '@/components/chat/ChatLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface InboxViewProps {
    projectId?: string;
    members?: any[];
}

const InboxView = ({ projectId, members }: InboxViewProps) => {
    // If we're passed a projectId (e.g. from Dashboard), use it.
    // Otherwise could potentially fetch last used project.

    // We also need the project title for the header
    const [projectTitle, setProjectTitle] = useState("Project Team");

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

    if (!projectId) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-black font-sans">
                <h2 className="text-xl font-bold mb-2">Select a Project</h2>
                <p className="text-zinc-500">Please select a project from the sidebar to view its team chat.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-white dark:bg-black p-4">
            <ChatLayout
                projectId={projectId}
                members={members}
                projectTitle={projectTitle}
            />
        </div>
    );
};

export default InboxView;
