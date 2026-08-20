import { motion, Variants } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { preloadRoute } from "@/utils/preload"
import { lazyRoutes } from "@/App"

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
    <section className="relative min-h-[90vh] flex items-center bg-[#033ad2] overflow-hidden pt-20 sm:pt-0">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0 bg-[#033ad2]">
        <img
          src="/bgbg.png"
          alt="Background"
          className="w-full h-full object-cover object-bottom"
        />
      </div>

      {/* ABSOLUTE MOBILE HAND */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="hidden lg:block absolute right-[4%] xl:right-[12%] bottom-0 w-[350px] lg:w-[450px] xl:w-[400px] pointer-events-none z-10"
      >
        <img
          src="/mobilehand.png"
          alt="Mobile App"
          className="w-full h-auto object-contain object-bottom"
        />
      </motion.div>

      {/* CONTENT SYSTEM */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT COLUMN - TEXT */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col items-start text-left lg:pl-24 xl:pl-32"
        >
          {/* TOP TAGLINE */}
          <motion.div variants={fadeUp} className="mb-4">
            <span className="font-body font-bold text-sm tracking-wide text-[#ffdede]">
              Build Together. Make It Happen.
            </span>
          </motion.div>

          {/* HEADING */}
          <motion.div variants={fadeUp} className="max-w-2xl">
            <h1
              className="
                  font-sans
                  font-[600]
                  text-[40px]
                  xs:text-[46px]
                  sm:text-[56px]
                  leading-[1.05]
                  tracking-[-0.04em]
                  text-[#ffebeb]
                  !text-[#ffebeb]
                  mb-6
                "
            >
              Ideas Are Easy.<br />
              Execution Needs<br />
              the Right Team.
            </h1>
          </motion.div>

          {/* SUBTEXT */}
          <motion.p
            variants={fadeUp}
            className="
              font-body
              text-[15px]
              sm:text-[19px]
              leading-[1.5]
              text-white/95
              max-w-[400px]
              mb-10
              antialiased
            "
          >
            WeMakeIt helps student teams plan projects, manage tasks, chat in context, and deliver exceptional results → together.
          </motion.p>

          {/* BUTTONS */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mb-12">
            <Link
              to={user ? "/project-room" : "/signup"}
              onMouseEnter={() => preloadRoute(user ? lazyRoutes.Dashboard : lazyRoutes.SignUp)}
              onTouchStart={() => preloadRoute(user ? lazyRoutes.Dashboard : lazyRoutes.SignUp)}
            >
              <button
                className="
                  font-body
                  text-[15px]
                  font-semibold
                  rounded-xl
                  h-14
                  px-8
                  bg-white
                  text-[#0232ca]
                  group
                  transition-all
                  hover:bg-gray-50
                  inline-flex
                  items-center
                  justify-center
                  shadow-sm
                  gap-2
                "
              >
                Create Your Team
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            <button
              className="
                font-body
                text-[15px]
                font-semibold
                rounded-xl
                h-14
                px-8
                bg-white/10
                text-white
                transition-all
                hover:bg-white/20
                inline-flex
                items-center
                justify-center
                gap-3
              "
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Play size={12} fill="currentColor" />
              </div>
              See How It Works
            </button>
          </motion.div>

          {/* SOCIAL PROOF */}
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0d47ff] overflow-hidden bg-white/20">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt={`User ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ))}
              </div>
              <span className="font-body text-[13px] font-medium text-white/90 antialiased">
                Trusted by 500+ student teams
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN - EMPTY SPACE FOR BACKGROUND PHONE */}
        <div className="hidden lg:block relative lg:h-full pointer-events-none"></div>
      </div>
    </section >
  )
}

export default HeroSection;