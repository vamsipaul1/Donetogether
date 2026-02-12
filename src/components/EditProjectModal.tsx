import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit3Icon, Save, X, Users, Type, Crown, Shield } from "lucide-react";
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
            <DialogContent className="w-[95vw] sm:max-w-[520px] max-h-[85vh] overflow-y-auto bg-white dark:bg-[#09090b] font-sans border-zinc-200 dark:border-zinc-800 p-0 rounded-3xl shadow-2xl scrollbar-hide">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-black flex items-center justify-center ring-1 ring-inset ring-black/5 dark:ring-white/10">
                            <Edit3Icon className="w-5 h-5 text-black dark:text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                                Project Settings
                            </DialogTitle>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                Manage your team's identity and mission
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Form Fields */}
                    <div className="grid gap-5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 ml-1">
                                Project Identity
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="relative">
                                        <Type className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                                        <Input
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            className="pl-9 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium"
                                            placeholder="Project Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                                        <Input
                                            value={teamName}
                                            onChange={e => setTeamName(e.target.value)}
                                            className="pl-9 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium"
                                            placeholder="Team Name"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 ml-1">
                                Mission & Goals
                            </label>
                            <Textarea
                                value={goal}
                                onChange={e => setGoal(e.target.value)}
                                className="min-h-[100px] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium resize-none p-4 leading-relaxed"
                                placeholder="What are the core objectives for this project? Outline your goals here..."
                            />
                        </div>

                        {members.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 ml-1">
                                        Squad Members
                                    </label>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                        {members.length} Active
                                    </span>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto custom-scrollbar">
                                    {members.map((member: any) => (
                                        <div key={member.id} className="flex items-center gap-3 p-3 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group">
                                            <Avatar className="w-8 h-8 border border-white dark:border-zinc-800 shadow-sm">
                                                <AvatarFallback className="text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                                                    {member.users?.email?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                                        {member.users?.full_name || 'Team Member'}
                                                    </p>
                                                    {member.role === 'owner' && (
                                                        <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs font-medium text-zinc-500 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-400">
                                                    {member.users?.email}
                                                </p>
                                            </div>
                                            <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${member.role === 'owner'
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500'
                                                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                                }`}>
                                                {member.role === 'owner' ? 'Leader' : member.role}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-xl h-10 px-6 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-sm rounded-xl px-6 h-10 shadow-lg shadow-zinc-500/20 dark:shadow-none transition-all active:scale-95"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditProjectModal;
