import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Users, ShieldAlert, QrCode } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { useState } from "react";
import { toast } from "sonner";

interface InviteTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: {
        id: string;
        title: string;
        join_code: string;
    };
}

const InviteTeamModal = ({ isOpen, onClose, project }: InviteTeamModalProps) => {
    const [copied, setCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const inviteLink = `${window.location.origin}/join?code=${project.join_code}`;

    const handleCopyCode = () => {
        navigator.clipboard.writeText(project.join_code);
        setCopied(true);
        toast.success("Code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setLinkCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-[#1e1f21] font-sans border-zinc-200 dark:border-[#3d3e40] p-3 overflow-hidden rounded-2xl shadow-2xl">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="space-y-1">
                        <DialogTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">Invite Team</DialogTitle>
                        <p className="text-xs text-zinc-500 font-medium">Add members to {project.title}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-zinc-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Invite by email</label>
                        <div className="flex gap-2">
                            <input
                                placeholder="name@company.com"
                                className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                                id="invite-email-input"
                            />
                            <Button
                                onClick={() => {
                                    const emailInput = document.getElementById('invite-email-input') as HTMLInputElement;
                                    const email = emailInput?.value;
                                    if (email) {
                                        const subject = `Join my team on DoneTogether: ${project.title}`;
                                        const body = `Hey,\n\nI'm inviting you to join my project "${project.title}" on DoneTogether.\n\nUse this link to join:\n${inviteLink}\n\nOr use the access code: ${project.join_code}\n\nSee you there!`;
                                        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                        toast.success("Opened email client");
                                    } else {
                                        toast.error("Please enter an email address");
                                    }
                                }}
                                className="rounded-xl px-6 font-bold bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90"
                            >
                                Send
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-100 dark:border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-[#1e1f21] px-2 text-zinc-400 font-bold">Or share link</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Project Link</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-10 rounded-xl flex items-center px-3 text-xs text-zinc-500 truncate select-all">
                                {inviteLink}
                            </div>
                            <Button onClick={handleCopyLink} size="icon" variant="outline" className="h-10 w-10 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                {linkCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                        <QRCodeSVG value={inviteLink} size={120} level="H" className="dark:bg-white dark:p-1 dark:rounded-lg" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Access Code</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 h-10 rounded-xl flex items-center px-4 font-mono text-sm font-bold tracking-widest text-zinc-900 dark:text-zinc-100">
                                {project.join_code}
                            </div>
                            <Button onClick={handleCopyCode} size="icon" variant="outline" className="h-10 w-10 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InviteTeamModal;
