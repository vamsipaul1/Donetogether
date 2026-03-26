import { motion } from 'framer-motion';
import { Circle, Globe, ArrowUpRight, Check } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

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
    <section
      id="features"
      className="relative isolate w-full py-24 border-t border-[#ece7d9] scroll-mt-28"
      style={{
        backgroundImage: 'url(/paper-texture.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#f3eee2]/72" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(15,23,42,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-5 sm:px-8 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="mx-auto w-full max-w-[980px] text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <span className="font-satoshi inline-flex items-center justify-center rounded-full border border-[#d8d0c1] bg-white/70 px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] text-[#4f4b43]/80 shadow-[0px_10px_30px_-16px_rgba(71,56,27,0.25)] font-semibold">
              Features
            </span>
            <h2 className="font-satoshi font-black tracking-[-0.04em] text-[#16161f] text-[42px] sm:text-[64px] leading-[1.02]">
              Built for teamwork.
              <span className="block">Designed for execution.</span>
            </h2>
            <p className="font-satoshi mx-auto max-w-[760px] text-[15px] sm:text-[16px] text-[#4b4f5b] opacity-90 leading-[1.6] font-medium">
              DoneTogether gives students and startup founders the clarity, structure, and momentum of professional tools.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                ...fadeUp,
                visible: {
                  ...fadeUp.visible,
                  transition: { duration: 0.55, delay: index * 0.06, ease: 'easeOut' },
                },
              }}
              whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
              className="group relative flex h-full min-h-[260px] flex-col rounded-[22px] border border-[#d9dce4] bg-white/55 p-6 shadow-[0px_22px_60px_-48px_rgba(15,15,20,0.55)] backdrop-blur-md transition-colors duration-300 hover:bg-white/70 hover:border-zinc-950/15"
            >
              <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/60 via-white/20 to-transparent opacity-70" />

              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cdd1db] bg-[#f3f3f6] text-[#20222a] shadow-[0px_8px_24px_-18px_rgba(0,0,0,0.35)] group-hover:scale-105 transition">
                {feature.icon}
              </div>

              <h3 className="font-satoshi text-[18px] sm:text-[20px] font-bold text-[#0b0c10] mb-2 tracking-[-0.015em] leading-[1.15]">
                {feature.title}
              </h3>

              <p className="text-[14px] sm:text-[15px] leading-[1.55] text-[#0b0c10] opacity-95 font-medium">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
