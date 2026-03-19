
import React, { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import lucidRepoLogo from "@/assets/LogoForFramer.png";
import {
  Moon,
  Brain,
  Sparkles,
  Film,
  Globe,
  Users,
  Mic,
  PenLine,
  Eye,
  Heart,
  Compass,
  Shield,
  FileText,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Particles                                                          */
/* ------------------------------------------------------------------ */

const STAR_COUNT = 80;

const Particles = React.memo(() => {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => {
        const isBright = Math.random() > 0.7;
        const isBlue = Math.random() > 0.5;
        return {
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: isBright ? Math.random() * 3 + 2 : Math.random() * 2 + 0.5,
          delay: Math.random() * 8,
          duration: Math.random() * 3 + 2,
          color: isBlue
            ? `hsla(220, 90%, 78%, ${isBright ? 0.9 : 0.4})`
            : `hsla(0, 0%, 100%, ${isBright ? 0.8 : 0.3})`,
          twinkle: isBright,
        };
      }),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            boxShadow: s.twinkle ? `0 0 ${s.size * 3}px ${s.color}` : undefined,
            animation: s.twinkle
              ? `onb-twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`
              : `onb-float ${s.duration + 4}s ${s.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
});
Particles.displayName = "Particles";

/* ------------------------------------------------------------------ */
/*  Pulsing Glow Ring                                                  */
/* ------------------------------------------------------------------ */

const GlowRing = ({ color = "hsl(var(--primary))", size = 140 }: { color?: string; size?: number }) => (
  <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
        animation: "onb-pulse-ring 3s ease-in-out infinite",
      }}
    />
    <div
      className="absolute rounded-full"
      style={{
        width: size * 0.7,
        height: size * 0.7,
        border: `2px solid ${color}55`,
        animation: "onb-pulse-ring 3s 0.5s ease-in-out infinite",
      }}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Orbital ring (used on screen 2)                                    */
/* ------------------------------------------------------------------ */

const OrbitalRing = () => (
  <div
    className="absolute rounded-full border border-primary/20"
    style={{
      width: 180,
      height: 180,
      animation: "onb-orbit 8s linear infinite",
    }}
  >
    <div
      className="absolute w-2 h-2 rounded-full bg-primary/60"
      style={{ top: -4, left: "50%", marginLeft: -4 }}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Constellation dots (used on screen 3)                              */
/* ------------------------------------------------------------------ */

const ConstellationDots = React.memo(() => {
  const dots = useMemo(
    () => [
      { x: 20, y: 25 }, { x: 75, y: 15 }, { x: 50, y: 50 },
      { x: 30, y: 70 }, { x: 80, y: 65 }, { x: 15, y: 45 },
      { x: 65, y: 35 }, { x: 45, y: 80 },
    ],
    []
  );

  const lines = useMemo(
    () => [
      [0, 2], [1, 6], [2, 6], [2, 3], [4, 6], [3, 7], [5, 0], [4, 7],
    ],
    []
  );

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={dots[a].x} y1={dots[a].y}
          x2={dots[b].x} y2={dots[b].y}
          stroke="hsl(var(--primary))"
          strokeOpacity={0.15}
          strokeWidth={0.3}
          style={{ animation: `onb-line-draw 2s ${i * 0.2}s ease-out both` }}
        />
      ))}
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x} cy={d.y} r={0.8}
          fill="hsl(var(--primary))"
          fillOpacity={0.5}
          style={{ animation: `onb-dot-pop 0.4s ${i * 0.15}s ease-out both` }}
        />
      ))}
    </svg>
  );
});
ConstellationDots.displayName = "ConstellationDots";

/* ------------------------------------------------------------------ */
/*  Ripple effect (used on screen 5)                                   */
/* ------------------------------------------------------------------ */

const Ripples = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="absolute rounded-full border border-primary/20"
        style={{
          width: 120 + i * 80,
          height: 120 + i * 80,
          animation: `onb-ripple 4s ${i * 1.2}s ease-out infinite`,
        }}
      />
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Portal animation (used on screen 6)                                */
/* ------------------------------------------------------------------ */

const Portal = () => (
  <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
    <div
      className="absolute rounded-full"
      style={{
        width: 160,
        height: 160,
        background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, hsl(var(--primary) / 0.1) 40%, transparent 70%)",
        animation: "onb-pulse-ring 2.5s ease-in-out infinite",
      }}
    />
    <div
      className="absolute rounded-full border-2 border-primary/30"
      style={{ width: 120, height: 120, animation: "onb-orbit 6s linear infinite" }}
    />
    <div
      className="absolute rounded-full border border-primary/20"
      style={{ width: 80, height: 80, animation: "onb-orbit 4s linear infinite reverse" }}
    />
    <div
      className="absolute w-10 h-10 rounded-full"
      style={{
        background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
        animation: "onb-pulse-ring 2s ease-in-out infinite",
      }}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Screen data                                                        */
/* ------------------------------------------------------------------ */

interface ScreenData {
  title: string;
  subtitle: string;
  renderVisual: () => React.ReactNode;
  gradient: string;
}

const screens: ScreenData[] = [
  {
    title: "",
    subtitle: "",
    gradient: "radial-gradient(ellipse at 50% 40%, hsl(220 60% 12%) 0%, hsl(225 70% 5%) 50%, #030810 100%)",
    renderVisual: () => (
      <div className="flex flex-col items-center gap-6">
        {/* Logo with glow */}
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlowRing size={180} />
          <img
            src={lucidRepoLogo}
            alt="Lucid Repo"
            className="absolute w-20 h-20 object-contain"
            style={{ filter: "drop-shadow(0 0 24px hsl(var(--primary) / 0.7))" }}
          />
        </motion.div>

        {/* Hello Dreamer */}
        <motion.p
          className="text-lg tracking-[0.3em] uppercase text-primary/80 font-light"
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
        >
          Hello Dreamer
        </motion.p>

        {/* Welcome to */}
        <motion.h1
          className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Welcome to
        </motion.h1>

        {/* Lucid Repo — grand reveal */}
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #3B82F6, #93C5FD, #ffffff, #93C5FD, #3B82F6)",
            backgroundSize: "300% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "onb-shimmer 4s linear infinite",
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Lucid Repo
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-sm text-muted-foreground max-w-xs leading-relaxed text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.8 }}
        >
          Your dreams hold secrets. It's time to decode them.
        </motion.p>
      </div>
    ),
  },
  {
    title: "Capture Every Dream",
    subtitle: "Record your dreams the moment you wake. Voice, text, or sketch — never lose a dream again.",
    gradient: "radial-gradient(ellipse at 50% 30%, hsl(215 55% 10%) 0%, hsl(220 70% 4%) 60%, #030810 100%)",
    renderVisual: () => (
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <OrbitalRing />
        <Moon className="text-primary" size={48} strokeWidth={1.5} />
        <Mic className="absolute text-primary/40" size={20} style={{ bottom: 30, left: 30 }} />
        <PenLine className="absolute text-primary/40" size={20} style={{ bottom: 30, right: 30 }} />
      </div>
    ),
  },
  {
    title: "AI-Powered Insights",
    subtitle: "Unlock hidden patterns. Our AI reveals the symbols, emotions, and meanings within your dreams.",
    gradient: "radial-gradient(ellipse at 50% 50%, hsl(225 50% 11%) 0%, hsl(220 65% 4%) 60%, #030810 100%)",
    renderVisual: () => (
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <ConstellationDots />
        <Brain className="text-primary relative z-10" size={48} strokeWidth={1.5} />
        <Sparkles
          className="absolute text-primary/60 z-10"
          size={20}
          style={{ top: 40, right: 50 }}
        />
      </div>
    ),
  },
  {
    title: "See Your Dreams Come Alive",
    subtitle: "Transform your dreams into stunning AI-generated artwork and cinematic videos. Watch your subconscious unfold before your eyes.",
    gradient: "radial-gradient(ellipse at 50% 40%, hsl(230 55% 12%) 0%, hsl(222 60% 5%) 55%, #030810 100%)",
    renderVisual: () => (
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <GlowRing size={180} color="hsl(260, 60%, 60%)" />
        <div className="absolute flex gap-4 z-10">
          <Sparkles className="text-primary" size={36} strokeWidth={1.5} />
          <Film className="text-primary" size={36} strokeWidth={1.5} />
        </div>
        <Eye className="absolute text-primary/30 z-10" size={18} style={{ bottom: 50 }} />
      </div>
    ),
  },
  {
    title: "Join the Dream Community",
    subtitle: "Share dreams, discover connections, and explore the collective unconscious with dreamers worldwide.",
    gradient: "radial-gradient(ellipse at 50% 50%, hsl(218 50% 10%) 0%, hsl(222 65% 4%) 60%, #030810 100%)",
    renderVisual: () => (
      <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
        <Ripples />
        <Globe className="text-primary relative z-10" size={48} strokeWidth={1.5} />
        <Users className="absolute text-primary/40 z-10" size={20} style={{ bottom: 60 }} />
        <Heart className="absolute text-primary/30 z-10" size={16} style={{ top: 55, right: 60 }} />
      </div>
    ),
  },
  {
    title: "Your Journey Begins",
    subtitle: "Step through the gateway. Thousands of dreamers are already inside.",
    gradient: "radial-gradient(ellipse at 50% 40%, hsl(225 55% 13%) 0%, hsl(220 60% 5%) 50%, #030810 100%)",
    renderVisual: () => (
      <div className="relative flex items-center justify-center">
        <Portal />
        <Compass className="absolute text-primary/60 z-10" size={28} />
      </div>
    ),
  },
  {
    title: "Terms & Privacy",
    subtitle: "Before you enter, please review and agree to our terms.",
    gradient: "radial-gradient(ellipse at 50% 40%, hsl(220 50% 10%) 0%, hsl(222 60% 4%) 50%, #030810 100%)",
    renderVisual: () => (
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        <GlowRing size={140} color="hsl(230, 60%, 60%)" />
        <div className="absolute flex gap-3 z-10">
          <Shield className="text-primary" size={36} strokeWidth={1.5} />
          <FileText className="text-primary" size={36} strokeWidth={1.5} />
        </div>
      </div>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Variants                                                           */
/* ------------------------------------------------------------------ */

const screenVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [direction, setDirection] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const { markTermsAsAccepted } = useTermsAcceptance();

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= screens.length || idx === currentScreen) return;
      setDirection(idx > currentScreen ? 1 : -1);
      setCurrentScreen(idx);
    },
    [currentScreen]
  );

  const handleNext = useCallback(() => goTo(currentScreen + 1), [currentScreen, goTo]);

  const handleStart = async () => {
    try {
      // Persist terms acceptance to Supabase
      try {
        await markTermsAsAccepted();
      } catch (e) {
        console.error("Failed to persist terms acceptance:", e);
      }

      if (Capacitor.isNativePlatform()) {
        try {
          await Preferences.set({ key: "hasSeenOnboarding", value: "true" });
        } catch {
          localStorage.setItem("hasSeenOnboarding", "true");
        }
      } else {
        localStorage.setItem("hasSeenOnboarding", "true");
      }
      onComplete();
    } catch {
      onComplete();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentScreen < screens.length - 1) goTo(currentScreen + 1);
      if (diff < 0 && currentScreen > 0) goTo(currentScreen - 1);
    }
    touchStartX.current = null;
  };

  const isLastScreen = currentScreen === screens.length - 1;
  const screen = screens[currentScreen];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden select-none"
      style={{ background: screen.gradient }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Particles */}
      <Particles />

      {/* Skip */}
      {!isLastScreen && (
        <button
          onClick={handleStart}
          className="absolute top-4 right-4 z-50 text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          Skip
        </button>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentScreen}
            custom={direction}
            variants={screenVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center gap-8"
          >
            {/* Visual */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            >
              {screen.renderVisual()}
            </motion.div>

            {/* Title */}
            {screen.title && (
              <motion.h1
                className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                {screen.title}
              </motion.h1>
            )}

            {/* Subtitle */}
            {screen.subtitle && (
              <motion.p
                className="text-sm sm:text-base text-muted-foreground max-w-xs leading-relaxed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                {screen.subtitle}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 pb-8"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        {/* Dot indicators */}
        <div className="flex gap-2">
          {screens.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300"
              style={{
                width: i === currentScreen ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i === currentScreen
                    ? "hsl(var(--primary))"
                    : "hsl(var(--primary) / 0.25)",
              }}
            />
          ))}
        </div>

        {/* Terms checkbox on last screen */}
        {isLastScreen && (
          <div className="flex flex-col items-center gap-4 px-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5 border-primary/50 data-[state=checked]:bg-primary"
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                I agree to the{" "}
                <a
                  href="https://lucidrepo.lovable.app/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Use
                </a>{" "}
                and{" "}
                <a
                  href="https://lucidrepo.lovable.app/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>
        )}

        {/* Action button */}
        {isLastScreen ? (
          <Button
            onClick={handleStart}
            disabled={!termsAccepted}
            className="w-64 h-14 text-base font-semibold rounded-full relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: termsAccepted ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)",
              boxShadow: termsAccepted
                ? "0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.2)"
                : "none",
            }}
          >
            <span className="relative z-10">Enter the Dream Realm</span>
            {termsAccepted && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.8), hsl(var(--primary)))",
                  animation: "onb-pulse-ring 2s ease-in-out infinite",
                }}
              />
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="outline"
            className="w-64 h-14 text-base font-semibold rounded-full border-primary/30 bg-primary/10 hover:bg-primary/20 text-foreground"
          >
            Next
          </Button>
        )}
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes onb-float {
          0% { transform: translateY(0) scale(1); opacity: var(--tw-opacity, 0.4); }
          100% { transform: translateY(-30px) scale(1.3); opacity: 0.1; }
        }
        @keyframes onb-pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes onb-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes onb-ripple {
          0% { transform: scale(0.8); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes onb-line-draw {
          0% { stroke-dasharray: 100; stroke-dashoffset: 100; }
          100% { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        @keyframes onb-dot-pop {
          0% { r: 0; opacity: 0; }
          100% { r: 0.8; opacity: 1; }
        }
        @keyframes onb-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes onb-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingFlow;
