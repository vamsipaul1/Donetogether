import { motion } from "framer-motion";
import { Check, X, Star } from "lucide-react";

const ComparisonSection = () => {
  const comparisonData = [
    {
      label: "System Architecture",
      doneTogether: "Built for Strategic Completion",
      other: "Built for General Tracking",
      status: ["check", "x-red"],
    },
    {
      label: "Startup Velocity",
      doneTogether: "Instant AI Initialization",
      other: "Manual Project Setup",
      status: ["check", "x-red"],
    },
    {
      label: "Strategic Intelligence",
      doneTogether: "ThinkSense AI Assistant",
      other: "Basic Chat or No Integration",
      status: ["check", "x-red"],
    },
    {
      label: "Live Project Pulse",
      doneTogether: "Efficiency & Real-time XP",
      other: "Static Status Updates",
      status: ["check", "x-red"],
    },
    {
      label: "Team Visibility",
      doneTogether: "Instant Contribution mapping",
      other: "Scattered across boards",
      status: ["check", "x-red"],
    },
    {
      label: "Execution Flow",
      doneTogether: "Mission-driven execution",
      other: "Backlog-centered planning",
      status: ["check", "x-red"],
    },
    {
      label: "User Interface",
      doneTogether: "Ultra-Premium & Focused",
      other: "Cluttered & Enterprise-heavy",
      status: ["check", "x-red"],
    }
  ];

  return (
    <section id="faqs-anchor" className="py-24 bg-white">
      <div className="max-w-[1100px] mx-auto px-6">

        {/* HEADING SECTION */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] sm:text-[44px] font-black text-zinc-900 inline-block mb-5 tracking-tight"
          >
            Task Manager? No. Completion System
          </motion.h2>
          <motion.p

            className="text-[16px] text-zinc-800 font-medium max-w-[1000px] mx-auto antialiased font-body"
          >
            Not Another Task Manager. A Completion System.
            Where projects actually get done.
          </motion.p>
        </div>

        {/* COMPARISON TABLE */}
        <div className="relative mt-8 sm:mt-24">

          {/* Desktop & Mobile Responsive Table Container */}
          <div className="bg-white rounded-[32px] sm:rounded-[40px] border border-black/[0.04] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar scroll-smooth">
              <table className="w-full border-collapse min-w-[600px] sm:min-w-0">
                <thead>
                  <tr className="bg-[#f8f9fa]">
                    <th className="sticky left-0 z-20 w-[160px] sm:w-[30%] py-10 sm:py-12 px-6 sm:px-10 text-left bg-[#f8f9fa] border-r border-black/[0.04] shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] sm:shadow-none">
                      <span className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">Capabilities</span>
                    </th>
                    <th className="w-[220px] sm:w-[35%] py-10 sm:py-12 px-6 sm:px-8 text-left bg-white border-r border-black/[0.02] sm:border-r-0">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 sm:w-7 sm:h-7 text-zinc-900 fill-zinc-900" strokeWidth={1} />
                        <span className="text-[17px] sm:text-[22px] font-black text-zinc-900 font-body tracking-tight">DoneTogether</span>
                      </div>
                    </th>
                    <th className="w-[220px] sm:w-[35%] py-10 sm:py-12 px-6 sm:px-8 text-left bg-white">
                      <div className="flex items-center gap-3 opacity-90">
                        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-zinc-900" />
                        <span className="text-[16px] sm:text-[20px] font-bold text-zinc-900 font-body">Others</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-t border-black/[0.04] group">
                      {/* Sticky Label Column */}
                      <td className="sticky left-0 z-20 py-6 sm:py-8 px-6 sm:px-10 font-bold font-body text-[#0a0a0a] bg-[#f8f9fa] text-[13px] sm:text-[15px] border-r border-black/[0.04] tracking-normal shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] sm:shadow-none">
                        {row.label}
                      </td>

                      {/* DoneTogether Column */}
                      <td className="py-6 sm:py-8 px-6 sm:px-8 text-left bg-zinc-950/[0.01] group-hover:bg-violet-50/30 transition-colors border-r border-black/[0.02] sm:border-r-0">
                        <div className="flex items-center gap-3">
                          <Check className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px] text-emerald-500 shrink-0" strokeWidth={3} />
                          <span className="text-[13px] sm:text-[15px] font-bold font-body text-zinc-900 tracking-tight leading-snug">{row.doneTogether}</span>
                        </div>
                      </td>

                      {/* Others Column */}
                      <td className="py-6 sm:py-8 px-6 sm:px-8 text-left group-hover:bg-zinc-50/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <X className="w-[16px] sm:w-[18px] h-[16px] sm:h-[18px] text-rose-500 opacity-80 shrink-0" strokeWidth={3} />
                          <span className="text-[13px] sm:text-[14.5px] font-medium font-body text-zinc-600 sm:text-zinc-800 tracking-normal leading-snug">{row.other}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Scroll Indicator */}
            <div className="sm:hidden py-3 px-6 bg-[#f8f9fa] border-t border-black/[0.04] flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-700 tracking-normal">Swipe to compare</span>
              <div className="flex gap-1">
                <div className="w-4 h-1 rounded-full bg-zinc-900/20" />
                <div className="w-8 h-1 rounded-full bg-zinc-900/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
