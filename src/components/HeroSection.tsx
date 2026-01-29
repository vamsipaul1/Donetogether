import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden dotted-pattern">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-10"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="font-medium text-muted-foreground tracking-wider">
              From idea to clear plan&nbsp;


            </span>
          </motion.div>

          {/* Two-tone Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-8xl font-bold tracking-tight px-2 pl-2 mb-8"
          >
            <span className="text-foreground"> One Platform</span>
            <br />
            <span className="text-foreground">For </span>
            <span className="text-muted-foreground font-semibold">Student Teams</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed"
          >

            Plan. Collaborate. Execute.
            Everything student projects need to deliver better work together.
            <br />

          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/signup">
              <Button
                size="lg"
                className="rounded-full px-9 py-7 text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
              >
                Start Your Project
                <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Floating "Say Hello" button - positioned absolutely */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="absolute right-[10%] absolute-top[10%] top-1/2 mb-20 hidden lg:block"
          >
            <span className="rounded-full px-3 py-3 text-sm font-medium bg-black text-white">
              Hello Students!
            </span>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
