import { motion } from 'framer-motion';
import { GitGraph, CopyMinus, Bot, Loader, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    icon: GitGraph,
    title: 'Create Your Project',
    description: 'Set up your workspace, invite teammates, and define your goal—whether it’s a project or an MVP.',
    color: 'text-blue-600'
  },
  {
    number: '02',
    icon: CopyMinus,
    title: 'Collaborate & Work',
    description: 'Chat with your team, complete assigned tasks, and update progress as work moves forward efficiently.',
    color: 'text-emerald-600'
  },
  {
    number: '03',
    icon: Bot,
    title: 'Plan with AI',
    description: 'Enter your idea and let AI outline milestones, weekly goals, and next steps from start to launch.',
    color: 'text-amber-600'
  },
  {
    number: '04',
    icon: Loader,
    title: 'Track & Finish',
    description: 'Track progress, receive alerts, and finish your project on time. Celebrate your team\'s success together!',
    color: 'text-purple-600'
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="relative isolate py-24 bg-white border-t border-[#eceef2] scroll-mt-28"
    >
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-16 px-6 sm:px-10">

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          className="mx-auto w-full max-w-[980px] text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <span className="inline-flex items-center justify-center rounded-full border border-[#d6d8df] bg-white/80 px-4 py-1.5 text-[11px] uppercase tracking-[0.24em] text-[#373a46]/70 shadow-[0px_10px_30px_-16px_rgba(194,194,194,0.25)] font-semibold">
              How it works
            </span>
            <h2 className="font-semibold tracking-[-0.04em] text-[#0b0c10] text-[40px] sm:text-[60px] leading-[1.04]">
              How it works
            </h2>
            <p className="mx-auto max-w-[760px] text-[15px] sm:text-[16px] text-[#6b7280] leading-[1.65]">
              For students and startup founders: create a workspace, collaborate, let AI plan, and ship on time.
            </p>
          </div>
        </motion.div>

        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          {/* dashed connectors (desktop only) */}
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[38px] hidden md:block border-t-2 border-dashed border-[#cfd3dc]" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.55, delay: index * 0.08 } } }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="flex h-[82px] w-[82px] items-center justify-center rounded-[18px] border border-[#eceef2] bg-white shadow-[0px_12px_40px_-28px_rgba(15,15,20,0.35)]">
                  <Icon className={`h-7 w-7 ${step.color}`} />
                </div>

                <div className="mt-7 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9aa0ab]">
                  STEP {step.number}
                </div>

                <h3 className="mt-3 text-[20px] font-semibold text-[#0b0c10] tracking-[-0.01em]">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-[280px] text-[15px] leading-[1.7] text-[#6b7280]">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          className="flex justify-center"
        >
          <Link to="/signup">
            <button className="inline-flex items-center gap-2 border-b border-[#0b0c10] pb-1 text-[15px] font-semibold text-[#0b0c10] hover:opacity-80 transition">
              Start Your Project <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorksSection;
