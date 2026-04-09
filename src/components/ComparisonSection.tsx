import { motion } from "framer-motion";
import { Check, X, Star } from "lucide-react";

const ComparisonSection = () => {
  const comparisonData = [
    {
      label: "Setup Time",
      doneTogether: "Instant (AI-Driven)",
      jira: "Weeks (Config Heavy)",
      asana: "Days (Template Dependent)",
      status: ["check", "x-red", "x-orange"],
    },
    {
      label: "Execution Clarity",
      doneTogether: "Focus on 'Doing'",
      jira: "Focus on 'Tracking'",
      asana: "Focus on 'Planning'",
      status: ["check", "x-red", "x-orange"],
    },
    {
      label: "Team Synergy",
      doneTogether: "Squad-based flow",
      jira: "Siloed tickets",
      asana: "Fragmented boards",
      status: ["check", "x-red", "x-orange"],
    },
    {
      label: "Pricing",
      doneTogether: "Fair & Transparent",
      jira: "Enterprise bloat",
      asana: "Hidden upsells",
      status: ["check", "x-red", "x-orange"],
    },
    {
      label: "Result",
      doneTogether: "Product Delivered",
      jira: "Tickets Closed",
      asana: "Lists Checked",
      status: ["check", "x-red", "x-orange"],
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1100px] mx-auto px-6">

        {/* HEADING SECTION */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] sm:text-[44px] font-[900] text-[#0a0a0a] mb-5 tracking-tight"
          >
            What Makes Us Different
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[17px] text-[#0a0a0a] font-medium max-w-[700px] mx-auto antialiased"
          >
            Why leading businesses choose us over jira or asana elsewhere?
          </motion.p>
        </div>

        {/* COMPARISON TABLE */}
        <div className="relative mt-24">
          <div className="bg-white rounded-[32px] border border-black/[0.03] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-[22%] py-10 bg-transparent"></th>
                  <th className="w-[26%] py-10 px-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Star className="w-8 h-8 text-zinc-900 fill-zinc-900 mb-1" strokeWidth={1} />
                      <span className="text-[22px] font-black text-zinc-900">DoneTogether</span>
                    </div>
                  </th>
                  <th className="w-[26%] py-10 px-4 text-center">
                    <span className="text-[20px] font-bold text-zinc-900 opacity-80">Jira</span>
                  </th>
                  <th className="w-[26%] py-10 px-4 text-center">
                    <span className="text-[20px] font-bold text-zinc-900 opacity-80">Asana</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-t border-black/[0.04]">
                    <td className="py-7 px-8 font-bold text-[#0a0a0a] bg-[#f8f9fa] text-[15.5px] border-r border-black/[0.04]">
                      {row.label}
                    </td>
                    <td className="py-7 px-4 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <Check className="w-[18px] h-[18px] text-emerald-500" strokeWidth={3} />
                        <span className="text-[14.5px] font-semibold text-zinc-800">{row.doneTogether}</span>
                      </div>
                    </td>
                    <td className="py-7 px-4 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <X className="w-[18px] h-[18px] text-rose-500" strokeWidth={3} />
                        <span className="text-[14.5px] font-medium text-zinc-700">{row.jira}</span>
                      </div>
                    </td>
                    <td className="py-7 px-4 text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <X className="w-[18px] h-[18px] text-orange-400 opacity-70" strokeWidth={3} />
                        <span className="text-[14.5px] font-medium text-zinc-700">{row.asana}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

  );
};

export default ComparisonSection;
