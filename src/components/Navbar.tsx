import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import FAQSection from "./FAQSection";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "How it works", href: "/#how-it-works" },
  { name: "FAQs", href: "#", action: "faq" },
  { name: "Why Choose", href: "/why-choose" },
  {
    name: "Contact Us",
    href:
      "https://mail.google.com/mail/?view=cm&fs=1&to=vamsirangumudri2023@gmail.com",
  },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: { name: string, href: string, action?: string }
  ) => {
    if (link.action === "faq") {
      e.preventDefault();
      setIsFAQOpen(true);
      setIsMobileMenuOpen(false);
      return;
    }

    if (link.href.startsWith("/#")) {
      const hash = link.href.substring(1);

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
      setIsScrolled(window.scrollY > 400);
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
        top-4
        left-0
        right-0
        z-50
        transition-all
        duration-500
        px-4
      `}
    >
      <div className={`
        mx-auto max-w-[1280px] px-8 py-3 
        flex items-center justify-between relative
        transition-all duration-500
      `}>


        {/* LOGO */}
        <motion.div
          animate={{
            opacity: isScrolled ? 0 : 1,
            x: isScrolled ? -20 : 0,
            pointerEvents: isScrolled ? "none" : "auto",
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Link
            to="/"
            className="flex items-center gap-2 text-zinc-900 font-medium"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <img
                src="/favicon.ico"
                alt="logo"
                className="w-5 h-5"
              />
            </div>

            <span className="text-[17px] font-semibold">
              DoneTogether
            </span>
          </Link>
        </motion.div>


        {/* DESKTOP NAV - CENTERED PILL */}
        <nav className={`
          absolute left-1/2 -translate-x-1/2
          hidden md:flex items-center gap-8 
          bg-white/80 backdrop-blur-xl
          px-8 py-3 rounded-full 
          border border-black/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.03)]
          transition-all duration-500
          ${isScrolled ? "shadow-md" : "scale-100"}
        `}>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={(e) =>
                handleNavClick(e, link)
              }
              className="
                text-[15px]
                font-medium
                text-zinc-800
                hover:text-black
                transition-colors
              "
            >
              {link.name}
            </Link>
          ))}
        </nav>



        {/* ACTIONS */}
        <motion.div
          animate={{
            opacity: isScrolled ? 0 : 1,
            x: isScrolled ? 20 : 0,
            pointerEvents: isScrolled ? "none" : "auto",
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="hidden md:flex items-center gap-5"
        >
          {user ? (
            <div className="flex items-center gap-8">
              <Link
                to="/dashboard"
                className="
                  text-[15px]
                  font-medium
                  text-zinc-800
                  hover:text-black
                  transition-colors
                "
              >
                Project Room
              </Link>

              <button
                onClick={() => signOut()}
                className="
                  text-[15px]
                  font-medium
                  text-zinc-500
                  hover:text-red-500
                  transition-colors
                "
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link
                to="/login"
                className="
                  text-[15px]
                  font-medium
                  text-zinc-800
                  hover:text-black
                  transition-colors
                "
              >
                Log in
              </Link>

              <Link to="/signup">
                <button
                  className="
                    bg-black
                    text-white
                    px-7
                    py-3
                    text-[15px]
                    font-semibold
                    rounded-2xl
                    hover:bg-zinc-800
                    transition-all
                    shadow-sm
                  "
                >
                  Get Started
                </button>
              </Link>
            </div>
          )}

        </motion.div>




        {/* MOBILE BUTTON */}

        <button
          className="md:hidden p-2 text-zinc-900"
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
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="
              md:hidden
              bg-white
              border-t
              border-zinc-200
              overflow-hidden
            "
          >
            <div className="px-6 py-6 flex flex-col gap-4">

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link);
                    setIsMobileMenuOpen(false);
                  }}
                  className="
                    text-[15px]
                    text-zinc-700
                  "
                >
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-zinc-200 my-2" />

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-red-500 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                  >
                    Log in
                  </Link>

                  <Link
                    to="/signup"
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                  >
                    <button
                      className="
                        w-full
                        bg-black
                        text-white
                        h-12
                        font-bold
                        rounded-full
                        shadow-lg
                        active:scale-[0.98]
                        transition-all
                      "
                    >
                      Get Started
                    </button>
                  </Link>
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ MODAL OVERLAY */}
      <AnimatePresence>
        {isFAQOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFAQOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#f8f9fa] rounded-3xl shadow-2xl custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <FAQSection onClose={() => setIsFAQOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.header>
  );
};

export default Navbar;