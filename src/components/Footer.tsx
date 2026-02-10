import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-black border-t border-black/5 dark:border-white/5 py-12">
      <div className="container px-6 mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-zinc-900 dark:text-white">DoneTogether.</span>
          <span className="text-sm text-zinc-400 font-mono pl-4 border-l border-black/10 dark:border-white/10">
            © 2026 DoneTogether Inc.
          </span>
        </div>

        {/* Right: Simple Links */}
        <div className="flex items-center gap-8">
          <Link to="/#features" className="text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">Features</Link>
          <Link to="/premium" className="text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">Pricing</Link>
          <Link to="/about" className="text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">About</Link>
          <Link to="/contact" className="text-sm font-medium text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">Contact</Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
