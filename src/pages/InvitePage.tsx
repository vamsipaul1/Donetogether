import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const InvitePage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (error) {
                toast.error('Project not found');
                navigate('/dashboard');
            } else {
                setProject(data);
            }
            setLoading(false);
        };

        fetchProject();
    }, [projectId, navigate]);

    const joinLink = `${window.location.origin}/join?code=${project?.join_code}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(joinLink);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#F0F5F0] dark:bg-zinc-950 dotted-pattern py-12 px-4 flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full"
            >
                <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 sm:p-10 shadow-xl border border-zinc-200 dark:border-zinc-800 text-center space-y-8">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase">
                            Project Created
                        </div>
                        <h1 className="text-3xl font-bold">{project.title}</h1>
                        <p className="text-muted-foreground">Invite your team members to start working.</p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl inline-block border border-zinc-100 dark:border-zinc-800">
                        <QRCodeSVG value={joinLink} size={180} />
                    </div>

                    {/* Join Link */}
                    <div className="space-y-4 text-left">
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4 overflow-hidden">
                            <span className="text-sm truncate text-muted-foreground font-medium">
                                {joinLink}
                            </span>
                            <Button size="icon" variant="ghost" className="shrink-0" onClick={copyToClipboard}>
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-grow"></div>
                            <span className="text-xs font-bold text-muted-foreground uppercase px-2">OR CODE</span>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-grow"></div>
                        </div>

                        <div className="text-center">
                            <div className="text-5xl font-black text-zinc-900 dark:text-white my-4">
                                {project.join_code}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                                Direct Join Code
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full h-14 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold group"
                    >
                        Go to Dashboard
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default InvitePage;
