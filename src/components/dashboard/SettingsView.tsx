import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Palette, Globe, Save, Camera, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SettingsViewProps {
    user: any;
    currentUser: any;
    onUserUpdated: () => void;
}

const SettingsView = ({ user, currentUser, onUserUpdated }: SettingsViewProps) => {
    const [fullName, setFullName] = useState(currentUser?.full_name || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ full_name: fullName })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Profile updated successfully');
            onUserUpdated();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto font-body min-h-full flex flex-col space-y-12">
            <header className="space-y-2">
                <div className="flex items-center gap-4 text-violet-600 dark:text-violet-400 mb-2">
                    <User className="w-10 h-10" strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">System Core</span>
                </div>
                <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">
                    Account Settings
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg max-w-2xl leading-relaxed mt-4">
                    Manage your elite profile identity, security protocols, and visual workspace preferences.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-3">
                    <button className="w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-zinc-500/20 active:scale-95 group">
                        <div className="flex items-center gap-3">
                            <User className="w-4 h-4" />
                            Profile
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    </button>
                    <button className="w-full flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-black text-[10px] uppercase tracking-[0.2em] transition-all opacity-40 cursor-not-allowed">
                        <Shield className="w-4 h-4" />
                        Security
                    </button>
                    <button className="w-full flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-black text-[10px] uppercase tracking-[0.2em] transition-all opacity-40 cursor-not-allowed">
                        <Bell className="w-4 h-4" />
                        Alerts
                    </button>
                    <button className="w-full flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-black text-[10px] uppercase tracking-[0.2em] transition-all opacity-40 cursor-not-allowed">
                        <Palette className="w-4 h-4" />
                        Visuals
                    </button>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-[#09090b] rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden"
                    >
                        <div className="p-10 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Public Identity</h2>
                            <p className="text-sm text-zinc-500 mt-2 font-medium">Configure how you appear across the workspace.</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="p-10 space-y-10">
                            {/* Avatar Section */}
                            <div className="flex flex-col sm:flex-row items-center gap-10">
                                <div className="relative">
                                    <div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-violet-500/30 ring-4 ring-white dark:ring-zinc-800 transition-transform hover:scale-105 duration-500">
                                        {currentUser?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                    </div>
                                    <button type="button" className="absolute -bottom-2 -right-2 p-3.5 bg-zinc-900 dark:bg-white rounded-2xl shadow-2xl text-white dark:text-black hover:scale-110 active:scale-90 transition-all border-4 border-white dark:border-[#09090b]">
                                        <Camera className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-3 text-center sm:text-left flex-1">
                                    <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight uppercase">Identity Image</h3>
                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-sm">
                                        Personalize your account with a high-resolution avatar. This will be visible to all collaborators.
                                    </p>
                                    <div className="flex gap-3 pt-3 justify-center sm:justify-start">
                                        <button type="button" className="px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-95">Replace</button>
                                        <button type="button" className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95">Reset</button>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-zinc-100 dark:bg-zinc-800/50" />

                            {/* Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] pl-1 font-body">Full Name</label>
                                    <div className="relative group">
                                        <input 
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-6 py-5 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all shadow-sm"
                                            placeholder="Ex: Vamsi Rangumudri"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3 opacity-60 cursor-not-allowed">
                                    <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] pl-1 font-body">Contact Email</label>
                                    <div className="w-full px-6 py-5 bg-zinc-100 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold text-zinc-400 flex items-center justify-between">
                                        {user?.email}
                                        <Globe className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button 
                                    disabled={isSaving}
                                    className="flex items-center gap-3 px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:opacity-90 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-none active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    Update Identity
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    <div className="p-8 bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 rounded-[3rem] flex items-center justify-between gap-8">
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.2em] font-body">Danger Zone</h3>
                            <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-md">Decommission your account and erase all encrypted project fragments. This action is terminal.</p>
                        </div>
                        <button className="h-12 px-8 bg-rose-600/10 text-rose-600 border border-rose-600/20 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
