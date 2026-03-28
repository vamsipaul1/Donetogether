import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-black border-t border-black/5 dark:border-white/5 py-8 sm:py-12">
      <div className="container px-4 sm:px-6 mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">

        {/* Left: Brand & Copyright */}
        <div className="flex flex-col font-body sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="font-bold text-base sm:text-lg text-zinc-800 dark:text-white">DoneTogether.</span>
          <span className="text-xs sm:text-sm text-zinc-400 font-mono sm:pl-4 sm:border-l border-black/10 dark:border-white/10">
            © 2026 DoneTogether Inc.
          </span>
        </div>

        {/* Right: Simple Links */}
        <div className="flex items-center font-body gap-4 sm:gap-6 md:gap-8 flex-wrap justify-center">
          <Link to="/#features" className="text-xs sm:text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">Features</Link>
          <Link to="/premium" className="text-xs sm:text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">Pricing</Link>
          <Link to="/questions" className="text-xs sm:text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">Questions & Answers</Link>
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=vamsirangumudri2023@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs sm:text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

