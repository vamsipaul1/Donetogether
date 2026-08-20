import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { preloadRoute } from "@/utils/preload";
import { lazyRoutes } from "@/App";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "How it works", href: "/#how-it-works" },
  { name: "FAQs", href: "/#faqs" },
  {
    name: "Contact Us",
    href:
      "https://mail.google.com/mail/?view=cm&fs=1&to=vamsirangumudri2023@gmail.com",
  },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("/#")) {
      const hash = href.substring(1);

      if (location.pathname === "/") {
        e.preventDefault();

        const element = document.querySelector(hash);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
          });
        }
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        font-body
        fixed
        top-0
        left-0
        right-0
        z-50
        transition-all
        duration-300
        ${isScrolled
          ? "bg-[#033ad2] shadow-md py-3"
          : "bg-transparent py-5"
        }
      `}
    >
      <div className="mx-auto max-w-[1400px] px-6 h-full flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold shrink-0"
        >
          <img
            src="/wemakeit.png"
            alt="WeMakeIt logo"
            className="h-8 w-auto object-contain"
          />
          <span className="text-[17px] text-[#ffebeb] tracking-tight">
            WeMakeIt
          </span>
        </Link>

        {/* CENTER PILL NAV (Desktop) */}
        <div className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={(e) =>
                handleNavClick(e, link.href)
              }
              onMouseEnter={() => {
                if (link.key && lazyRoutes[link.key as keyof typeof lazyRoutes]) {
                  preloadRoute(lazyRoutes[link.key as keyof typeof lazyRoutes]);
                }
              }}
              className="
                text-[14.5px]
                font-medium
                text-white/80
                hover:text-white
                transition-colors
              "
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/project-room"
                onMouseEnter={() => preloadRoute(lazyRoutes.Dashboard)}
                className="text-[13.5px] font-bold text-white hover:opacity-70 transition-opacity"
              >
                Project Room
              </Link>
              <button
                onClick={() => signOut()}
                className="text-[13.5px] font-bold text-black"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link
                to="/login"
                onMouseEnter={() => preloadRoute(lazyRoutes.Login)}
                className="text-[14px] font-bold text-[#ffebeb]"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onMouseEnter={() => preloadRoute(lazyRoutes.SignUp)}
              >
                <button
                  className="
                    bg-black
                    text-white
                    px-7
                    py-2.5
                    text-[14px]
                    font-bold
                    rounded-full
                    hover:bg-zinc-800
                    transition-all
                    active:scale-95
                  "
                >
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="lg:hidden p-2 text-zinc-900"
          onClick={() =>
            setIsMobileMenuOpen(!isMobileMenuOpen)
          }
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>


      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "100vh",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="
              lg:hidden
              fixed
              inset-0
              top-[60px]
              bg-white
              z-50
              overflow-y-auto
              pb-32
            "
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleNavClick(e, link.href);
                  }}
                  onMouseEnter={() => {
                    if (link.key && lazyRoutes[link.key as keyof typeof lazyRoutes]) {
                      preloadRoute(lazyRoutes[link.key as keyof typeof lazyRoutes]);
                    }
                  }}
                  onTouchStart={() => {
                    if (link.key && lazyRoutes[link.key as keyof typeof lazyRoutes]) {
                      preloadRoute(lazyRoutes[link.key as keyof typeof lazyRoutes]);
                    }
                  }}
                  className="
                    text-[24px]
                    font-bold
                    text-zinc-900
                    tracking-tight
                  "
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-zinc-100 my-4" />

              {user ? (
                <div className="flex flex-col gap-6">
                  <Link
                    to="/project-room"
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                    onMouseEnter={() => preloadRoute(lazyRoutes.Dashboard)}
                    onTouchStart={() => preloadRoute(lazyRoutes.Dashboard)}
                    className="text-[24px] font-bold text-zinc-900 tracking-tight"
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-red-500 text-left text-[24px] font-bold tracking-tight"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6 mt-4">
                  <Link
                    to="/login"
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                    onMouseEnter={() => preloadRoute(lazyRoutes.Login)}
                    onTouchStart={() => preloadRoute(lazyRoutes.Login)}
                    className="text-[24px] font-bold text-zinc-900 tracking-tight"
                  >
                    Log in
                  </Link>

                  <Link
                    to="/signup"
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                    onMouseEnter={() => preloadRoute(lazyRoutes.SignUp)}
                    onTouchStart={() => preloadRoute(lazyRoutes.SignUp)}
                    className="mt-2"
                  >
                    <button
                      className="
                        w-full
                        bg-black
                        text-white
                        h-14
                        text-[16px]
                        font-bold
                        rounded-full
                        shadow-xl
                        active:scale-[0.98]
                        transition-all
                      "
                    >
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;