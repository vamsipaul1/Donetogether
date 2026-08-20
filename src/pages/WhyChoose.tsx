import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  ShieldCheck, 
  Users2, 
  BarChart3, 
  FileCheck2, 
  BellRing, 
  Trophy, 
  Target, 
  Lock 
} from "lucide-react";

const FontLoader = () => (
  <style>{`
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,900&display=swap');
    .hiw-header, .hiw-header * { font-family: 'Satoshi', sans-serif; }
    .hiw-header { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  `}</style>
);

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const reasons = [
  {
    title: "Accountability That Works",
    description: "Stay on track with built-in mechanisms that keep your team motivated and committed.",
    icon: ShieldCheck,
  },
  {
    title: "Real-Time Collaboration",
    description: "Work seamlessly with live updates and shared workspaces designed for modern teams.",
    icon: Users2,
  },
  {
    title: "Progress Visibility",
    description: "Get a clear view of every milestone and deadline with intuitive progress dashboards.",
    icon: BarChart3,
  },
  {
    title: "Proof of Completion",
    description: "Submit and verify task completion with evidence-based features for recognized achievements.",
    icon: FileCheck2,
  },
  {
    title: "Smart Reminders",
    description: "Never miss a deadline with intelligent alerts that adapt to your team's specific schedule.",
    icon: BellRing,
  },
  {
    title: "Team Motivation",
    description: "Celebrate wins and track streaks with tools that make progress genuinely rewarding.",
    icon: Trophy,
  },
  {
    title: "Flexible Goal Setting",
    description: "Set personal or team goals, break them into steps, and adjust as priorities evolve.",
    icon: Target,
  },
  {
    title: "Secure & Private",
    description: "Protect your data with enterprise-grade security for full peace of mind while collaborating.",
    icon: Lock,
  },
];

export default function WhyChoose() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <FontLoader />
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-4">
        <section className="max-w-[1440px] mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <h1 className="font-body text-[32px] sm:text-[42px] font-bold tracking-tight text-zinc-900">
              Why WeMakeIt?
            </h1>
          </motion.div>

          {/* Cards Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.06,
                  delayChildren: 0.05,
                },
              },
            }}
            className="
              mt-16
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-4
              gap-6
              px-4
              md:px-8
              xl:px-12
              w-full
              max-w-[1440px]
              mx-auto
            "
          >
            {reasons.map((item, index) => {
              const lineColors = [
                'linear-gradient(90deg, #6366f1, #3b82f6)', // Indigo - Blue
                'linear-gradient(90deg, #a855f7, #ec4899)', // Purple - Pink
                'linear-gradient(90deg, #10b981, #06b6d4)', // Emerald - Cyan
                'linear-gradient(90deg, #f59e0b, #ef4444)', // Amber - Red
                'linear-gradient(90deg, #eab308, #fbbf24)', // Golden - Amber
                'linear-gradient(90deg, #f43f5e, #fb923c)', // Rose - Orange
                'linear-gradient(90deg, #8b5cf6, #d946ef)', // Violet - Fuchsia
                'linear-gradient(90deg, #22c55e, #84cc16)', // Green - Lime
              ];
              const lineColor = lineColors[index % 8];
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{
                    y: -5,
                    scale: 1.02,
                    boxShadow: "0 12px 24px -8px rgba(0,0,0,0.08)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-border/60
                    bg-white dark:bg-zinc-950
                    shadow-sm
                    p-6
                    flex flex-col
                    items-stretch
                    min-h-[190px]
                    transition-all
                    duration-300
                    hover:border-zinc-300
                  "
                >
                  {/* number and text container side-by-side */}
                  <div className="relative z-10 flex gap-4 items-start">
                    {/* far left icon with animation */}
                    <div className="shrink-0 pt-1">
                      <motion.div 
                        whileHover={{ rotate: 12, scale: 1.3, y: -2 }}
                        className="flex items-center justify-center w-8 h-8"
                        style={{ color: lineColor.split(',')[1].trim() }}
                      >
                        <item.icon size={22} strokeWidth={2.5} />
                      </motion.div>
                    </div>

                    {/* text content aligned with number */}
                    <div className="flex flex-col gap-1.5 flex-1">
                      <h3
                        className="
                          font-body
                          font-bold
                          text-[17px]
                          leading-tight
                          tracking-tight
                          text-zinc-900
                        "
                      >
                        {item.title}
                      </h3>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.15 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="origin-left h-[2.5px] w-full rounded-full"
                        style={{ background: lineColor }}
                      />

                      <p className="mt-4 font-body text-[14px] leading-[22px] text-slate-800 antialiased">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* subtle sheen */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-zinc-50/50 to-transparent" />
                </motion.div>
              );
            })}
          </motion.div>

        </section>

      </main>

      <Footer />

    </div>
  );
}