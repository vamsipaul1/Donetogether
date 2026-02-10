import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { name: 'Features', href: '/#features' },
  { name: 'How it works', href: '/#how-it-works' },
  { name: 'Premium', href: '/premium' },
];

const Navbar = ({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const hash = href.substring(1);
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md py-4 border-b border-black/5 dark:border-white/5' : 'bg-transparent py-6'}`}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center shadow-lg">
            <img src="/favicon.ico" alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-s bold text-lg">DoneTogether</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-medium text-zinc-900 dark:text-white hover:underline decoration-zinc-300 underline-offset-4">
                Dashboard
              </Link>
              <button onClick={() => signOut()} className="text-sm font-medium text-zinc-500 hover:text-red-500 transition-colors">
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-zinc-900 dark:text-white hover:opacity-70 transition-opacity">
                Log in
              </Link>
              <Link to="/signup">
                <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 text-sm font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-black/5 active:scale-95">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-zinc-900 dark:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleNavClick(e, link.href);
                  }}
                  className="text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
              <button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} className="text-left text-base font-medium text-zinc-600 dark:text-zinc-400">
                Switch Theme
              </button>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-zinc-900 dark:text-white">Dashboard</Link>
                  <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="text-left text-base font-medium text-red-500">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-zinc-900 dark:text-white">Log in</Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded-lg text-center">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
