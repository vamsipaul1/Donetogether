import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const UnifiedWorkspaceSection = () => {
  return (
    <section className="relative w-full flex flex-col font-sans">
      {/* Top Blue Section */}
      <div className="bg-[#2563eb] pt-24 pb-24 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1200px] mx-auto">
          {/* Logo/Icon at top left */}
          <div className="mb-10">
            <svg width="42" height="16" viewBox="0 0 42 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="10" width="14" height="6" rx="3" transform="rotate(-35 4 10)" fill="white" fillOpacity="0.9"/>
              <rect x="16" y="10" width="14" height="6" rx="3" transform="rotate(-35 16 10)" fill="white" fillOpacity="0.9"/>
              <rect x="28" y="10" width="14" height="6" rx="3" transform="rotate(-35 28 10)" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          
          <h2 className="text-[40px] md:text-[56px] lg:text-[64px] font-body font-[500] tracking-[-0.03em] leading-[1.05] text-white max-w-[800px] mb-6">
            Master of your project, <br className="hidden md:block" /> partner to your team.
          </h2>
          <p className="text-[18px] md:text-[20px] font-body text-white/90 leading-[1.6] max-w-[600px] antialiased">
            Seamlessly mirror your team's expertise to keep every project on track, organized, and moving forward perfectly.
          </p>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="w-full overflow-hidden -mt-[1px] relative z-10 bg-[#f3f3eb]">
        <svg 
          className="w-full h-auto text-[#2563eb]" 
          viewBox="0 0 1440 96" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          preserveAspectRatio="none"
          style={{ minHeight: '60px' }}
        >
          {/* A cool overlapping ribbon wave reminiscent of the reference */}
          <path d="M0 0H1440V32C1440 32 1380 96 1320 96C1260 96 1200 32 1200 32C1200 32 1140 96 1080 96C1020 96 960 32 960 32C960 32 900 96 840 96C780 96 720 32 720 32C720 32 660 96 600 96C540 96 480 32 480 32C480 32 420 96 360 96C300 96 240 32 240 32C240 32 180 96 120 96C60 96 0 32 0 32V0Z" fill="currentColor"/>
          <path d="M120 96C180 96 240 32 240 32C240 32 300 96 360 96C420 96 480 32 480 32C480 32 540 96 600 96C660 96 720 32 720 32C720 32 780 96 840 96C900 96 960 32 960 32C960 32 1020 96 1080 96C1140 96 1200 32 1200 32C1200 32 1260 96 1320 96C1380 96 1440 32 1440 32V96H120Z" fill="white" fillOpacity="0.1"/>
        </svg>
      </div>

      {/* Bottom Off-White Section */}
      <div className="bg-[#f3f3eb] pt-16 pb-24 px-6 sm:px-12 lg:px-24">
        <div className="max-w-[1200px] mx-auto relative">
          
          {/* Logo water-mark in bottom right */}
          <div className="absolute -bottom-8 -right-4 lg:-right-12 opacity-[0.03] pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Pill Badge */}
          <div className="inline-flex px-3.5 py-1.5 rounded-full border border-[#2563eb]/20 bg-transparent mb-10 items-center justify-center">
            <span className="text-[13px] font-bold tracking-[0.02em] text-[#2563eb] font-body leading-none">Unified workspace</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start relative z-10">
            {/* Left Content */}
            <div className="w-full lg:w-[55%]">
              <h3 className="text-[40px] md:text-[52px] lg:text-[58px] font-body font-[500] text-zinc-900 leading-[1.08] tracking-[-0.03em] mb-6">
                A workspace where humans and AI work together
              </h3>
              <p className="text-[17px] md:text-[19px] text-zinc-600 font-body leading-[1.6] mb-10 max-w-[580px] antialiased">
                By analyzing your team's real-world tasks and documentation, WeMakeIt continuously sharpens its knowledge to match your project's goals and precision with every interaction.
              </p>
              
              <Link to="/signup" className="inline-block">
                <button className="px-7 py-3.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-bold font-body text-[15px] transition-colors flex items-center gap-2 group shadow-sm">
                  Explore project room
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* Right Checklist */}
            <div className="w-full lg:w-[45%] flex flex-col gap-6 pt-4 lg:pl-8">
              <div className="flex items-start gap-4 group">
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded bg-zinc-200/80 group-hover:bg-zinc-300 flex items-center justify-center transition-colors">
                  <Check className="w-[14px] h-[14px] text-zinc-700" strokeWidth={3} />
                </div>
                <p className="text-[16px] md:text-[17px] text-zinc-800 font-medium font-body leading-snug">One workspace across all tasks</p>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded bg-zinc-200/80 group-hover:bg-zinc-300 flex items-center justify-center transition-colors">
                  <Check className="w-[14px] h-[14px] text-zinc-700" strokeWidth={3} />
                </div>
                <p className="text-[16px] md:text-[17px] text-zinc-800 font-medium font-body leading-snug">Context stays connected everywhere</p>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded bg-zinc-200/80 group-hover:bg-zinc-300 flex items-center justify-center transition-colors">
                  <Check className="w-[14px] h-[14px] text-zinc-700" strokeWidth={3} />
                </div>
                <p className="text-[16px] md:text-[17px] text-zinc-800 font-medium font-body leading-snug">Your team and expert AI in one board</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnifiedWorkspaceSection;
