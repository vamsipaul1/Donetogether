import { motion, Variants } from "framer-motion"
import { ArrowRight as ArrowIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
}

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

const HeroSection = () => {
  const { user } = useAuth()

  return (
    <section className="relative isolate min-h-screen flex items-center justify-center bg-white text-[#0b0c10] overflow-hidden">

      {/* ANIMATED CUBE GRID SYSTEM (High-Fidelity Match) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-white">

        {/* The Grid Container */}
        <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 xl:grid-cols-18 gap-2 p-2 opacity-[0.8]">
          {Array.from({ length: 180 }).map((_, i) => {
            const col = i % 18;
            const row = Math.floor(i / 18);

            // Logic to color only the top and sides, fading to white in the middle/bottom
            // We want it heavy at the top and fading down.
            // col 0-4 (Blue vibe), col 5-9 (Purple vibe), col 10-18 (Pink/Rose vibe)

            let colorClass = "bg-transparent";
            let opacity = 0;

            if (row < 5) {
              // Calculate opacity based on row (fade down)
              opacity = Math.max(0, 1 - (row * 0.22));

              if (col < 6) colorClass = "bg-blue-400";
              else if (col < 12) colorClass = "bg-purple-400";
              else colorClass = "bg-rose-400";

              // Reduce intensity towards the center x-axis slightly
              const centerDist = Math.abs(col - 9);
              opacity *= (0.4 + (centerDist / 9) * 0.6);
            }

            // Exclude the bottom right area as marked in the user's image (approx row 3-5, col 14-18)
            if (row >= 3 && col >= 14) opacity = 0;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: opacity * 0.15,
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className={`aspect-square rounded-[12px] ${colorClass} blur-[20px]`}
              />
            );
          })}
        </div>

        {/* The Video (Restored for Full Vibrancy) */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-[0.85] contrast-[1.15] saturate-[1.6] transform scale-y-[-1] transition-opacity duration-1000 mix-blend-multiply"
          autoPlay
          loop
          muted
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
            type="video/mp4"
          />
        </video>

        {/* Global Fades for center clarity and white block reduction */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20" />
      </div>

      {/* FLOATING UI ELEMENTS (CodeDale Stacked System - Temporarily Disabled) 
      <div className="absolute inset-x-0 h-full max-w-[1800px] mx-auto pointer-events-none z-10 hidden xl:block text-zinc-950">
        <motion.div
          initial={{ opacity: 0, x: -30, rotate: -12 }}
          animate={{ opacity: 1, x: 0, rotate: -8 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          className="absolute left-4 top-[46%] w-[280px]"
        >
          <div className="absolute inset-0 bg-zinc-50 border border-zinc-100 rounded-[28px] translate-x-1.5 -translate-y-1.5 rotate-[2deg] opacity-40 shadow-sm" />
          <div className="relative bg-white p-6 rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-zinc-100 flex flex-col gap-4">
            <span className="absolute top-5 right-7 text-indigo-700 opacity-20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.437.917-4 3.638-4 5.849h3.999v10h-9.995z" /></svg>
            </span>
            <p className="font-body text-[13px] font-semibold leading-relaxed tracking-tight text-zinc-700">
              "We were close to giving up. DoneTogether rebuilt our confidence and delivered amazing results."
            </p>
            <span className="font-body text-[11px] font-bold text-zinc-900 tracking-tight">
              - Narasimha Reddy, CEO, TFS
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30, rotate: 12 }}
          animate={{ opacity: 1, x: 0, rotate: 8 }}
          transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
          className="absolute right-4 top-[46%] w-[280px]"
        >
          <div className="absolute inset-0 bg-zinc-50 border border-zinc-100 rounded-[28px] -translate-x-1.5 translate-y-1.5 -rotate-[2deg] opacity-40 shadow-sm" />
          <div className="relative bg-white p-6 rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] border border-zinc-100 flex flex-col gap-4">
            <span className="absolute top-5 right-7 text-indigo-500 opacity-20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.437.917-4 3.638-4 5.849h3.999v10h-9.995z" /></svg>
            </span>
            <p className="font-body text-[13px] font-semibold leading-relaxed tracking-tight text-zinc-700">
              "Finally found a platform that makes collaboration feel like progress, not a chore."
            </p>
            <span className="font-body text-[11px] font-bold text-zinc-900 tracking-tight">
              - Sujith Reddy Gopu, CEO, Fluent
            </span>
          </div>
        </motion.div>
      </div> */}

      {/* CONTENT SYSTEM */}
      <div className="relative w-full flex justify-center z-20 mt-12 sm:mt-0">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex w-full max-w-5xl flex-col items-center text-center px-6 py-20 sm:py-32"
        >
          {/* TOP BADGE (High-Fidelity Restoration) */}
          <motion.div
            variants={fadeUp}
            className="group cursor-pointer inline-flex items-center rounded-full bg-white/40 backdrop-blur-xl border border-white/40 text-[12.5px] font-semibold text-slate-950 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:bg-white/60 transition-all mb-4"
          >
            <Link
              to={user ? "/project-room" : "/signup"}
              className="flex items-center gap-3 pl-1 pr-1.5 py-1"
            >
              <div className="flex items-center gap-2.5 px-2">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.3)]"></span>
                </div>
                <span className="font-body font-normal text-[14px] leading-[22px] tracking-[-0.01em] text-zinc-800 antialiased whitespace-nowrap">
                  New teams are joining every week!
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#262626] flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
            </Link>
          </motion.div>

          {/* HEADING (The Narrative) */}
          <motion.div variants={fadeUp} className="max-w-[440px] sm:max-w-4xl">
            <h1
              className="
                  font-sans
                  font-[600]
                  text-[34px]
                  sm:text-[52px]
                  leading-[48px]
                  sm:leading-[68px]
                  tracking-[-0.05em]
                  sm:tracking-[-0.03em]
                  text-slate-950
                "
            >
              Ideas Are Easy.
              <br className="hidden sm:block" />
              Execution Needs the Right Team.
            </h1>
          </motion.div>

          {/* SUBTEXT (The Clarity) */}
          <motion.p
            variants={fadeUp}
            className="
              font-body
              text-[15px]
              sm:text-[17px]
              leading-[24px]
              sm:leading-[26px]
              tracking-[-0.02em]
              sm:tracking-[-0.03em]
              text-slate-900
              max-w-[340px]
              sm:max-w-[500px]
              mx-auto
              mt-4
              antialiased
            "
          >
            Built for students and startup founders to plan, collaborate,
            and execute with clarity from first idea to final delivery.
          </motion.p>

          {/* CTA & TRUST (Action System) */}
          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-6">
            <Link to={user ? "/project-room" : "/signup"}>
              <button
                className="
                  font-body
                  relative
                  text-sm
                  font-semibold
                  rounded-full
                  h-14
                  px-8
                  pr-16
                  bg-[#1a1a2a]
                  text-white
                  group
                  transition-all
                  duration-500
                  hover:pl-16
                  hover:pr-7
                  inline-flex
                  items-center
                  justify-center
                  overflow-visible
                  shadow-[0_16px_44px_-26px_rgba(0,0,0,0.65)]
                
                "
              >
                <span className="relative z-10 whitespace-nowrap">Create Your Team</span>

                <div
                  className="
                    absolute
                    right-1
                    w-12
                    h-12
                    bg-zinc-700
                    text-white
                    rounded-full
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-500
                    group-hover:right-[calc(100%-52px)]
                  "
                >
                  <ArrowIcon size={20} strokeWidth={3} />
                </div>
              </button>
            </Link>

            {/* SOCIAL PROOF (Horizontal Row) */}
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-1000">
              <div className="flex -space-x-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-4 h-4 text-[#0b0c10] fill-[#0b0c10]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              <span className="font-body
              text-[14px]
              leading-[24px]
              tracking-[-0.02em]
              text-zinc-700
              antialiased">Trusted by 10+ teams</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

    </section >
  )
}

export default HeroSection