import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const HeroSection = () => {
  const { user } = useAuth();
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#b8dcfd] via-[#e0f1ff] to-[#ffffff] dark:from-zinc-950 dark:to-black pt-32 pb-20">

      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none bg-[url('/image%20copy%208.png')] bg-cover bg-center" />

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent opacity-50" />
      </div>

      <div className="container relative z-10 max-w-5xl mx-auto px-6 text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-block"
        >
          <span className="px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-zinc-900/10 text-zinc-900 text-[11px] font-mono tracking-widest uppercase font-bold shadow-sm">
            only for students
          </span>
        </motion.div>

        {/* Hero Headline - Mixed Typography like Reference */}
        {/* Hero Headline - Mixed Typography like Reference */}
        <h1 className="text-center mb-6 sm:mb-8 leading-tight sm:leading-[0.9] text-zinc-900 dark:text-white">
          <span className="block font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] tracking-tighter mb-2">
            A Workspace
          </span>
          <span className="block font-sans font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[6rem]">
            for Student Projects
          </span>
        </h1>

        {/* Subtext - straight Serif like reference */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl md:text-2xl text-zinc-800 dark:text-zinc-300 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0"
        >
          Plan, collaborate, and execute your semester projects with professional clarity from first idea to final submission.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0"
        >
          <Link to={user ? "/dashboard" : "/signup"} className="w-auto">
            <Button
              className="h-12 sm:h-14 px-4 sm:px-6 md:px-8 rounded-xl bg-black dark:bg-white text-white hover:bg-black/80 dark:hover:bg-white/80 dark:text-black font-sans text-xs sm:text-sm tracking-wider transition-all duration-300 whitespace-nowrap"
            >
              Start Your Project
              <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <Link to="#how-it-works" className="w-auto">
            <Button
              className="h-12 sm:h-16 px-6 sm:px-6 md:px-8 rounded-xl bg-white dark:bg-black text-black dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-sans text-xs sm:text-sm tracking-wider transition-all duration-300 whitespace-nowrap"
            >
              How it works
              <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
