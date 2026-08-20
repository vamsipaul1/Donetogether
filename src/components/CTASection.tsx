import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { preloadRoute } from '@/utils/preload';
import { lazyRoutes } from '@/App';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  }
};

export default function CTASection() {
  const { user } = useAuth();

  return (
    <section className="w-full bg-white py-20 sm:py-24 md:py-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ staggerChildren: 0.15 }}
        className="max-w-[1200px] mx-auto px-6 sm:px-12 lg:px-24 text-left"
      >
        {/* Heading */}
        <motion.h2
          variants={fadeUp}
          style={{ color: '#2563eb' }}
          className="
            font-sans
            font-bold
            text-4xl sm:text-5xl md:text-6xl lg:text-[54px]
            tracking-tight
            mb-6 
            leading-[1.1]
            max-w-[800px]
          "
        >
          You've seen how it works.<br /> Now put it to work.
        </motion.h2>

        {/* Subheading */}
        <motion.p
          variants={fadeUp}
          className="
            font-body
            text-[17px] sm:text-[18px] 
            text-zinc-700 
            mb-10 
            max-w-[540px] 
            leading-[1.6]
            tracking-tight
            antialiased
          "
        >
          Get started with WeMakeIt and start resolving more team issues. Try it for free and see the impact for yourself.
        </motion.p>

        {/* Button */}
        <motion.div variants={fadeUp}>
          <Link
            to={user ? "/project-room" : "/signup"}
            onMouseEnter={() => preloadRoute(user ? lazyRoutes.Dashboard : lazyRoutes.SignUp)}
            onTouchStart={() => preloadRoute(user ? lazyRoutes.Dashboard : lazyRoutes.SignUp)}
          >
            <button
              className="
                group
                inline-flex
                items-center
                justify-center
                gap-2.5
                bg-[#2563eb] 
                text-white 
                px-6 
                py-3
                text-[15px] 
                font-bold 
                font-body
                rounded-xl
                transition-all
                duration-300
                hover:bg-[#1d4ed8]
                hover:shadow-lg hover:shadow-blue-500/20
                active:scale-95
              "
            >
              Get Started
              <ArrowRight size={17} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
