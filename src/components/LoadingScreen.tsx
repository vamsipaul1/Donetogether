import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-40">
        <div className="absolute -top-[20%] left-[20%] w-[60%] aspect-square rounded-full bg-indigo-200/40 dark:bg-indigo-900/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] right-[20%] w-[60%] aspect-square rounded-full bg-rose-200/40 dark:bg-rose-900/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Glow spinner with logo container */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-16 h-16 rounded-full border-[3px] border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white shadow-[0_0_15px_rgba(0,0,0,0.05)]"
          />
          <div className="absolute w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center shadow-md">
            <img
              src="/favicon.ico"
              alt="logo"
              className="w-5 h-5 invert dark:invert-0"
              onError={(e) => {
                // Fallback letter 'D' if favicon is not resolvable
                (e.target as HTMLElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  const text = document.createElement('span');
                  text.innerText = 'D';
                  text.className = 'text-white dark:text-zinc-900 text-[14px] font-bold font-sans';
                  parent.appendChild(text);
                }
              }}
            />
          </div>
        </div>

        {/* Shimmer loading text */}
        <div className="flex flex-col items-center gap-2">
          <motion.h3 
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="font-sans text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight"
          >
            WeMakeIt
          </motion.h3>
          <div className="w-24 h-[2px] bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ left: "-100%" }}
              animate={{ left: "100%" }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-zinc-900 dark:via-white to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
