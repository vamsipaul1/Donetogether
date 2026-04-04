import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "How it works", href: "/#how-it-works" },
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
          ? "bg-white/80 backdrop-blur-lg border-b border-zinc-200 py-3"
          : "bg-transparent py-5"
        }
      `}
    >
      <div className="mx-auto max-w-[1280px] px-6 flex items-center justify-between">

        {/* LOGO */}

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


        {/* DESKTOP NAV */}

        <nav className="hidden md:flex items-center gap-8">

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={(e) =>
                handleNavClick(e, link.href)
              }
              className="
                text-[15px]
                font-normal
                text-black
                hover:text-black
                transition
              "
            >
              {link.name}
            </Link>
          ))}

        </nav>


        {/* ACTIONS */}

        <div className="hidden md:flex items-center gap-5">

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="
                  text-sm
                  font-medium
                  text-zinc-900
                  hover:opacity-70
                "
              >
                Dashboard
              </Link>

              <button
                onClick={() => signOut()}
                className="
                  text-sm
                  text-zinc-700
                  hover:text-red-500
                "
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="
                  text-sm
                  font-medium
                  text-zinc-900
                  hover:opacity-80
                "
              >
                Log in
              </Link>

              <Link to="/signup">
                <button
                  className="
                    bg-black
                    text-white
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    rounded-md
                    hover:bg-zinc-800
                    transition
                  "
                >
                  Get Started
                </button>
              </Link>
            </>
          )}

        </div>


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
                    setIsMobileMenuOpen(false);
                    handleNavClick(e, link.href);
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
    </motion.header>
  );
};

export default Navbar;