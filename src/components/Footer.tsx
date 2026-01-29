import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="relative border-t border-zinc-200/10 bg-zinc-950 py-10 overflow-hidden">
      {/* Insane Mixing Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-pink-600/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-amber-500/10 rounded-full blur-[80px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Section - Split Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
          <div className="max-w-md text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-white leading-tight mb-4">
              Consolidate your ideas, tasks, and team into <br />
              <span className="text-zinc-500">one workspace.</span>
            </h2>
          </div>

          <div className="relative group">
            {/* Gradient Card - Compact size */}
            <div className="relative w-[260px] sm:w-[300px] h-[110px] sm:h-[130px] rounded-[20px] overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-[1.02] border border-white/5">
              {/* Background Gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-600 to-red-600 animate-gradient-xy" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />

              {/* Card Content */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <Button
                  asChild
                  size="sm"
                  className="bg-white text-black px-5 py-2 rounded-full font-black text-xs sm:text-sm shadow-2xl hover:bg-zinc-100 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Link to="/signup">
                    Start Building Together
                  </Link>
                </Button>
              </div>
            </div>

            {/* Decorative Shadow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-[20px] blur opacity-20 transition duration-1000 pointer-events-none" />
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="flex justify-center pt-6 border-t border-white/5">
          <div className="text-[14px] text-zinc-500 font-bold uppercase tracking-wider">
            © 2026 DoneTogether. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
