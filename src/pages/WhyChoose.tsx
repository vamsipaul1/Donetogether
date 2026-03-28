import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTheme } from "@/contexts/ThemeContext";
import { ShiningText } from "@/components/ui/shining-text";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const reasons = [
  {
    title: "Intelligent Roadmaps",
    description: "Generate actionable project milestones and step-by-step goals using ThinkSense AI.",
  },
  {
    title: "Live Team Sync",
    description: "Collaborate in real-time with integrated chat and instant task updates for perfect alignment.",
  },
  {
    title: "Unified Dashboard",
    description: "Manage tasks, timelines, and communication from one professional-grade interface.",
  },
  {
    title: "Smart Matchmaking",
    description: "Connect with compatible teammates based on their skills and shared project vision.",
  },
  {
    title: "Voice-Enabled Chat",
    description: "Communicate faster with high-fidelity voice messaging and automatic transcription.",
  },
  {
    title: "Progress Analytics",
    description: "Track project health with visual charts and AI-driven completion date predictions.",
  },
  {
    title: "Role Clarity",
    description: "Define clear ownership with specialized tools for team leaders and contributors.",
  },
  {
    title: "Secure Asset Hub",
    description: "Store and organize all project documents and assets in a secure, centralized workspace.",
  },
];

const GridBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.4] dark:opacity-[0.25]"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)`,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
      }}
    />
    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-50/50 dark:from-indigo-950/20 to-transparent blur-[120px]" />
  </div>
);

export default function WhyChoose() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-indigo-500/30">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />

      <main className="relative pt-32 pb-24 overflow-hidden">
        <GridBackground />

        <section className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-20 space-y-5">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-[50px] font-sans font-light text-zinc-900 dark:text-white leading-[1.1] tracking-[-0.025em] mb-16"
            >
              Why Choose DoneTogether?
            </motion.h1>

          </div>

          {/* Feature Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-6
              w-full
              max-w-[1280px]
              mx-auto
            "
          >
            {reasons.map((item, index) => {
              const lineColors = [
                '#6366f1', '#f59e42', '#10b981', '#f472b6',
                '#818cf8', '#38bdf8', '#facc15', '#4ade80'
              ];
              const accentColor = lineColors[index % 8];

              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{
                    y: -8,
                    scale: 1.01,
                  }}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    border-zinc-200 dark:border-zinc-800
                    bg-white dark:bg-zinc-900/60
                    backdrop-blur-md
                    p-8
                    flex flex-col
                    items-start
                    min-h-[220px]
                    transition-all
                    duration-500
                    hover:border-zinc-300 dark:hover:border-zinc-700
                    hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]
                    dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                  "
                >
                  {/* Top meta */}
                  <div className="relative z-[1] flex items-center gap-4 w-full mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <span
                        className="text-[17px] font-black tracking-tight"
                        style={{
                          color: accentColor,
                          textShadow: `0 0 20px ${accentColor}33`
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3
                      className="
                        font-body
                        font-bold
                        text-[18px]
                        sm:text-[20px]
                        text-zinc-900 dark:text-white
                        leading-tight
                        tracking-tight
                      "
                    >
                      {item.title}
                    </h3>
                  </div>

                  <p className="relative z-[1] flex-1 font-body text-[14.5px] leading-[22px] text-zinc-700 dark:text-zinc-400 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                    {item.description}
                  </p>

                  <div
                    className="mt-6 w-full h-[2px] rounded-full opacity-30 group-hover:opacity-100 transition-all duration-700 origin-left scale-x-[0.3] group-hover:scale-x-100"
                    style={{ background: accentColor }}
                  />
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

