import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, LayoutList, ChevronRight, Layers } from "lucide-react";

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      title: "AI Planning",
      icon: <Sparkles size={20} />,
      content: (
        <div className="flex flex-col gap-6 h-full justify-center">
          {/* Mockup for AI Planning */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 mx-auto max-w-lg w-full relative">
            <div className="w-10 h-10 rounded-full bg-[#033ad2]/10 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-[#033ad2]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-800 mb-1">WeMakeIt AI</div>
              <div className="text-[15px] leading-relaxed text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 rounded-tl-none">
                I've broken down your project into 5 key milestones. I recommend starting with the database schema setup to unblock the backend team. Should I assign these tasks?
              </div>
            </div>

            {/* Action buttons mockup */}
            <div className="absolute -bottom-4 right-6 flex gap-2">
              <button className="bg-white border border-gray-200 shadow-sm text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-50 text-gray-700">Modify Plan</button>
              <button className="bg-[#033ad2] text-white shadow-sm text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#033ad2]/90">Assign Tasks</button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Task Boards",
      icon: <LayoutList size={20} />,
      content: (
        <div className="flex flex-col gap-4 h-full justify-center">
          {/* Mockup for Task Boards */}
          <div className="w-full flex gap-4 overflow-hidden pt-4 px-2">
            <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-gray-200 min-w-[240px] flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">To Do</div>
                <div className="w-5 h-5 rounded-full bg-gray-100 text-xs flex items-center justify-center font-semibold text-gray-500">3</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-3 hover:border-[#033ad2]/30 transition-colors cursor-pointer">
                <div className="flex gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">Frontend</span>
                </div>
                <div className="text-[14px] font-bold text-gray-800 leading-tight">Implement Design System</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-[#033ad2]/30 transition-colors cursor-pointer">
                <div className="flex gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Backend</span>
                </div>
                <div className="text-[14px] font-bold text-gray-800 leading-tight">Setup Supabase Auth</div>
              </div>
            </div>

            <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-gray-200 min-w-[240px] flex-1 opacity-75 scale-95 origin-left">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">In Progress</div>
                <div className="w-5 h-5 rounded-full bg-[#033ad2]/10 text-xs flex items-center justify-center font-semibold text-[#033ad2]">1</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-[#033ad2]/20 border-l-4 border-l-[#033ad2]">
                <div className="flex gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">Design</span>
                </div>
                <div className="text-[14px] font-bold text-gray-800 leading-tight mb-3">Hero Section UI</div>
                <div className="flex justify-between items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden border-2 border-white"><img src="https://i.pravatar.cc/100?img=33" alt="" /></div>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="w-1/2 h-full bg-[#033ad2]"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Project Chat",
      icon: <MessageSquare size={20} />,
      content: (
        <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative max-w-lg mx-auto w-full">
          <div className="px-5 py-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">#</div>
            <div>
              <div className="font-bold text-[15px] text-gray-900 leading-none">general-planning</div>
              <div className="text-[12px] text-gray-500 mt-1">3 members typing...</div>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-4 flex-1 bg-gray-50/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden"><img src="https://i.pravatar.cc/100?img=12" alt="" /></div>
              <div>
                <div className="text-xs font-bold text-gray-500 mb-1 ml-1">Sarah M. <span className="font-normal text-gray-400">10:42 AM</span></div>
                <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-none text-[14px] shadow-sm text-gray-700">
                  Are we using Tailwind for the new dashboard?
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 self-end flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex-shrink-0 overflow-hidden"><img src="https://i.pravatar.cc/100?img=11" alt="" /></div>
              <div className="flex flex-col items-end">
                <div className="text-xs font-bold text-gray-500 mb-1 mr-1">You <span className="font-normal text-gray-400">10:45 AM</span></div>
                <div className="bg-[#033ad2] text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-[14px] shadow-sm">
                  Yes! I just updated the `FeaturesSection` layout with it.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 self-end flex-row-reverse">
              <div className="bg-[#033ad2] text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-[14px] shadow-sm">
                It looks super clean now! 🎉
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 flex items-center gap-3">
              <Layers size={18} className="text-gray-400" />
              <div className="text-[14px] text-gray-400 font-medium">Type a message...</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="relative w-full py-20 sm:py-32 bg-[#f7d4de]">
      <div className="max-w-[1300px] mx-auto px-6 flex flex-col items-center">

        {/* HEADER BLOCK */}
        <div className="flex flex-col items-start text-left max-w-4xl mb-20">
          <div className="bg-[#033ad2]/10 text-[#033ad2] font-body font-bold text-[14px] leading-none tracking-wide pl-2.5 pr-4 py-2 rounded-full mb-6 inline-flex items-center gap-2.5 shadow-sm">
            <img
              src="/featurelogo.png"
              alt="WeMakeIt logo"
              className="h-5 w-auto object-contain"
            />
            <span className="mt-[2px]">Ask WeMakeIt. What are the benefits?</span>
          </div>
          <h2 className="text-[32px] sm:text-[42px] md:text-[38px] font-body font-[300] text-[#033ad2] leading-[1.15] tracking-[-0.03em] max-w-[800px]">
            Manage every student project without the chaos. Give your team the clarity they need to execute perfectly.
          </h2>
        </div>

        {/* MAIN FEATURE CARD */}
        <div className="w-full bg-white rounded-[40px] p-4 sm:p-10 shadow-2xl shadow-blue-900/5 flex flex-col lg:flex-row gap-6 sm:gap-12 min-h-[600px]">

          {/* LEFT TABS */}
          <div className="lg:w-[35%] flex flex-col gap-3 justify-center">
            {features.map((feature, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center justify-between p-6 rounded-3xl text-left transition-all duration-300 ${isActive
                    ? "bg-gray-50/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100"
                    : "hover:bg-gray-50/50 border border-transparent"
                    }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-2xl transition-colors ${isActive ? "bg-white text-[#033ad2] shadow-sm border border-gray-100" : "text-gray-400 bg-gray-50"}`}>
                      {feature.icon}
                    </div>
                    <span className={`font-bold text-[19px] tracking-tight ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                      {feature.title}
                    </span>
                  </div>
                  {isActive && <ChevronRight size={20} className="text-gray-400" />}
                </button>
              );
            })}
          </div>

          {/* RIGHT CANVAS */}
          <div className="lg:w-[65%] bg-[#fcfcfd] rounded-[28px] p-6 sm:p-10 flex flex-col border border-gray-100 shadow-[inset_0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 w-full h-full flex flex-col"
              >
                {features[activeTab].content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}