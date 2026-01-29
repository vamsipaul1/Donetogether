import { BarChart3 } from 'lucide-react';

const AnalyticsView = ({ tasks, members }: any) => (
    <div className="flex flex-col items-center justify-center h-full p-12 text-center text-zinc-500 font-outfit">
        <BarChart3 className="w-16 h-16 mb-4 opacity-10" />
        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">Tactical Analysis</h3>
        <p className="max-w-xs mt-2 font-medium uppercase text-[10px] tracking-widest leading-loose">Comprehensive mission metrics and performance burndowns.</p>
        <div className="mt-6 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <span className="text-[9px] font-black uppercase text-zinc-400">Model Training...</span>
        </div>
    </div>
);

export default AnalyticsView;
