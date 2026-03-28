import { motion } from "framer-motion";
import clsx from "clsx";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function FeaturesSection() {
  const features = [
    {
      title: "AI-Assisted Planning",
      desc:
        "Enter your idea and generate a structured roadmap with milestones and weekly goals.",
      featured: true,
    },
    {
      title: "Real-Time Collaboration",
      desc:
        "Chat directly inside tasks. Keep discussions relevant, traceable, and connected to work.",
    },
    {
      title: "Task & Progress Tracking",
      desc:
        "Visual boards with clear ownership and live progress from idea to completion.",
    },
    {
      title: "Contribution Visibility",
      desc:
        "See who is doing what. Avoid imbalance with transparent activity tracking.",
    },
  ];

  return (
    <section
      id="features"
      className="
        relative
        isolate
        w-full
        py-28
        pt-16
        border-t
        border-border
        scroll-mt-28
        overflow-hidden
        bg-background
      "
    >
      {/* soft section tint (DrawKit-like) */}
      <div className="absolute inset-0 bg-muted/35" />

      {/* subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      {/* dots */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.08]
          [background-image:radial-gradient(rgba(20,20,30,0.18)_1px,transparent_1px)]
          [background-size:18px_18px]
        "
      />

      {/* container */}
      <div className="relative mx-auto max-w-[1280px] px-6 gap-6">

        {/* HEADER */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center max-w-[760px] mx-auto"
        >

          <h2
            className="
              font-sans
              font-[500]

              text-[32px]
              sm:text-[48px]

              leading-[1.05]

              tracking-[-0.03em]

              text-zinc-900

              
            "
          >
            Structure. Clarity. Execution.
          </h2>

          <p
            className="
              font-body

              text-[16px]
              leading-[24px]

              text-zinc-800

              mt-7

              max-w-[560px]
              mx-auto
            "
          >
            DoneTogether gives students and founders the structure,
            clarity, and speed of professional product teams.
          </p>
        </motion.div>

        {/* GRID */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-6
            mt-16
          "
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-10px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.21, 1.11, 0.81, 0.99]
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 14 }
              }}
              className={clsx(
                "group relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm p-8",
                "transition duration-300 hover:border-border hover:ring-2 hover:ring-border/60 hover:shadow-lg",
                "motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:hover:shadow-none motion-reduce:hover:ring-0",
                feature.featured && "ring-2 ring-border/60",
              )}
            >

              {/* hover highlight */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-muted/35 via-transparent to-muted/15" />

              {/* top row (no icons) */}
              <div className="relative z-[1] flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1 font-body text-[12px] leading-none tracking-[-0.01em] text-foreground/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {feature.featured ? (
                      <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/35 px-3 py-1 font-body text-[12px] leading-none tracking-[-0.01em] text-foreground/80">
                        Core
                      </span>
                    ) : null}
                  </div>

                  {/* title */}
                  <h3
                    className="
                      mt-5
                      font-body
                      font-semibold
                      text-[18px]
                      sm:text-[19px]
                      leading-tight
                      tracking-[-0.02em]
                    "
                  >
                    <span
                      className={clsx(
                        "bg-clip-text text-transparent",
                        [
                          "bg-gradient-to-r from-indigo-500 to-blue-400",
                          "bg-gradient-to-r from-pink-500 to-fuchsia-400",
                          "bg-gradient-to-r from-emerald-500 to-lime-400",
                          "bg-gradient-to-r from-orange-400 to-yellow-300",
                        ][index % 4]
                      )}
                    >
                      {feature.title}
                    </span>
                  </h3>
                </div>
              </div>

              {/* desc */}
              <p
                className="
                  relative
                  z-[1]
                  font-body
                  text-[14.5px]
                  leading-[22px]
                  text-zinc-800
                  mt-3
                "
              >
                {feature.desc}
              </p>

              {/* bottom accent */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-90" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}