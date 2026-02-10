import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Circle, Globe, ArrowUpRight, Check } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: "AI-Assisted Planning",
      desc: "Enter your idea and let AI generate a structured roadmap with milestones and weekly breakdowns.",
      icon: <Circle className="w-5 h-5" />,
    },
    {
      title: "Real-Time Collaboration",
      desc: "Contextual chat linked directly to tasks. Keep discussions relevant, traceable, and focused.",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      title: "Task & Progress",
      desc: "Visual task board with live progress indicators. Clear ownership from To-Do to Done.",
      icon: <ArrowUpRight className="w-5 h-5" />,
    },
    {
      title: "Contribution Visibility",
      desc: "Track individual participation. Prevent unequal workload distribution with reporting.",
      icon: <Check className="w-5 h-5" />,
    }
  ];

  return (
    <section id="features" className="relative w-full py-24 overflow-hidden bg-[#f6f2ea] dark:bg-zinc-900 border-t border-black/5 dark:border-white/5 scroll-mt-28">

      {/* Papery Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.4] bg-[url('/paper-texture.png')] pointer-events-none mix-blend-multiply dark:mix-blend-overlay" />

      {/* Spot Highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-white/40 dark:bg-white/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="leading-tight tracking-tight mb-4 text-zinc-900 dark:text-white">
            <span className="block font-serif text-3xl sm:text-4xl md:text-6xl mb-2">
              Built for teamwork.
            </span>
            <span className="block font-sans font-bold text-3xl sm:text-4xl md:text-6xl">
              Designed for execution.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-serif px-4">
            DoneTogether gives student teams the clarity, structure, and momentum of professional tools.
          </p>
        </div>

        {/* Compact Grid with mobile optimization */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-800 rounded-[20px] p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-black/5 dark:border-white/5 group"
            >
              {/* Icon */}
              <div className="w-10 h-10 flex items-center justify-center border border-black/10 dark:border-white/10 rounded-full mb-4 text-zinc-900 dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-300">
                {f.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-black dark:text-white mb-2 font-sans">
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-snug font-s">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
