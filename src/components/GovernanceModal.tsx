import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Crown, Settings,
    Trash2, User, Check, AlertCircle, Sparkles, AlertTriangle
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import type { Project, ProjectMember, User as UserType } from '@/types/database';

interface GovernanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    members: (ProjectMember & { users?: UserType })[];
    currentUserId: string;
    onPermissionsUpdated: () => void;
}

const GovernanceModal = ({
    isOpen,
    onClose,
    project,
    members,
    currentUserId,
    onPermissionsUpdated
}: GovernanceModalProps) => {
    // Current user's role check
    const isOwner = members.find(m => m.user_id === currentUserId)?.role === 'owner';
    const currentUserMemberId = members.find(m => m.user_id === currentUserId)?.id;

    const [loading, setLoading] = useState<string | null>(null);
    const [transferringTo, setTransferringTo] = useState<string | null>(null);
    const [removingMember, setRemovingMember] = useState<string | null>(null);

    // Sync local state with props, but allow optimistic divergence
    const [localMembers, setLocalMembers] = useState(members);

    useEffect(() => {
        setLocalMembers(members);
    }, [members]);

    const handleRemoveMember = async (memberId: string) => {
        if (!isOwner) return;

        // Secure User ID identification
        let user_id = localMembers.find(m => m.id === memberId)?.user_id;

        // Fallback fetch if strictly necessary
        if (!user_id) {
            const { data } = await supabase.from('project_members').select('user_id').eq('id', memberId).single();
            if (data) user_id = data.user_id;
        }

        if (!user_id) {
            toast.error("Initialization Failed: Cannot identify user.");
            return;
        }

        setRemovingMember(null);
        setLoading('remove');
        const previousMembers = [...localMembers];

        // Optimistic UI Update
        setLocalMembers(prev => prev.filter(m => m.id !== memberId));

        try {
            console.log("Starting Member Removal Sequence for:", user_id);

            // 1. Unassign Tasks (Try both User ID and Member ID to fail-safe schemas)
            // We use Promise.allSettled to ensure individual failures don't stop the train
            const taskUnassignPromises = [
                supabase.from('tasks').update({ assigned_to: null }).eq('project_id', project.id).eq('assigned_to', user_id),
                supabase.from('tasks').update({ assigned_to: null }).eq('project_id', project.id).eq('assigned_to', memberId)
            ];
            await Promise.allSettled(taskUnassignPromises);

            // 2. Reassign Authored Tasks (to Owner)
            await supabase.from('tasks')
                .update({ assigned_by: currentUserId })
                .eq('project_id', project.id)
                .eq('assigned_by', user_id)
                .catch(console.warn);

            // 3. Clean Chat (Messages)
            try {
                const { data: rooms } = await supabase.from('chat_rooms').select('id').eq('project_id', project.id);
                if (rooms && rooms.length > 0) {
                    const roomIds = rooms.map(r => r.id);
                    await supabase.from('messages').delete().in('room_id', roomIds).eq('sender_id', user_id);
                }
            } catch (e) { console.warn("Chat cleanup warning", e); }

            // 4. Clean AI Logs
            await supabase.from('ai_logs').delete().eq('project_id', project.id).eq('user_id', user_id).catch(() => { });

            // 5. Clean Invites (Best Guess)
            await supabase.from('project_invites').delete().eq('project_id', project.id).eq('invited_by', user_id).catch(() => { });
            await supabase.from('invitations').delete().eq('project_id', project.id).eq('invited_by', user_id).catch(() => { });

            // 6. Clean Proofs (Best effort)
            await supabase.from('task_proofs').delete().eq('user_id', user_id).catch(() => { });


            // --- FINAL DELETE ---
            const { error } = await supabase
                .from('project_members')
                .delete()
                .eq('id', memberId);

            if (error) {
                console.warn("Primary delete failed, trying fallback...", error);

                // Fallback: Delete by composite key
                const { error: compositeError } = await supabase
                    .from('project_members')
                    .delete()
                    .eq('project_id', project.id)
                    .eq('user_id', user_id);

                if (compositeError) throw compositeError;
            }

            toast.success("Team member removed successfully.");
            onPermissionsUpdated();
        } catch (err: any) {
            console.error("Removal Error:", err);

            // Detailed User Feedback
            let errorMsg = "Failed to remove member.";
            const detail = err.details || err.message || '';
            const code = err.code || '';

            if (code === '23503') {
                errorMsg = `Constraint Error: ${err.constraint || detail}`;
                if (detail.includes('tasks')) errorMsg = "Fail: User has linked Tasks.";
                else if (detail.includes('messages')) errorMsg = "Fail: User has linked Chat Messages.";
            } else if (code === '42501') {
                errorMsg = "Permission Denied: You cannot remove this member.";
            } else {
                errorMsg = `Error: ${detail.substring(0, 50)}`;
            }

            toast.error(errorMsg);

            // Revert optimistic update
            setLocalMembers(previousMembers);
        } finally {
            setLoading(null);
        }
    };

    const updatePermission = async (memberId: string, field: string, value: boolean) => {
        if (!isOwner) return;

        // Optimistic Update
        setLocalMembers(prev => prev.map(m =>
            m.id === memberId ? { ...m, [field]: value } : m
        ));

        try {
            const { error } = await supabase
                .from('project_members')
                .update({ [field]: value })
                .eq('id', memberId);

            if (error) {
                if (error.code === "PGRST204") {
                    console.warn(`Column ${field} missing, treating as simulation.`);
                } else {
                    throw error;
                }
            }
        } catch (err: any) {
            console.error("Permission update failed:", err);
            toast.error("Failed to update permission.");
        }
    };

    const handleTransferOwnership = async (newOwnerUserId: string) => {
        if (!isOwner) return;

        setLoading('transfer');
        const newOwnerMember = localMembers.find(m => m.user_id === newOwnerUserId);

        if (!newOwnerMember || !currentUserMemberId) {
            setLoading(null);
            return;
        }

        try {
            // Priority 1: Try using RPC
            const { error: rpcError } = await supabase.rpc('transfer_project_ownership', {
                p_id: project.id,
                new_owner_id: newOwnerUserId
            });

            if (rpcError) {
                console.warn("RPC transfer failed, falling back to manual update:", rpcError);

                // Priority 2: Manual Update Strategy
                const { error: promoteError } = await supabase
                    .from('project_members')
                    .update({ role: 'owner' })
                    .eq('user_id', newOwnerUserId)
                    .eq('project_id', project.id);

                if (promoteError) throw promoteError;

                const { error: demoteError } = await supabase
                    .from('project_members')
                    .update({ role: 'member' })
                    .eq('user_id', currentUserId)
                    .eq('project_id', project.id);

                if (demoteError) {
                    console.error("Demotion failed:", demoteError);
                    toast.warning("New owner promoted, but failed to demote you.");
                }
            }

            toast.success("Ownership transferred successfully.");
            onPermissionsUpdated();
            onClose();
        } catch (err: any) {
            console.error("Transfer failed:", err);
            toast.error(err.message || "Failed to transfer ownership.");
        } finally {
            setLoading(null);
            setTransferringTo(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[32px] p-0 overflow-hidden font-sans shadow-2xl flex flex-col h-[85vh] max-h-[850px]">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-black dark:bg-zinc-800 z-10" />

                <DialogHeader className="p-6 md:p-8 pb-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                                Team Permissions
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500 font-medium text-sm">
                                Manage roles, access levels, and project ownership.
                            </DialogDescription>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-zinc-900 dark:text-white" />
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 min-h-0 px-6 md:px-8 relative">
                    <ScrollArea className="h-full pr-4 -mr-4">
                        <div className="space-y-6 pb-20">
                            {localMembers.map((member) => (
                                <div key={member.id} className="group relative bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/50 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:border-zinc-200 dark:hover:border-zinc-700">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center font-bold text-sm text-zinc-700 dark:text-zinc-300 shadow-sm border border-zinc-200 dark:border-zinc-700">
                                                {member.users?.email?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                                        {member.users?.full_name || member.users?.email?.split('@')[0]}
                                                    </span>
                                                    {member.role === 'owner' ? (
                                                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-none text-[9px] uppercase font-black px-2 py-0.5 flex items-center gap-1">
                                                            <Crown className="w-3 h-3" /> Owner
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[9px] text-zinc-400 border-zinc-200 dark:border-zinc-700 uppercase font-black px-2 py-0.5">Member</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-400 font-medium truncate max-w-[180px]">{member.users?.email}</p>
                                            </div>
                                        </div>

                                        {isOwner && member.role !== 'owner' && (
                                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setTransferringTo(member.user_id)}
                                                    className="w-8 h-8 rounded-lg text-zinc-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                                    title="Transfer Ownership"
                                                >
                                                    <Crown className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setRemovingMember(member.id)}
                                                    className="w-8 h-8 rounded-lg text-zinc-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Permission Buttons */}
                                    <div className="pl-[52px]">
                                        {member.role === 'owner' ? (
                                            <div className="flex items-center gap-2 py-2">
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Full Administrative Control</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                <PermissionButton
                                                    label="Tasks"
                                                    active={member.can_manage_tasks}
                                                    disabled={!isOwner}
                                                    onClick={() => updatePermission(member.id, 'can_manage_tasks', !member.can_manage_tasks)}
                                                />
                                                <PermissionButton
                                                    label="Invite"
                                                    active={member.can_invite_members}
                                                    disabled={!isOwner}
                                                    onClick={() => updatePermission(member.id, 'can_invite_members', !member.can_invite_members)}
                                                />
                                                <PermissionButton
                                                    label="Analytics"
                                                    active={member.can_view_analytics}
                                                    disabled={!isOwner}
                                                    onClick={() => updatePermission(member.id, 'can_view_analytics', !member.can_view_analytics)}
                                                />
                                                <PermissionButton
                                                    label="Settings"
                                                    active={member.can_edit_project_details}
                                                    disabled={!isOwner}
                                                    onClick={() => updatePermission(member.id, 'can_edit_project_details', !member.can_edit_project_details)}
                                                />
                                                <PermissionButton
                                                    label="Timeline"
                                                    active={member.can_manage_timeline}
                                                    disabled={!isOwner}
                                                    onClick={() => updatePermission(member.id, 'can_manage_timeline', !member.can_manage_timeline)}
                                                />
                                                <PermissionButton
                                                    label="Restore"
                                                    active={member.can_restore_tasks}
                                                    disabled={!isOwner}
                                                    onClick={() => updatePermission(member.id, 'can_restore_tasks', !member.can_restore_tasks)}
                                                />
                                                <PermissionButton
                                                    label="Files"
                                                    active={member.can_manage_resources}
                                                    disabled={!isOwner}
                                                    onClick={() => updatePermission(member.id, 'can_manage_resources', !member.can_manage_resources)}
                                                />
                                                <PermissionButton
                                                    label="Chat"
                                                    active={member.can_post_messages}
                                                    disabled={!isOwner}
                                                    onClick={() => updatePermission(member.id, 'can_post_messages', !member.can_post_messages)}
                                                />
                                                <PermissionButton
                                                    label="Verify Tasks"
                                                    active={member.can_verify_tasks}
                                                    disabled={!isOwner}
                                                    onClick={() => updatePermission(member.id, 'can_verify_tasks', !member.can_verify_tasks)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800 flex justify-end flex-shrink-0 z-20">
                    <Button onClick={onClose} className="bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl px-6 h-10 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm">
                        Done
                    </Button>
                </div>

                {/* Overlays */}
                <AnimatePresence>
                    {transferringTo && (
                        <div className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 flex flex-col items-center justify-center z-50 p-8 text-center animate-in fade-in zoom-in-95 duration-200 backdrop-blur-sm">
                            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-6 shadow-sm">
                                <Crown className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="text-xl font-black mb-2 text-zinc-900 dark:text-white tracking-tight">Transfer Ownership?</h3>
                            <p className="text-sm font-medium text-zinc-500 mb-8 max-w-[280px] leading-relaxed">
                                You are about to transfer ownership. <br />
                                <span className="text-amber-600 dark:text-amber-400 font-bold">You will lose admin privileges</span> and become a regular member.
                            </p>
                            <div className="flex gap-4 w-full max-w-xs">
                                <Button variant="outline" onClick={() => setTransferringTo(null)} className="flex-1 font-bold rounded-xl border-zinc-200 dark:border-zinc-700 h-12 bg-white dark:bg-zinc-900">Cancel</Button>
                                <Button onClick={() => handleTransferOwnership(transferringTo)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl h-12 shadow-md shadow-amber-500/20">
                                    Confirm Transfer
                                </Button>
                            </div>
                        </div>
                    )}
                    {removingMember && (
                        <div className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 flex flex-col items-center justify-center z-50 p-8 text-center animate-in fade-in zoom-in-95 duration-200 backdrop-blur-sm">
                            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6 shadow-sm">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-black mb-2 text-zinc-900 dark:text-white tracking-tight">Remove Team Member?</h3>
                            <p className="text-sm font-medium text-zinc-500 mb-8 max-w-[280px] leading-relaxed">
                                This user will lose access to all project data, tasks, and chat history immediately.
                            </p>
                            <div className="flex gap-4 w-full max-w-xs">
                                <Button variant="outline" onClick={() => setRemovingMember(null)} className="flex-1 font-bold rounded-xl border-zinc-200 dark:border-zinc-700 h-12 bg-white dark:bg-zinc-900">Keep Member</Button>
                                <Button onClick={() => handleRemoveMember(removingMember)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12 shadow-md shadow-red-600/20">
                                    Yes, Remove
                                </Button>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
};

interface PermissionButtonProps {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
}

const PermissionButton = ({ label, active, disabled, onClick, icon }: PermissionButtonProps) => (
    <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`
            px-4 py-2 rounded-full text-[11px] font-bold transition-all select-none
            flex items-center gap-2 border
            ${active
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md'
                : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        `}
    >
        {active && icon}
        {label}
    </button>
);

export default GovernanceModal;
