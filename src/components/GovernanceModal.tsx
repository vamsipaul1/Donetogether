import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Users, Crown, Settings2,
    X, CheckCircle2, AlertCircle, Sparkles, TrendingUp,
    Lock, UserPlus, FileEdit, Trash2, ArrowRight
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import type { Project, ProjectMember, User } from '@/types/database';

interface GovernanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    members: (ProjectMember & { users?: User })[];
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
    const isOwner = members.find(m => m.user_id === currentUserId)?.role === 'owner';
    const [loading, setLoading] = useState<string | null>(null);
    const [transferringTo, setTransferringTo] = useState<string | null>(null);
    const [removingMember, setRemovingMember] = useState<string | null>(null);

    const handleRemoveMember = async (memberId: string) => {
        if (!isOwner) return;

        setLoading('remove');
        try {
            const { error } = await supabase
                .from('project_members')
                .delete()
                .eq('id', memberId);

            if (error) throw error;
            toast.success("Member successfully removed from the project.");
            onPermissionsUpdated();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(null);
            setRemovingMember(null);
        }
    };

    const updatePermission = async (memberId: string, field: string, value: boolean) => {
        if (!isOwner) {
            toast.error("Only the project leader can manage permissions.");
            return;
        }

        setLoading(`${memberId}-${field}`);
        try {
            const { error } = await supabase
                .from('project_members')
                .update({ [field]: value })
                .eq('id', memberId);

            if (error) throw error;
            toast.success("Permission synchronized.");
            onPermissionsUpdated();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(null);
        }
    };

    const handleTransferOwnership = async (newOwnerId: string) => {
        if (!isOwner) return;

        const confirmTransfer = window.confirm(
            "CRITICAL ACTION: This will transfer leadership to this member. You will lose owner permissions. Proceed?"
        );
        if (!confirmTransfer) return;

        setLoading('transfer');
        try {
            const { error } = await supabase.rpc('transfer_project_ownership', {
                p_id: project.id,
                new_owner_id: newOwnerId
            });

            if (error) throw error;
            toast.success("Leadership successfully transferred. Long live the new leader!");
            onPermissionsUpdated();
            onClose();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(null);
            setTransferringTo(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[32px] p-0 overflow-hidden font-sans">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-500 via-emerald-500 to-amber-500" />

                <DialogHeader className="p-8 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Project Permissions</DialogTitle>
                            <DialogDescription className="text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                                Configure member access and capability levels.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 pt-6 space-y-8">
                    <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-6">
                            {members.map((member) => (
                                <div key={member.id} className="relative group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm border border-zinc-200 dark:border-zinc-700">
                                                {member.users?.email?.[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                                        {member.users?.full_name || member.users?.email?.split('@')[0]}
                                                    </span>
                                                    {member.role === 'owner' ? (
                                                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-none text-[9px] uppercase font-bold px-1.5 py-0">Lead</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0">Member</Badge>
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-medium text-zinc-400">{member.users?.email}</p>
                                            </div>
                                        </div>

                                        {isOwner && member.user_id !== currentUserId && (
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setTransferringTo(member.user_id)}
                                                    className="text-[11px] font-black uppercase text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg group"
                                                >
                                                    <Crown className="w-3 h-3 mr-1.5 transition-transform group-hover:scale-110" />
                                                    Transfer
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setRemovingMember(member.id)}
                                                    className="text-[11px] font-black uppercase text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg group"
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1.5 transition-transform group-hover:scale-110" />
                                                    Remove
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Permission Matrix */}
                                    <div className="grid grid-cols-2 gap-6 ml-13">
                                        <PermissionItem
                                            icon={FileEdit}
                                            label="Manage Tasks"
                                            description="Create and modify project tasks"
                                            checked={member.can_manage_tasks}
                                            disabled={member.role === 'owner' || !isOwner}
                                            onCheckedChange={(val) => updatePermission(member.id, 'can_manage_tasks', val)}
                                        />
                                        <PermissionItem
                                            icon={UserPlus}
                                            label="Invite Members"
                                            description="Add new teammates to the project"
                                            checked={member.can_invite_members}
                                            disabled={member.role === 'owner' || !isOwner}
                                            onCheckedChange={(val) => updatePermission(member.id, 'can_invite_members', val)}
                                        />
                                        <PermissionItem
                                            icon={TrendingUp}
                                            label="View Analytics"
                                            description="View project performance"
                                            checked={member.can_view_analytics}
                                            disabled={member.role === 'owner' || !isOwner}
                                            onCheckedChange={(val) => updatePermission(member.id, 'can_view_analytics', val)}
                                        />
                                        <PermissionItem
                                            icon={Settings2}
                                            label="Edit Project"
                                            description="Modify project details and settings"
                                            checked={member.can_edit_project_details}
                                            disabled={member.role === 'owner' || !isOwner}
                                            onCheckedChange={(val) => updatePermission(member.id, 'can_edit_project_details', val)}
                                        />
                                    </div>

                                    {member.id !== members[members.length - 1].id && (
                                        <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 mt-6" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Ownership Transfer confirmation overlay */}
                    <AnimatePresence>
                        {transferringTo && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 flex flex-col items-center justify-center p-8 z-50 rounded-[32px] text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 animate-pulse">
                                    <Crown className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-tighter">Handover the Throne?</h4>
                                <p className="text-sm text-zinc-500 mb-8 max-w-sm">
                                    You are about to transfer complete project authority. You will become a standard member.
                                </p>
                                <div className="flex gap-4 w-full max-w-xs">
                                    <Button
                                        onClick={() => setTransferringTo(null)}
                                        variant="ghost"
                                        className="flex-1 rounded-xl h-12 uppercase font-bold text-xs"
                                    >
                                        Retain Power
                                    </Button>
                                    <Button
                                        onClick={() => handleTransferOwnership(transferringTo)}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-black rounded-xl h-12 uppercase font-bold text-xs shadow-lg shadow-amber-500/20"
                                    >
                                        Engage Transfer
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Member Removal confirmation overlay */}
                    <AnimatePresence>
                        {removingMember && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-0 bg-white/95 dark:bg-zinc-950/95 flex flex-col items-center justify-center p-8 z-50 rounded-[32px] text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 animate-pulse">
                                    <Trash2 className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 uppercase tracking-tighter">Remove Member?</h4>
                                <p className="text-sm text-zinc-500 mb-8 max-w-sm">
                                    This action will revoke all project access for this member. This cannot be undone.
                                </p>
                                <div className="flex gap-4 w-full max-w-xs">
                                    <Button
                                        onClick={() => setRemovingMember(null)}
                                        variant="ghost"
                                        className="flex-1 rounded-xl h-12 uppercase font-bold text-xs"
                                    >
                                        Keep Member
                                    </Button>
                                    <Button
                                        onClick={() => handleRemoveMember(removingMember)}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 uppercase font-bold text-xs shadow-lg shadow-red-500/20"
                                    >
                                        Remove Member
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                    <Button onClick={onClose} className="bg-zinc-900 dark:bg-white text-white dark:text-black font-bold h-10 px-6 rounded-xl hover:scale-105 transition-all">
                        save changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const PermissionItem = ({ icon: Icon, label, description, checked, disabled, onCheckedChange }: any) => (
    <div className={`rounded-[24px] transition-all ${checked ? 'moving-gradient-border shadow-md' : 'bg-transparent grayscale opacity-50'}`}>
        <div className={`p-5 rounded-[24px] ${checked ? 'moving-gradient-border-content' : 'border border-transparent'}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${checked ? 'text-violet-500' : 'text-zinc-600'}`} />
                    <span className="text-[13px] font-bold uppercase tracking-tight text-zinc-900 dark:text-white">{label}</span>
                </div>
                <Switch
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    disabled={disabled}
                    className="scale-90 data-[state=checked]:bg-emerald-500"
                />
            </div>
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 pl-8">{description}</p>
        </div>
    </div>
);

export default GovernanceModal;
