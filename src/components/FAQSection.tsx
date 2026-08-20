import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "What exactly is WeMakeIt?",
    answer: "WeMakeIt is a high-impact 'Completion System' designed for student groups and founders. Unlike traditional task managers that just list what needs to be done, we focus on the architecture of finishing combining strategic AI assistance, real-time collaboration, and efficiency tracking in one focused room."
  },
  {
    question: "How is it different from Jira or Asana?",
    answer: "Most platforms are built for enterprise management and 'tracking' indefinitely. WeMakeIt is built for 'mission completion.' We feature ThinkSense AI as a native strategist, integrated project rooms that eliminate tab switching, and real-time XP multipliers that reward actual momentum."
  },
  {
    question: "Is ThinkSense AI available for all members?",
    answer: "Yes. ThinkSense AI is a core pillar of the platform. It's integrated into every project room to analyze your trajectory, suggest mission-critical steps, and help resolve blockers through strategic dialogue."
  },
  {
    question: "How do I invite my team to a project?",
    answer: "Once you start a mission, you'll receive a unique Invite Link and Join Code. Anyone with this code can instantly enter your project room and start contributing. No complex permissions just execution."
  },
  {
    question: "What are Streak Points and XP multipliers?",
    answer: "We believe in rewarding consistency. Streak Points track your daily contributions, and maintaining a streak unlocks XP multipliers. This isn't just gamification it's a proven psychological trigger to help teams maintain focus and see projects through to completion."
  }
];

const FAQItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-t border-zinc-200/60 transition-all">
      <button
        onClick={onClick}
        className="w-full py-5 sm:py-7 flex items-center justify-between text-left group"
      >
        <span className={`text-[15px] sm:text-[18px] font-bold font-body transition-colors ${isOpen ? 'text-zinc-900' : 'text-zinc-800/80 group-hover:text-zinc-900'}`}>
          {question}
        </span>
        <div className={`shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-90'}`}>
          {isOpen ? <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-900" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 sm:pb-8 pr-4 sm:pr-12">
              <p className="text-[13.5px] sm:text-[15px] font-medium font-body text-zinc-500 leading-relaxed max-w-[800px]">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" className="py-16 sm:py-32 bg-[#fcfcf9]">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr,1.5fr] gap-10 lg:gap-32">

        {/* LEFT SIDE: HEADING */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col justify-start pt-2"
        >
          <h2 className="text-[32px] sm:text-[52px] font-bold font-body text-zinc-900 leading-[1.1] mb-2 sm:mb-6">
            Questions?<br />
            <span className="text-zinc-700/60 italic">We're here to help.</span>
          </h2>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=vamsirangumudri2023@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 mt-4 text-zinc-400/80 font-bold text-[11px] uppercase tracking-[0.2em] group cursor-pointer w-fit no-underline"
          >
            <div className="w-5 h-5 rounded-full border border-zinc-400 flex items-center justify-center text-[10px] group-hover:bg-zinc-900 group-hover:border-zinc-900 group-hover:text-white transition-all">↓</div>
            <span className="font-body text-zinc-900 font-bold text-[15px] hover:text-zinc-700/60 transition-colors underline underline-offset-4 capitalize">Ask here...</span>
          </a>
        </motion.div>

        {/* RIGHT SIDE: ACCORDION */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="border-b border-zinc-200/60">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
