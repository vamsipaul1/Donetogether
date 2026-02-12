import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, FileText, Calendar, ExternalLink, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import type { TaskProof, Task, User, ProjectMember } from '@/types/database';
import { toast } from 'sonner';
import ProofReviewList from './ProofReviewList';

interface ProofOfWorkViewProps {
    projectId: string;
    currentUser: User;
    members: (ProjectMember & { users?: User })[];
    isOwner: boolean; // Or can_verify_tasks
}

interface MyProofWithDetails extends TaskProof {
    task?: Task;
}

const ProofOfWorkView = ({ projectId, currentUser, members, isOwner }: ProofOfWorkViewProps) => {
    // Determine if user is a verifier
    const currentMember = members.find(m => m.user_id === currentUser.id);
    const canVerify = isOwner || currentMember?.can_verify_tasks;

    const [activeTab, setActiveTab] = useState<'reviews' | 'my_proofs'>('reviews');

    // If regular member, default to 'my_proofs' and maybe hide 'reviews' if they have absolutely no business seeing it.
    // However, the component will handle the view content.

    useEffect(() => {
        if (!canVerify) {
            setActiveTab('my_proofs');
        }
    }, [canVerify]);

    return (
        <div className="h-full bg-white dark:bg-black font-sans flex flex-col">
            {/* Header / Tabs */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-[18px] font-bold text-zinc-900 dark:text-white">Proof of Work</h2>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                            {canVerify ? 'Review & Manage Submissions' : 'Track your submissions'}
                        </p>
                    </div>
                </div>

                {canVerify && (
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-full md:w-auto">
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'reviews'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-900'
                                }`}
                        >
                            Pending Reviews
                        </button>
                        <button
                            onClick={() => setActiveTab('my_proofs')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'my_proofs'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-900'
                                }`}
                        >
                            My History
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'reviews' && canVerify ? (
                    <ProofReviewList projectId={projectId} />
                ) : (
                    <MyProofsList projectId={projectId} userId={currentUser.id} />
                )}
            </div>
        </div>
    );
};

// Sub-component for Member's Own Proofs
const MyProofsList = ({ projectId, userId }: { projectId: string; userId: string }) => {
    const [proofs, setProofs] = useState<MyProofWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyProofs = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('task_proofs')
                    .select(`
                        *,
                        task:tasks(*)
                    `)
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Client-side filter for project if needed (though user_id might span projects)
                // Ideally we filter by project too.
                // Since tasks table is joined, we can check task.project_id
                const projectProofs = data?.filter((p: any) => p.task?.project_id === projectId) || [];
                setProofs(projectProofs);
            } catch (err) {
                console.error("Error fetching my proofs:", err);
            } finally {
                setLoading(false);
            }
        };

        if (projectId && userId) {
            fetchMyProofs();
        }
    }, [projectId, userId]);

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading your history...</div>;

    if (proofs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-500">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <HistoryIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No Submissions Yet</h3>
                <p className="text-sm max-w-xs mx-auto mt-2">You haven't submitted any proofs for this project.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-6 space-y-4">
            {proofs.map(proof => (
                <div key={proof.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${proof.status === 'approved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500' :
                            proof.status === 'rejected' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500' :
                                'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500'
                            }`}>
                            {proof.status === 'approved' ? <CheckCircle2 className="w-5 h-5" /> :
                                proof.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                                    <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{proof.task?.title || 'Unknown Task'}</h4>
                            <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {new Date(proof.created_at).toLocaleDateString()}
                                <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                                <span className={`font-bold uppercase ${proof.status === 'approved' ? 'text-emerald-500' :
                                    proof.status === 'rejected' ? 'text-rose-500' :
                                        'text-amber-500'
                                    }`}>{proof.status}</span>
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const HistoryIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path d="M3 3v9h9" /><path d="M12 7v5l4 2" /></svg>
);

export default ProofOfWorkView;
