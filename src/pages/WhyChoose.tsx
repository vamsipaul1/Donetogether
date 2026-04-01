import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    description:
      "Stay on track with built-in accountability mechanisms that keep you and your team motivated and committed to your goals.",
  },
  {
    title: "Real-Time Collaboration",
    description:
      "Work together seamlessly with live updates, shared workspaces, and instant communication tools designed for modern teams.",
  },
  {
    title: "Progress Visibility",
    description:
      "Get a crystal-clear view of every milestone, task, and deadline with dashboards that make progress impossible to miss.",
  },
  {
    title: "Proof of Completion",
    description:
      "Submit and verify task completion with evidence-based proof features, so achievements are always recognized and validated.",
  },
  {
    title: "Smart Reminders",
    description:
      "Never miss a deadline again with intelligent reminders that adapt to your schedule and keep priorities front and center.",
  },
  {
    title: "Team Motivation",
    description:
      "Celebrate wins, track streaks, and encourage one another with built-in motivation tools that make progress rewarding.",
  },
  {
    title: "Flexible Goal Setting",
    description:
      "Set personal or team goals of any size, break them into actionable steps, and adjust as your priorities evolve.",
  },
  {
    title: "Secure & Private",
    description:
      "Your data is protected with enterprise-grade security so you can collaborate with confidence and full peace of mind.",
  },
];

export default function WhyChoose() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-4">
        <section className="max-w-[1440px] mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-4"
          >
            <span className="inline-block rounded-full border border-border/60 bg-background/40 px-4 py-1.5 text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
              Why DoneTogether?
            </span>
            <h1 className="font-sans font-bold text-4xl md:text-5xl xl:text-6xl tracking-tight leading-tight text-foreground text-balance">
              Built for teams that{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                actually get things done
              </span>
            </h1>
            <p className="mt-5 max-w-2xl mx-auto font-body text-base md:text-lg text-muted-foreground text-balance leading-relaxed">
              DoneTogether combines accountability, collaboration, and smart
              progress tracking — giving your team every reason to stay aligned
              and finish strong.
            </p>
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
              gap-8
              px-2
              md:px-8
              xl:px-16
              w-full
              max-w-[1440px]
              mx-auto
            "
          >
            {reasons.map((item, index) => {
              const lineColors = [
                'linear-gradient(90deg,#6366f1,#60a5fa)',
                'linear-gradient(90deg,#f59e42,#fbbf24)',
                'linear-gradient(90deg,#10b981,#34d399)',
                'linear-gradient(90deg,#f472b6,#f87171)',
                'linear-gradient(90deg,#818cf8,#a5b4fc)',
                'linear-gradient(90deg,#38bdf8,#0ea5e9)',
                'linear-gradient(90deg,#facc15,#fde68a)',
                'linear-gradient(90deg,#4ade80,#22d3ee)',
              ];
              const lineColor = lineColors[index % 8];
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  whileHover={{
                    y: -10,
                    scale: 1.045,
                    boxShadow: "0 8px 32px 0 rgba(80,80,180,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.04)"
                  }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-border/60
                    bg-white dark:bg-zinc-950/90
                    shadow-[0_2px_12px_rgba(80,80,180,0.04)]
                    backdrop-blur-md
                    px-8
                    py-7
                    md:px-10
                    md:py-8
                    flex flex-col
                    items-stretch
                    justify-between
                    min-h-[200px]
                    transition-all
                    duration-300
                    hover:border-border
                    hover:ring-2
                    hover:ring-border/60
                    hover:shadow-xl
                    motion-reduce:transition-none
                    motion-reduce:hover:transform-none
                  "
                >
                  {/* sheen */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-muted/35 via-transparent to-muted/15" />

                  {/* top meta */}
                  <div className="relative z-[1] flex flex-col gap-2 items-start w-full">
                    <div className="flex items-center gap-2 w-full">
                      <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1 font-body text-[12px] leading-none tracking-[-0.01em] text-foreground/80">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3
                        className="
                          relative
                          z-[1]
                          font-sans
                          font-semibold
                          text-[18px] md:text-[19px] xl:text-[20px]
                          leading-tight
                          tracking-[-0.02em]
                          text-foreground
                          text-balance
                          line-clamp-2
                          min-h-[2.7em]
                          flex-1
                          truncate
                        "
                      >
                        <span className="block w-full truncate">{item.title}</span>
                        <motion.div
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: 0.15 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                          className="origin-left mt-2 h-[4px] w-full rounded-full"
                          style={{ background: lineColor }}
                        />
                      </h3>
                    </div>
                  </div>

                  <p className="relative z-[1] mt-4 font-body text-[15.5px] leading-[23px] text-muted-foreground line-clamp-2 min-h-[2.7em] text-balance">
                    {item.description}
                  </p>
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