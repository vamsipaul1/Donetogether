import { useState, useEffect } from 'react';
import { 
    User as UserIcon, 
    Shield, 
    Bell, 
    Palette, 
    Camera, 
    Lock,
    Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SettingsViewProps {
    user: any;
    currentUser: any;
    onUserUpdated: () => void;
}

type SettingsTab = 'profile' | 'security' | 'notifications' | 'appearance';

const SettingsView = ({ user, currentUser, onUserUpdated }: SettingsViewProps) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [fullName, setFullName] = useState(currentUser?.full_name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (currentUser?.full_name) {
            setFullName(currentUser.full_name);
        }
    }, [currentUser]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            // Update the main profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ 
                    display_name: fullName,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Update the users table if it exists (legacy support)
            await supabase
                .from('users')
                .update({ 
                    full_name: fullName
                    // Note: removed updated_at as it might not exist in this table
                })
                .eq('id', user.id);

            toast.success('Settings saved');
            onUserUpdated();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profiles
            await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            // Update users
            await supabase
                .from('users')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);
            
            toast.success('Avatar updated');
            onUserUpdated();
        } catch (err: any) {
            toast.error('Error uploading avatar');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 w-full font-body">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Settings</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Manage your profile and account preferences.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Navigation Sidebar */}
                <aside className="lg:w-64 shrink-0 space-y-1">
                    <TabItem 
                        icon={UserIcon} 
                        label="Profile" 
                        active={activeTab === 'profile'} 
                        onClick={() => setActiveTab('profile')} 
                    />
                    <TabItem 
                        icon={Lock} 
                        label="Security" 
                        active={activeTab === 'security'} 
                        onClick={() => setActiveTab('security')} 
                    />
                    <TabItem 
                        icon={Bell} 
                        label="Notifications" 
                        active={activeTab === 'notifications'} 
                        onClick={() => setActiveTab('notifications')} 
                    />
                    <TabItem 
                        icon={Palette} 
                        label="Appearance" 
                        active={activeTab === 'appearance'} 
                        onClick={() => setActiveTab('appearance')} 
                    />
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 max-w-2xl">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Profile Header */}
                            <section className="space-y-6">
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white pb-4 border-b border-zinc-100 dark:border-white/5">Profile Information</h2>
                                
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24 border-2 border-zinc-100 dark:border-white/10 ring-4 ring-zinc-50 dark:ring-white/5">
                                            <AvatarImage src={currentUser?.avatar_url} />
                                            <AvatarFallback className="text-2xl font-black bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black">
                                                {currentUser?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <label className={cn(
                                            "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-all",
                                            isUploading && "opacity-100 cursor-wait"
                                        )}>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                                            <Camera className="w-6 h-6" />
                                        </label>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white">Profile Photo</h4>
                                        <p className="text-sm text-zinc-500 mt-0.5">JPG, GIF or PNG. 1MB max.</p>
                                        <div className="flex gap-2 mt-3">
                                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-[11px] font-bold uppercase tracking-wider">Change</Button>
                                            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[11px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">Remove</Button>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Full Name</Label>
                                        <Input 
                                            id="fullName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="h-12 px-4 rounded-xl border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 font-medium"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Email Address</Label>
                                        <div className="h-12 px-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/30 flex items-center justify-between opacity-70">
                                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{user?.email}</span>
                                            <Lock className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                        <p className="text-[11px] text-zinc-500 font-medium">To change your email, please contact support.</p>
                                    </div>

                                    <div className="pt-6">
                                        <Button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="h-11 px-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </section>

                            <div className="h-px bg-zinc-100 dark:bg-white/5 w-full" />

                            <section className="pt-4 space-y-4">
                                <div>
                                    <h2 className="text-lg font-bold text-rose-500">Delete Account</h2>
                                    <p className="text-sm text-zinc-500 mt-1">Permanently remove your account and all associated data.</p>
                                </div>
                                <Button variant="ghost" className="h-10 px-4 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Delete my account
                                </Button>
                            </section>
                        </div>
                    )}

                    {activeTab !== 'profile' && (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 opacity-40">
                            <Label className="font-black text-sm uppercase tracking-[0.2em]">{activeTab} settings coming soon</Label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface TabItemProps {
    icon: any;
    label: string;
    active: boolean;
    onClick: () => void;
}

const TabItem = ({ icon: Icon, label, active, onClick }: TabItemProps) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]",
            active 
                ? "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-purple-600 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
        )}
    >
        <Icon className={cn("w-4 h-4", active ? "text-purple-600" : "text-zinc-400")} />
        {label}
    </button>
);

export default SettingsView;
