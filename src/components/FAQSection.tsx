import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, X } from 'lucide-react'

const faqs = [
  {
    question: "Who's behind DoneTogether?",
    answer: "DoneTogether is powered by a passionate team of developers and project managers who care about team execution and clarity.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
  },
  {
    question: "Is it free for students?",
    answer: "Yes! We offer a dedicated free tier for students and academic projects to help you build your portfolio.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
  },
  {
    question: "Can I collaborate with external partners?",
    answer: "Absolutely. You can invite anyone via email or link to join your project room.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nala"
  },
  {
    question: "Do you provide real-time updates?",
    answer: "Yes, our platform uses live synchronization so every team member stays on the same page.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy"
  },
  {
    question: "Is my data secure?",
    answer: "We prioritize security with end-to-end encryption for your project data and private communications.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly"
  }
]

const FAQSection = ({ onClose }: { onClose?: () => void }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div id="faqs" className="py-8 bg-[#f8f9fa] relative rounded-3xl">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-start mb-12">
          <div className="text-left">
            <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-[#0a0a0a] mb-3">
              Commonly Asked Questions
            </h2>
            <p className="text-zinc-500 text-base">
              Everything you need to know about getting your team up and running.
            </p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-zinc-200 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-8">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="flex flex-col gap-6">
                {/* Question Bubble (Right Aligned) */}
                <div className="flex items-start justify-end gap-4">
                  <div className="flex flex-col items-end gap-2">
                    <motion.div
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`
                        px-7 py-5 rounded-[28px] rounded-br-[6px] 
                        font-semibold text-[15.5px] tracking-tight cursor-pointer
                        shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)]
                        ${isOpen ? 'bg-[#0a0a0a] text-white shadow-[#00000020]' : 'bg-zinc-100 text-zinc-500 shadow-none'}
                        transition-all duration-400 max-w-[90%] sm:max-w-md
                      `}
                    >
                      {faq.question}
                    </motion.div>
                  </div>
                  
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="mt-2 w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors shadow-sm"
                  >
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </button>
                </div>

                {/* Answer Bubble (Left Aligned) */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -20, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-start gap-4"
                    >
                      <div className="relative mt-auto mb-1">
                        <img
                          src={faq.avatar}
                          alt="Support Avatar"
                          className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-white p-0.5 object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>

                      <div className="flex flex-col gap-2 max-w-[90%] sm:max-w-lg">
                        <div className="px-7 py-6 rounded-[28px] rounded-bl-[6px] bg-white border border-zinc-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] text-zinc-600 text-[15.5px] leading-relaxed tracking-tight antialiased">
                          {faq.answer}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 ml-4 flex items-center gap-1.5 antialiased">
                          <span className="w-1 h-1 bg-zinc-300 rounded-full"></span> Support Team
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default FAQSection
