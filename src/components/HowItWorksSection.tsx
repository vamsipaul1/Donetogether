import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowRight, Bot, CopyMinus, GitGraph, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

const FontLoader = () => (
  <style>{`
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,900&display=swap');
    .hiw-header, .hiw-header * { font-family: 'Satoshi', sans-serif; }
    .hiw-header { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  `}</style>
);

const STEPS = [
  {
    id: 0,
    number: "01",
    icon: GitGraph,
    title: "Create Your Project",
    description:
      "Set up your workspace, invite teammates, and define your goal in minutes.",
    image: "/card1.png",
  },
  {
    id: 1,
    number: "02",
    icon: CopyMinus,
    title: "Collaborate & Work",
    description:
      "Chat with your team, complete tasks, and update progress in real time.",
    image: "/card2.png",
  },
  {
    id: 2,
    number: "03",
    icon: Bot,
    title: "Plan with AI",
    description:
      "Enter your idea and let AI generate milestones and weekly goals.",
    image: "/card3.png",
  },
  {
    id: 3,
    number: "04",
    icon: Loader2,
    title: "Track & Finish",
    description:
      "Track progress, receive alerts, and complete your project on time.",
    image: "/card4.png",
  },
];

const AUTO_MS = 3800;

const STACK = [
  { y: 0, x: 0, rotate: 0, scale: 1, zIndex: 40 },
  { y: 14, x: 10, rotate: 3, scale: 0.96, zIndex: 30 },
  { y: 24, x: -8, rotate: -2, scale: 0.92, zIndex: 20 },
  { y: 32, x: 14, rotate: 5, scale: 0.88, zIndex: 10 },
];

const CardStack = ({ active, entered }: { active: number; entered: boolean }) => {
  return (
    <div
      className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[380px] aspect-[1.35/1] mx-auto mb-16 lg:mb-0"
    >
      {STEPS.map((step, i) => {
        const offset = (i - active + STEPS.length) % STEPS.length;
        const pos = STACK[offset] ?? STACK[3];
        const isTop = offset === 0;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 100, rotateY: 180 }}
            className="bg-zinc-950"
            animate={
              entered
                ? {
                  opacity: 1,
                  y: pos.y,
                  x: pos.x,
                  rotate: pos.rotate,
                  scale: pos.scale,
                  zIndex: pos.zIndex,
                  rotateY: 0,
                }
                : {}
            }
            transition={{
              opacity: { duration: 0.45, delay: i * 0.12, ease: "easeOut" },
              y: {
                duration: 0.7,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              },
              rotateY: {
                duration: 0.75,
                delay: i * 0.12 + 0.15,
                ease: [0.22, 1, 0.36, 1],
              },
              x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              rotate: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              zIndex: { duration: 0 },
            }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 20,
              overflow: "hidden",
              transformOrigin: "bottom center",
              willChange: "transform, opacity",
              border: isTop
                ? "1.5px solid rgba(0,0,0,0.10)"
                : "1px solid rgba(0,0,0,0.06)",
              boxShadow: isTop
                ? "0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)"
                : "0 4px 16px rgba(0,0,0,0.05)",
            }}
          >
            <img
              src={step.image}
              alt={step.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            {!isTop && (
              <div className="pointer-events-none absolute inset-0 bg-background/25" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

const StepRow = ({
  step,
  isActive,
  onActivate,
}: {
  step: (typeof STEPS)[number];
  isActive: boolean;
  onActivate: () => void;
}) => {
  const Icon = step.icon;

  return (
    <motion.div
      onMouseEnter={onActivate}
      onClick={onActivate}
      animate={{
        background: isActive ? "hsl(var(--muted))" : "transparent",
        borderColor: isActive ? "rgba(0,0,0,0.06)" : "transparent",
        boxShadow: isActive
          ? "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.02)"
          : "0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.6 }}
      className={clsx(
        "relative rounded-[24px] border border-transparent cursor-pointer overflow-hidden transition-all duration-500",
        "px-5 py-6 sm:px-8 sm:py-6",
        "flex flex-col items-center text-center lg:items-start lg:text-left"
      )}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          position: "relative",
          zIndex: 2,
        }}
      >


        <div style={{ flex: 1, minWidth: 0 }}>


          <p
            className="text-[17px] sm:text-[18px] font-semibold tracking-tight leading-tight text-zinc-800 "
            style={{
              fontFamily: "var(--font-header, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            {step.title}
          </p>

          <AnimatePresence>
            {isActive && (
              <motion.p
                initial={{ opacity: 0, height: 0, scale: 0.98, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", scale: 1, marginTop: 8 }}
                exit={{ opacity: 0, height: 0, scale: 0.98, marginTop: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="
                  font-body
                  text-[15px]
                  leading-[24px]
                  tracking-[-0.03em]
                  text-zinc-800
                  max-w-[440px]
                  antialiased
                "
                style={{
                  margin: 0,
                  overflow: "hidden",
                  MozOsxFontSmoothing: "grayscale",
                }}
              >
                {step.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
};

const HowItWorksSection = () => {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, AUTO_MS);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleActivate = useCallback(
    (id: number) => {
      if (id === active) return;
      setActive(id);
      resetTimer();
    },
    [active, resetTimer],
  );

  return (
    <>
      <FontLoader />

      <section
        id="how-it-works"
        ref={sectionRef}
        className="hiw-section"
        style={{
          padding: "64px 0",
          background: "hsl(var(--background))",
          borderTop: "1px solid transparent",
        }}
      >
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              textAlign: "center",
              maxWidth: 860,
              margin: "0 auto 72px",
            }}
          >
            <h2
              className="hiw-header text-[28px] xs:text-[34px] sm:text-[48px] font-black leading-[1.15] sm:leading-[1.1] tracking-tight text-[#0a0a0a] mb-6 px-4 md:px-0"
            >
              Everything you need to{" "}
              <span className="relative inline-block">
                <span className="relative z-10">build together</span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '100%' } : { width: 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "circOut" }}
                  className="absolute bottom-[-1px] left-0 h-[3px] bg-violet-600 rounded-full"
                />
              </span>
            </h2>

            <p
              className="
                font-body
                text-[16.5px]
                leading-[24px]
                tracking-[-0.03em]
                text-zinc-800
                max-w-[480px]
                mx-auto
                antialiased
              "
              style={{ MozOsxFontSmoothing: "grayscale" }}
            >
              Built for students and startup founders to plan, collaborate, and
              execute with clarity from first idea to final delivery.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardStack active={active} entered={isInView} />
            </motion.div>

            <div className="flex flex-col gap-4 w-full max-w-[520px] mx-auto lg:mx-0">
              {STEPS.map((step) => (
                <StepRow
                  key={step.id}
                  step={step}
                  isActive={active === step.id}
                  onActivate={() => handleActivate(step.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorksSection;
