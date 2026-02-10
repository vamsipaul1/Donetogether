import { motion } from 'framer-motion';
import { GitGraph, CopyMinus, Bot, Loader, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    icon: GitGraph,
    title: 'Create Your Project',
    tag: 'Setup',
    description: 'Set up your project workspace, invite team members, and define your goals to get started quickly.',
    color: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20'
  },
  {
    number: '02',
    icon: CopyMinus,
    title: 'Collaborate & Work',
    tag: 'Execution',
    description: 'Chat with your team, complete assigned tasks, and update progress as work moves forward efficiently.',
    color: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/20'
  },
  {
    number: '03',
    icon: Bot,
    title: 'Plan with AI',
    tag: 'Intelligence',
    description: 'Just enter your idea, and AI will plan the work, set milestones, and guide your project from start to finish.',
    color: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/20'
  },
  {
    number: '04',
    icon: Loader,
    title: 'Track & Finish',
    tag: 'Completion',
    description: 'Track progress, receive alerts, and finish your project on time. Celebrate your team\'s success together!',
    color: 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20'
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-black border-t border-black/5 dark:border-white/5 scroll-mt-28">
      <div className="container max-w-7xl mx-auto px-6">

        {/* Section Headline */}
        <div className="text-center mb-20">
          <h2 className="font-serif text-4xl md:text-5xl text-zinc-900 dark:text-white mb-6">
            How it works
          </h2>
        </div>

        {/* Horizontal Flow Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.number} className="relative flex flex-col items-center">

                {/* Connector Arrow (Desktop) */}
                {!isLast && (
                  <div className="hidden md:block absolute top-[2.5rem] left-[60%] w-[calc(100%-20%)] z-0 pointer-events-none">
                    <div className="w-full h-px border-t-2 border-dashed border-zinc-400 dark:border-zinc-800 relative">
                      <div className="absolute -right-1 -top-[5px] text-zinc-400 dark:text-zinc-800">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full relative z-10 flex flex-col items-center text-center group"
                >

                  {/* Icon Box - Floating Look */}
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-black/5 dark:border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${step.color} bg-white dark:bg-zinc-900`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Text Content */}
                  <div className="px-2">
                    <span className="block text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
                      Step {step.number}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3 font-sans">
                      {step.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                      {step.description}
                    </p>
                  </div>

                </motion.div>

                {/* Mobile Connector (Vertical) */}
                {!isLast && (
                  <div className="md:hidden h-12 w-px border-l-2 border-dashed border-zinc-200 dark:border-zinc-800 my-4" />
                )}

              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <Link to="/signup">
            <button className="text-[14px] font-semibold border-b border-black dark:border-white pb-0.5 hover:scale-110 transition-all font-mono">
              Start Your Project →
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
