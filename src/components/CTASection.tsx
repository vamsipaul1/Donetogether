import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="about" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl target-10 mx-auto"
        >
          <div className="moving-gradient-border rounded-[32px] shadow-2xl shadow-zinc-500/10">
            <div className="moving-gradient-border-content relative p-8 sm:p-12 lg:p-16 rounded-[32px] overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 text-center">
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Ready to Transform Your{' '}
                  <span className="text-orange-500">Group Projects?</span>
                </h2>

                {/* Description */}
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                  An intelligent collaboration platform designed to help student teams organize tasks, work together efficiently, and complete projects on time.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg"
                    className="rounded-full px-10 py-8 text-lg font-black bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-all duration-300 group shadow-xl"
                  >
                    <Link to="/signup" className="flex items-center">
                      Get Started Free
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
