import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakData {
    id: string;
    user_id: string;
    count: number;
    last_activity: string;
    multiplier: number;
}

const StreakStats = ({ userId }: { userId: string }) => {
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const updateStreak = async () => {
            try {
                // Fetch or Initialize streak record
                let { data, error } = await supabase
                    .from('user_streaks')
                    .select('*')
                    .eq('user_id', userId)
                    .single();

                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                if (error && error.code === 'PGRST116') {
                    // Create new streak record
                    const { data: newData, error: insertError } = await supabase
                        .from('user_streaks')
                        .insert([{
                            user_id: userId,
                            count: 1,
                            last_activity: today,
                            multiplier: 1.0
                        }])
                        .select()
                        .single();
                    
                    if (!insertError) setStreak(newData);
                } else if (data) {
                    const lastDate = data.last_activity;

                    if (lastDate === today) {
                        setStreak(data);
                    } else if (lastDate === yesterday) {
                        // Increment
                        const nextCount = data.count + 1;
                        const nextMultiplier = Math.min(2.5, 1.0 + (nextCount * 0.1));
                        
                        const { data: updatedData } = await supabase
                            .from('user_streaks')
                            .update({ 
                                count: nextCount, 
                                last_activity: today,
                                multiplier: parseFloat(nextMultiplier.toFixed(2))
                            })
                            .eq('id', data.id)
                            .select()
                            .single();
                        
                        if (updatedData) setStreak(updatedData);
                    } else {
                        // Reset
                        const { data: resetData } = await supabase
                            .from('user_streaks')
                            .update({ 
                                count: 1, 
                                last_activity: today,
                                multiplier: 1.0
                            })
                            .eq('id', data.id)
                            .select()
                            .single();
                        
                        if (resetData) setStreak(resetData);
                    }
                }
            } catch (err) {
                console.error('Streak check failed:', err);
                // Fallback for demo if table doesn't exist
                setStreak({
                    id: 'temp',
                    user_id: userId,
                    count: 4,
                    last_activity: new Date().toISOString(),
                    multiplier: 1.4
                });
            } finally {
                setLoading(false);
            }
        };

        updateStreak();
    }, [userId]);

    if (loading) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 shadow-xl shadow-zinc-500/5 flex flex-col items-center text-center group"
        >
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-4 border border-zinc-100 dark:border-white/5 transition-transform group-hover:scale-110 shadow-inner">
                <Flame className={`w-6 h-6 ${streak?.count && streak.count > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-zinc-300'}`} />
            </div>

            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">
                Focus Streak
            </span>

            <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums">
                    {streak?.count || 0}
                </span>
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Days
                </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                    +{((streak?.multiplier || 1) - 1).toFixed(1)} XP Multiplier
                </span>
            </div>

            {/* Daily Indicator Dots */}
            <div className="flex gap-2.5 mt-5">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                   const isToday = new Date().getDay() === (i === 6 ? 0 : i + 1);
                   return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-orange-500 ring-4 ring-orange-500/20' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                        <span className={`text-[10px] font-bold ${isToday ? 'text-zinc-950 dark:text-white' : 'text-zinc-400 dark:text-zinc-600'}`}>{day}</span>
                    </div>
                   );
                })}
            </div>
        </motion.div>
    );
};

export default StreakStats;
