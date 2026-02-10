import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit3Icon, Save, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
            <DialogContent className="sm:max-w-lg bg-white dark:bg-[#1e1f21] font-sans border-zinc-200 dark:border-[#3d3e40] p-0 overflow-hidden rounded-[32px]">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-zinc-800 flex items-center justify-center shadow-lg text-emerald-500">
                        <Edit3Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-[18px] font-black text-zinc-900 dark:text-white">Edit Project Details</DialogTitle>
                        <p className="text-[11px] font-black text-zinc-600 mt-0.5">project changes</p>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase text-zinc-500 ml-1">Project Name </label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-10 focus:ring-emerald-500 font-bold"
                            placeholder="Enter mission codename..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase text-zinc-500 ml-1">Team Name (Squad Identity)</label>
                        <Input
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-10 focus:ring-amber-500 font-bold"
                            placeholder="e.g. CodeWarriors, Elite Devs..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black uppercase text-zinc-500 ml-1">Project Description</label>
                        <Textarea
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            className="bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl h-24 focus:ring-emerald-500 font-medium resize-none p-4"
                            placeholder=" What are the plans for your project ..?"
                        />
                    </div>

                    {members.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase text-zinc-500 ml-1">Project Members</label>
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                                {members.map((member: any) => (
                                    <div key={member.id} className="flex items-center gap-3 p-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase">
                                            {member.users?.email?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate">{member.users?.full_name || 'Team Member'}</p>
                                            <p className="text-[10px] font-medium text-zinc-500 truncate">{member.users?.email}</p>
                                        </div>
                                        <div className="text-[10px] font-bold uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                                            {member.role === 'owner' ? 'Team Leader' : member.role}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl h-9 px-6 text-[11px] font-black uppercase text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800">
                        <X className="w-3.5 h-3.5 mr-2" /> cancel
                    </Button>
                    <Button onClick={handleUpdate} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[11px] uppercase rounded-xl px-5 h-9 shadow-lg shadow-emerald-500/20">
                        {loading ? "Syncing..." : <><Save className="w-2 h-2 mr-2" /> save changes</>}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditProjectModal;
