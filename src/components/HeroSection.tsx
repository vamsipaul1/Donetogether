import { motion, Variants } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
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
      </div>


      {/* CONTENT */}
      <div className="relative w-full flex justify-center">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="
              flex
              w-full
              max-w-5xl
              flex-col
              items-center
              text-center
              gap-6
              sm:gap-8
              px-6
              sm:px-8
              py-20
              sm:py-32
              mx-auto
            "
          >

            {/* HEADING */}
            <motion.div variants={fadeUp} className="max-w-[400px] sm:max-w-none">

              <h1
                className="
                  font-sans
                  font-[650]
                  text-[38px]
                  sm:text-[64px]
                  leading-[44px]
                  sm:leading-[72px]
                  tracking-[-0.03em]
                  sm:tracking-[-0.02em]
                "
              >
                Build Faster
                <br />
                With Right Team.
              </h1>

            </motion.div>


            {/* SUBHEADING */}
            <motion.p
              variants={fadeUp}
              className="
      font-body

      text-[15px]
      sm:text-[16.5px]
      leading-[22px]
      sm:leading-[24px]

      tracking-[-0.02em]
      sm:tracking-[-0.03em]

      text-zinc-700
      dark:text-zinc-300

      max-w-[340px]
      sm:max-w-[480px]

      mx-auto

      antialiased
    "
            >
              Built for students and startup founders to plan, collaborate,
              and execute with clarity from first idea to final delivery.
            </motion.p>


          {/* BUTTON */}
          <motion.div variants={fadeUp} className="mt-2">

            <Link to={user ? "/dashboard" : "/signup"}>

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

          </motion.div>

        </motion.div>

      </div>

    </section>
  )
}

export default HeroSection