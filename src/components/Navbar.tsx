import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Start Project', href: '/signup' },
  { name: 'Premium', href: '/premium' },
  { name: 'Contact Us', href: '/contact' },
];

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar = ({ isDark, toggleTheme }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');

      if (location.pathname !== '/') {
        navigate(`/${href}`);
        return;
      }

      const element = document.getElementById(targetId);
      if (element) {
        const offset = 80; // height of navbar
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 py-3 mt-0'
        : 'py-6 bg-transparent mt-2'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group transition-transform duration-300"
          >
            <div className="relative w-9 h-9 flex items-center justify-center bg-zinc-900  rounded-xl rotate-0 group-hover:rotate-12 transition-all duration-500">
              <img
                src="/favicon.ico"
                alt="Logo"
                className="w-6 h-6 "
              />
            </div>
            <span className="text-[22px] font-black text-zinc-900 dark:text-white tracking-tight transition-colors">
              DoneTogether
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 bg-zinc-100/50 dark:bg-zinc-900/50 p-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
            {navLinks.map((link) => (
              link.href.startsWith('#') ? (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavLinkClick(e, link.href)}
                  className="px-5 py-2 text-[14px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all rounded-full hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="px-5 py-2 text-[14px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all rounded-full hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm"
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-zinc-600" />}
                </motion.div>
              </AnimatePresence>
            </Button>

            {user ? (
              <div className="flex items-center gap-2 relative z-10">
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="rounded-2xl px-4 w-22 h-9 text-[13px] font-bold text-red-700 dark:text-red-500 tracking-tight border-2 border-red-700 dark:border-red-500 hover:bg-red-500 dark:hover:bg-black flex items-center"
                >
                  <LogOut className="w-2 h-2" />
                  Log Out
                </Button>
                <Button
                  asChild
                  className="rounded-2xl px-4 h-10 text-[14px] border-2 border-black font-bold bg-black hover:bg-black dark:bg-white dark:hover:bg-white text-white dark:text-black border-none transition-all duration-300 shadow-lg shadow-black/20 active:scale-95"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-2 h-2 mr-1" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-xl px-6 text-xs font-bold uppercase tracking-widest hover:text-white hover:bg-zinc-500 dark:hover:bg-zinc-800 transition-all"
                >
                  <Link to="/login">
                    Log In
                  </Link>
                </Button>
                <Button
                  asChild
                  className="rounded-xl px-6 h-10 font-black uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 border-none transition-all duration-300 shadow-xl shadow-black/10 active:scale-95"
                >
                  <Link to="/signup">
                    Join Now
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Shell */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full"
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-zinc-600" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden md:hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-6">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  link.href.startsWith('#') ? (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleNavLinkClick(e, link.href)}
                      className="text-base font-medium text-muted-black hover:text-black hover:bg-zinc-900 dark:hover:bg-black px-4 py-3 rounded-xl transition-all"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-base font-medium text-muted-black hover:text-black hover:bg-zinc-900 dark:hover:bg-black px-4 py-3 rounded-xl transition-all"
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </nav>
              <div className="flex flex-col gap-3 px-1">
                {user ? (
                  <>
                    <Button asChild className="w-full h-12 rounded-xl font-semibold bg-black text-white hover:bg-black/80 dark:hover:bg-black/80 shadow-sm">
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                      className="w-full h-12 rounded-xl font-medium text-red-700 hover:bg-red-200 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="w-full h-12 rounded-xl font-semibold bg-[#E2F0D9] text-black hover:bg-[#C9D6C5] shadow-sm">
                      <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        Create Account
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full h-12 rounded-xl font-medium text-muted-foreground hover:text-foreground">
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        Already have an account? Log In
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header >
  );
};

export default Navbar;
