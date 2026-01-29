import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { BotMessageSquare, MessageSquareCode, PackageCheck, Handshake } from 'lucide-react';

const features = [
  {
    icon: BotMessageSquare,
    title: 'AI-Assisted Planning',
    description: 'Enter your project idea and let AI generate a structured roadmap with milestones, tasks, and weekly breakdowns suited for semester timelines.',
    gradient: 'from-blue-500/20 to-violet-500/20',
    iconColor: 'text-blue-500',
  },
  {
    icon: MessageSquareCode,
    title: 'Real-Time Collaboration',
    description: 'Contextual chat linked directly to tasks eliminates long, disorganized group chats. Keep discussions relevant and traceable.',
    gradient: 'from-emerald-500/20 to-cyan-500/20',
    iconColor: 'text-emerald-500',
  },
  {
    icon: PackageCheck,
    title: 'Task & Progress Tracking',
    description: 'Visual task board with live progress indicators. Clear task ownership and status visibility from To Do to Done.',
    gradient: 'from-orange-500/20 to-amber-500/20',
    iconColor: 'text-orange-500',
  },
  {
    icon: Handshake,
    title: 'Fair Contribution Visibility',
    description: 'Track individual participation through task updates. Prevent unequal workload distribution with transparent reporting.',
    gradient: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-500',
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className='bg-white dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-800 transition-colors shadow-sm rounded-[24px] h-full hover:shadow-md hover:border-zinc-500 hover:dark:border-amber-800'
    >
      <div className="relative h-full p-6 sm:p-8 rounded-[24px]">


        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 bg-white dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-800 transition-colors shadow-sm">
            <Icon className={`w-6 h-6 ${feature.iconColor}`} />
          </div>

          <h3 className="text-[19px] font-black text-zinc-900 dark:text-white mb-3 tracking-none group-hover:text-primary transition-colors duration-300">
            {feature.title}
          </h3>

          <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div >
  );
};

const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden dotted-pattern">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <span className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest">
              Powerful Features
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-zinc-900 dark:text-white mb-6 tracking-tighter leading-[1.1]">
            Everything You Need to <br />
            <span className="text-zinc-500">Succeed Together</span>
          </h2>

          <p className="text-lg sm:text-xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Built specifically for <span className="relative inline-block">
              <span className="text-orange-600 font-black">student projects</span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-orange-500/80 -rotate-1"
                viewBox="0 0 100 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M1 10C5 10 10 5 15 8C20 11 25 3 30 7C35 11 40 4 45 8C50 12 55 5 60 9C65 13 70 6 75 10C80 14 85 7 90 11C95 15 100 8 100 8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span> - not enterprises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
