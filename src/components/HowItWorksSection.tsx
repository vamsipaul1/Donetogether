import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowRight, Bot, CopyMinus, GitGraph, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

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
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "480px", // added to bound size
        height: 380, // Reduced from 440
        margin: "0 auto",
      }}
    >
      {STEPS.map((step, i) => {
        const offset = (i - active + STEPS.length) % STEPS.length;
        const pos = STACK[offset] ?? STACK[3];
        const isTop = offset === 0;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 100, rotateY: 180 }}
            className="bg-gradient-to-br from-background via-muted/35 to-background"
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
      style={{
        position: "relative",
        borderRadius: 20,
        border: "1px solid transparent",
        padding: "24px 32px",
        cursor: "pointer",
        overflow: "hidden",
      }}
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
            style={{
              fontFamily: "var(--font-body, ui-sans-serif, system-ui, sans-serif)",
              fontSize: 17,
              fontWeight: 500,
              color: "#111",
              lineHeight: 1.2,
              letterSpacing: "-0.015em",
              margin: 0,
              WebkitFontSmoothing: "antialiased",
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
          padding: "96px 0",
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
              className="hiw-header"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "#0a0a0a",
                lineHeight: 1.1,
                margin: "0 0 28px",
                whiteSpace: "nowrap",
                overflowWrap: "normal",
              }}
            >
              Everything you need to&nbsp;
              <span
                style={{
                  borderBottom: "2.5px solid #0a0a0a",
                  paddingBottom: 2,
                  fontWeight: 700,
                }}
              >
                build together
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
              alignItems: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <CardStack active={active} entered={isInView} />
            </motion.div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 480 }}>
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
