import { QRCodeSVG } from 'qrcode.react';
import {
    ShieldCheck, Zap, Activity, Globe,
    Lock, Share2, Copy, Check
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const WorkspaceView = ({ user }: any) => {
    const [copied, setCopied] = useState(false);
    const workspaceUrl = window.location.origin;

    const handleCopy = () => {
        navigator.clipboard.writeText(workspaceUrl);
        setCopied(true);
        toast.success("Workspace coordinates secured.");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-full bg-[#f9f8f8] dark:bg-[#1e1f21] font-outfit">
            {/* Left Content */}
            <div className="flex-1 p-8 md:p-12 space-y-12 overflow-y-auto">
                <header className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            Workspace Primary
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
                        Mission Control<br />Center
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Network Status */}
                    <div className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-6 group hover:shadow-xl transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Network Signal</h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active & Secure</p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 w-fit px-3 py-1 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            99.9% Uptime Verified
                        </div>
                    </div>

                    {/* Access Link */}
                    <div className="p-8 rounded-[40px] bg-zinc-900 text-white space-y-6 relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Globe className="w-32 h-32 rotate-12 text-emerald-500" />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight">Secure Access Link</h3>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Public Deployment URL</p>
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/5 backdrop-blur-sm">
                                <code className="flex-1 text-[10px] font-bold text-zinc-400 truncate px-2">{workspaceUrl}</code>
                                <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-lg transition-all text-zinc-400 hover:text-white">
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 animate-fade-up">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest px-2">Active Protocols</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ProtocolItem icon={ShieldCheck} label="Encryption" sub="AES-256 Enabled" />
                        <ProtocolItem icon={Zap} label="Response" sub="< 10ms Latency" />
                        <ProtocolItem icon={Globe} label="Routing" sub="Global Mesh" />
                    </div>
                </div>
            </div>

            {/* Right Sidebar - QR Code */}
            <div className="w-full lg:w-96 p-12 border-l border-zinc-200 dark:border-[#3d3e40] bg-white dark:bg-[#1e1f21] flex flex-col items-center justify-center space-y-8">
                <div className="p-8 rounded-[40px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-2xl relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px]" />
                    <QRCodeSVG
                        value={workspaceUrl}
                        size={200}
                        bgColor={"transparent"}
                        fgColor={document.documentElement.classList.contains('dark') ? "#ffffff" : "#000000"}
                        level={"H"}
                        includeMargin={false}
                        className="relative z-10"
                    />
                </div>
                <div className="text-center space-y-4">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Mobile Enlistment</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest max-w-[200px] mx-auto leading-loose">
                        Scan with tactical device to synchronize mission data locally.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase text-zinc-500">Sync Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProtocolItem = ({ icon: Icon, label, sub }: any) => (
    <div className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-emerald-500/30 transition-colors group">
        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none mb-1.5">{label}</h4>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">{sub}</p>
        </div>
    </div>
);

export default WorkspaceView;
