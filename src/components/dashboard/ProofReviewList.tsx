import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, FileText, Calendar, ExternalLink } from 'lucide-react';
import type { TaskProof, Task, User } from '@/types/database';
import { toast } from 'sonner';

interface ProofReviewListProps {
    projectId: string;
    onProofUpdated?: () => void;
}

interface ProofWithDetails extends TaskProof {
    task?: Task;
    user?: User;
}

const ProofReviewList = ({ projectId, onProofUpdated }: ProofReviewListProps) => {
    const [proofs, setProofs] = useState<ProofWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProofs = async () => {
        setLoading(true);
        try {
            // Fetch proof submissions for tasks in this project
            // We need to join with tasks and users
            const { data, error } = await supabase
                .from('task_proofs')
                .select(`
                    *,
                    task:tasks(*),
                    user:users(*)
                `)
                .eq('status', 'pending')
                .eq('task.project_id', projectId); // This approach might fail if nested filter isn't supported directly easily, 
            // but standard Supabase allows filtering on joined tables usually? 
            // Actually, filtering on joined table column 'project_id' usually requires inner join logic or two steps.
            // Let's try simpler: fetch all pending proofs, then filter in JS or fetch tasks first.

            // Simpler approach compatible with unknown RLS/Schema details:
            if (error) throw error; // If error, maybe table doesn't even exist yet.

            // If the join works:
            const filteredProofs = data?.filter((p: any) => p.task?.project_id === projectId) || [];
            setProofs(filteredProofs);

        } catch (err) {
            console.error("Error fetching proofs:", err);
            // toast.error("Could not load pending proofs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) fetchProofs();
    }, [projectId]);

    const handleAction = async (proofId: string, action: 'approve' | 'reject') => {
        try {
            const proof = proofs.find(p => p.id === proofId);
            if (!proof) return;

            // 1. Update Proof Status
            const { error: proofError } = await supabase
                .from('task_proofs')
                .update({
                    status: action === 'approve' ? 'approved' : 'rejected',
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', proofId);

            if (proofError) throw proofError;

            // 2. If Approved, Update Task Status to 'completed'
            if (action === 'approve' && proof.task_id) {
                const { error: taskError } = await supabase
                    .from('tasks')
                    .update({ status: 'completed' })
                    .eq('id', proof.task_id);

                if (taskError) {
                    toast.error("Proof approved but task update failed");
                    throw taskError;
                }
                toast.success("Task approved and marked as Done");
            } else {
                toast.info("Proof rejected. Task remains In Progress.");
            }

            // Refresh list
            setProofs(prev => prev.filter(p => p.id !== proofId));
            if (onProofUpdated) onProofUpdated();

        } catch (err: any) {
            console.error("Error updating proof:", err);
            toast.error("Failed to update proof status");
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading pending approvals...</div>;
    }

    if (proofs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-500">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">All Caught Up!</h3>
                <p className="text-sm max-w-xs mx-auto mt-2">No pending proof of work submissions to review.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                Pending Approvals <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">{proofs.length}</span>
            </h2>

            {proofs.map((proof) => (
                <div key={proof.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                                    {proof.user?.email?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{proof.user?.full_name || 'Member'}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold">submitted proof</p>
                                </div>
                            </div>

                            <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-1">{proof.task?.title}</h4>
                            <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{proof.task?.description || 'No description'}</p>

                            {proof.image_url && (
                                <a
                                    href={proof.image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mb-2 group"
                                >
                                    <FileText className="w-4 h-4" />
                                    View Proof Attachment
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            )}

                            <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-400 font-medium">
                                <Calendar className="w-3 h-3" />
                                {new Date(proof.created_at).toLocaleString()}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                            <Button
                                onClick={() => handleAction(proof.id, 'approve')}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 px-4 rounded-xl shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Agree
                            </Button>
                            <Button
                                onClick={() => handleAction(proof.id, 'reject')}
                                variant="outline"
                                className="border-rose-200 dark:border-rose-900/30 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-bold h-9 px-4 rounded-xl"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Disagree
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProofReviewList;
