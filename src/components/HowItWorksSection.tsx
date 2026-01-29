import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { GitGraph, CopyMinus, Bot, Loader, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: GitGraph,
    title: 'Create Your Project',
    description: 'Set up your project workspace, invite team members, and define your goals to get started quickly.',
  },

  {
    number: '02',
    icon: CopyMinus,
    title: 'Collaborate & Work',
    description: 'Chat with your team, complete assigned tasks, and update progress as work moves forward efficiently.',
  },

  {
    number: '03',
    icon: Bot,
    title: 'Plan with AI',
    description: 'Just enter your idea, and AI will plan the work, set milestones, and guide your project from start to finish.',
  },
  {
    number: '04',
    icon: Loader,
    title: 'Track Progress & Finish',
    description: 'Track progress, receive alerts, and finish your project on time. Celebrate your team\'s success together!',
  },
];

const HowItWorksSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (

    <section id="how-it-works" className="py-12 sm:py-16 relative overflow-hidden dotted-pattern">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-2"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest">
              Simple steps


            </span>
            <br />
            <br />
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-white mb-4 tracking-normal">
            How it <span className="text-blue-500">works</span>
          </h2>
          <p className="text-lg text-zinc-500 font-medium leading-relaxed">
            No confusion or delays. Just fast and reliable collaboration.
          </p>
        </motion.div>

        {/* Main content - Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left - Image with beautiful borders */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Main image with professional styling */}
            <div className="relative rounded-2xl ml-0 overflow-fill w-[570px] h-[380px] shadow-md bg-white dark:bg-gray-900 hover:scale-[1.02] transition-transform duration-300">
              <img
                src="/image.png"
                alt="Students collaborating on project"
                className=" h-full object-fill rounded-2xl aspect-video "

              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/3 via-transparent to-transparent pointer-events-none rounded-2xl" />
            </div>

          </motion.div>

          {/* Right - Steps */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-7 space-y-1"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;

              return (
                <div key={step.number}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="group flex gap-4 p-4 rounded-[24px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all duration-300 hover:shadow-md"

                  >
                    {/* Step numbers 1,2,3,4 */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-black text-sm">
                        {step.number}
                      </div>
                    </div>

                    {/* Icon and content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-7 h-7 flex items-center justify-center text-primary">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="text-[17px] font-bold text-zinc-900 dark:text-white tracking-tight">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed pl-1">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Arrow separator */}
                  {!isLast && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="flex justify-center lg:justify-start lg:ml-6 py-0.5"
                    >
                      <div className="rounded-full p-1">
                        <ArrowRight className="w-3 h-3 text-zinc-500 rotate-90" />
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
