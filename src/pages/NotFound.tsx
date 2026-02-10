import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { MoveLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Path", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F5F0] dark:bg-zinc-950 dotted-pattern transition-colors duration-500">
      <div className="container px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto text-center space-y-8"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[32px] flex items-center justify-center shadow-xl border border-zinc-200 dark:border-zinc-800 rotate-6 mx-auto">
              <HelpCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#E2F0D9] dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center shadow-lg -rotate-12 border border-white dark:border-zinc-800">
              <span className="font-bold text-lg text-emerald-700">?</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-7xl font-black text-zinc-900 dark:text-white">404</h1>
            <h2 className="text-2xl font-bold">Lost in the project?</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The page you're looking for was either deleted, renamed, or never existed in the first place.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="w-full sm:w-auto h-12 rounded-full px-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold group">
              <Link to="/">
                <MoveLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
