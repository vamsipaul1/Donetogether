import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  }
};

export default function CTASection() {
  const { user } = useAuth();

  return (
    <section className="relative w-full bg-white py-16 sm:py-36 border-t border-zinc-100 overflow-hidden isolate">
      {/* Subtle Radial Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(247,247,247,1)_0%,rgba(255,255,255,0)_80%)] pointer-events-none -z-10" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ staggerChildren: 0.15 }}
        className="max-w-4xl mx-auto px-6 text-center"
      >
        {/* Heading */}
        <motion.h2
          variants={fadeUp}
          className="
            font-sans
            font-semibold
            text-3xl xs:text-4xl sm:text-5xl md:text-6xl 
            tracking-[-0.03em] 
            text-[#0a0a0a] 
            mb-6 
            leading-[1.15]
            sm:leading-[1.05]
          "
        >
          Ready to{' '}
          <span className="relative">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              build your next project
            </span>

          </span>{' '}
          together?
        </motion.h2>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          className="
            font-body
            text-lg sm:text-[18px] 
            text-slate-700 
            mb-10 
            max-w-2xl 
            mx-auto
            leading-relaxed
            tracking-[-0.015em]
          "
        >
          Align your team, track your progress, and turn your ideas into reality.
        </motion.p>

        {/* Button */}
        <motion.div variants={fadeUp} className="relative inline-block mt-14">
          {/* Hand-drawn Directional Arrow - Darker and shifted right for mobile */}
          <div className="absolute -top-14 -left-2 sm:-top-16 sm:-left-12 text-black pointer-events-none transform -rotate-12 sm:-rotate-12 opacity-60 sm:opacity-100">
            <svg
              className="w-14 h-14 sm:w-[90px] sm:h-[90px]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20,20 Q65,15 90,65"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M75,55 L90,65 L100,50"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <Link to={user ? "/project-room" : "/signup"}>
            <button
              className="
                group
                inline-flex
                items-center
                justify-center
                gap-3
                bg-[#0a0a0a] 
                text-white 
                px-8 
                h-[56px]
                text-[15.5px] 
                font-semibold 
                rounded-full 
                transition-all
                duration-300
                hover:bg-[#1a1a1a]
                hover:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.4)]
                hover:-translate-y-1
                active:scale-95
              "
            >
              <span>Launch Your Workspace</span>
              <div className="bg-white/20 rounded-full p-[4px] transition-transform duration-300 group-hover:translate-x-1.5 flex items-center justify-center">
                <ArrowRight size={17} strokeWidth={3} />
              </div>
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
