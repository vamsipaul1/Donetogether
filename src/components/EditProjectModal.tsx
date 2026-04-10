import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, Save, X, Users, Type, Crown, Shield, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
    onProjectUpdated: () => void;
    members?: any[];
}

const EditProjectModal = ({ isOpen, onClose, project, onProjectUpdated, members = [] }: EditProjectModalProps) => {
    const [title, setTitle] = useState(project.title);
    const [teamName, setTeamName] = useState(project.team_name || "");
    const [goal, setGoal] = useState(project.goal || "");
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('projects')
                .update({
                    title,
                    goal,
                    team_name: teamName || null
                })
                .eq('id', project.id);

            if (error) throw error;
            toast.success("Project updated successfully");
            onProjectUpdated();
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-[540px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#09090b] font-body border-zinc-200 dark:border-zinc-800 p-0 rounded-[2.5rem] shadow-2xl scrollbar-hide">
                {/* Header */}
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-xl">
                    <div className="flex items-center gap-5 w-full">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/20 border border-violet-400/20">
                            <Settings2 className="w-7 h-7 text-white" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
                                Project Settings
                            </DialogTitle>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                Manage mission identity
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Form Fields */}
                    <div className="grid gap-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 ml-1 font-body">
                                Project Identity
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="relative group">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
                                        <Input
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            className="h-12 pl-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-bold text-sm"
                                            placeholder="Project Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="relative group">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
                                        <Input
                                            value={teamName}
                                            onChange={e => setTeamName(e.target.value)}
                                            className="h-12 pl-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-bold text-sm"
                                            placeholder="Team Name"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 ml-1 font-body">
                                Mission & Goals
                            </label>
                            <Textarea
                                value={goal}
                                onChange={e => setGoal(e.target.value)}
                                className="min-h-[120px] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all font-bold text-sm resize-none p-5 leading-relaxed overflow-hidden"
                                placeholder="What are the core objectives for this project?"
                            />
                        </div>

                        {members.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-body">
                                        Squad Members
                                    </label>
                                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                        {members.length} Active
                                    </span>
                                </div>
                                <div className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] overflow-hidden max-h-[220px] overflow-y-auto no-scrollbar">
                                    {members.map((member: any) => (
                                        <div key={member.id} className="flex items-center gap-4 p-4 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 hover:bg-white dark:hover:bg-zinc-800/50 transition-all group">
                                            <Avatar className="w-10 h-10 border-2 border-white dark:border-zinc-900 shadow-sm group-hover:scale-110 transition-transform">
                                                <AvatarFallback className="text-xs font-black bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                                                    {member.users?.email?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate uppercase tracking-tight">
                                                        {member.users?.full_name || 'Team Member'}
                                                    </p>
                                                    {member.role === 'owner' && (
                                                        <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-medium text-zinc-500 truncate mt-0.5">
                                                    {member.users?.email}
                                                </p>
                                            </div>
                                            <div className={`text-[9px] font-black uppercase px-3 py-1 rounded-xl tracking-wider ${member.role === 'owner'
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500'
                                                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                                }`}>
                                                {member.role === 'owner' ? 'Leader' : (member.role === 'admin' ? 'Admin' : 'Member')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800/50" />

                    <div className="p-6 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-[2rem] flex items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h3 className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em] font-body">Danger Zone</h3>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">Permanently delete this project and all its data. This action is irreversible.</p>
                        </div>
                        <Button className="h-11 px-6 bg-rose-600/10 text-rose-600 border border-rose-600/20 text-xs font-black rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95">
                            Delete Project
                        </Button>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-2xl h-14 px-8 text-sm font-black text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-transparent transition-all"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 font-black text-sm rounded-[1.5rem] px-10 h-14 shadow-2xl shadow-zinc-500/20 dark:shadow-none transition-all active:scale-95 flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditProjectModal;
