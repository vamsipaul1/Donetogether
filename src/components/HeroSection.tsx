import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
}

const stagger = {
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
    <section className="relative isolate min-h-screen flex items-start justify-center bg-white text-[#0b0c10] overflow-hidden">

      {/* VIDEO */}
      <div className="absolute inset-0">
        <video
          className="w-full h-full object-cover [transform:scaleY(-1)]"
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

        <div className="absolute inset-0 bg-gradient-to-b from-[26.416%] from-transparent to-white" />
      </div>

      <div className="relative w-full flex justify-center">

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex w-full max-w-[1200px] flex-col items-center text-center gap-6 px-6 sm:px-10 pt-[290px] pb-24"
        >

          {/* TITLE */}
          <motion.div
            variants={fadeUp}
            className="space-y-4 -mt-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter text-black dark:text-white mb-4 sm:mb-6 leading-tight px-2]">
              <span className="block">Build Faster</span>
              <span className="block">With Right Team.</span>
            </h2>
          </motion.div>

          {/* TEXT */}
          <motion.p
            variants={fadeUp}
            className="
              text-[16px]
              sm:text-[18px]
              leading-[1.7]
              text-slate-600

              -mt-2 sm:-mt-3

              max-w-[640px]
              mx-auto
            "
          >
            Built for students and startup founders to plan, collaborate,
            and execute with clarity from first idea to final delivery.
          </motion.p>

          {/* BUTTON WITH ICON LOGIC ADDED HERE */}
          <motion.div variants={fadeUp} className="w-full max-w-[780px]">

            <div className="flex items-center justify-center">

              <Link
                to={user ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto"
              >

               <button
  className="
  relative
  text-sm
  font-semibold
  rounded-full
  h-14
  px-7
  pr-16
  bg-black
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
  <span className="relative z-10 whitespace-nowrap">
    Create Project Room
  </span>

  <div
    className="
    absolute
    right-1
    w-12
    h-12
    bg-white
    text-black
    rounded-full
    flex
    items-center
    justify-center
    transition-all
    duration-500
    group-hover:right-[calc(100%-52px)]
    group-hover:rotate-45
"
  >
    <ArrowUpRight size={18} />
  </div>
</button>

              </Link>

            </div>

          </motion.div>

        </motion.div>

      </div>
    </section>
  )
}

export default HeroSection