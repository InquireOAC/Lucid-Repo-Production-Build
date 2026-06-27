import React, { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { ChapterProgress } from "./components";
import DreamImageBackdrop from "@/components/ui/DreamImageBackdrop";
import { AwakeningScreen, CaptureScreen, ThresholdScreen } from "./screens";

interface OnboardingFlowProps {
  onComplete: () => void;
}

// Streamlined to three image-led chapters: a welcome, the create loop, and the
// threshold (which still carries the required terms-acceptance checkbox).
const CHAPTERS = ["Awakening", "Create", "Threshold"];

/* ----------------------------- Orchestrator ---------------------------- */

const screenVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const { markTermsAsAccepted } = useTermsAcceptance();

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= CHAPTERS.length || idx === step) return;
      setDirection(idx > step ? 1 : -1);
      setStep(idx);
    },
    [step]
  );

  const handleNext = useCallback(() => goTo(step + 1), [goTo, step]);
  const handleBack = useCallback(() => goTo(step - 1), [goTo, step]);

  const handleSkip = useCallback(async () => {
    try {
      await markTermsAsAccepted();
    } catch (e) {
      console.error("Failed to persist terms acceptance:", e);
    }
    onComplete();
  }, [markTermsAsAccepted, onComplete]);

  const handleEnter = useCallback(async () => {
    try {
      await markTermsAsAccepted();
    } catch (e) {
      console.error("Failed to persist terms acceptance:", e);
    }
    onComplete();
  }, [markTermsAsAccepted, onComplete]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handleBack();
    }
    touchStartX.current = null;
  };

  const isFirst = step === 0;
  const isLast = step === CHAPTERS.length - 1;

  const renderScreen = () => {
    switch (step) {
      case 0:
        return <AwakeningScreen onNext={handleNext} onSkip={handleSkip} />;
      case 1:
        return <CaptureScreen />;
      case 2:
        return (
          <ThresholdScreen
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
            onEnter={handleEnter}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden select-none h-[100dvh] bg-background"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Cinematic dream-imagery backdrop (real public dreams, Ken Burns) */}
      <DreamImageBackdrop dim={0.62} />

      {/* Film grain */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.018] z-[5] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc=\")",
        }}
      />

      {/* Misty fog */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 90% 40% at 50% 100%, hsla(220, 60%, 15%, 0.55) 0%, transparent 70%), radial-gradient(ellipse 70% 30% at 50% 0%, hsla(220, 50%, 10%, 0.40) 0%, transparent 60%)",
        }}
      />

      {/* Skip (chapters 2-4) */}
      {!isFirst && !isLast && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-50 text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
        >
          Skip
        </button>
      )}

      {/* Frame */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Chapter progress */}
        <div className="pt-4 md:pt-6 pb-2 px-2 shrink-0">
          <ChapterProgress currentStep={step} chapters={CHAPTERS} />
        </div>

        {/* Screen */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: "touch" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav for middle chapters */}
        {!isFirst && !isLast && (
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between items-center border-t border-white/[0.05] shrink-0 bg-background/40 backdrop-blur-sm">
            <Button onClick={handleBack} variant="ghost" className="text-muted-foreground hover:text-foreground h-11">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="h-11 px-5 bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.35)]"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes onb-float {
          0% { transform: translateY(0) scale(1); opacity: 0.4; }
          100% { transform: translateY(-30px) scale(1.3); opacity: 0.1; }
        }
        @keyframes onb-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes onb-shoot {
          0% { transform: rotate(20deg) translateX(0) scaleX(1); opacity: 1; }
          100% { transform: rotate(20deg) translateX(220px) scaleX(3); opacity: 0; }
        }
        @keyframes onb-sigil-breathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 18px hsl(var(--primary) / 0.55)); }
          50% { transform: scale(1.04); filter: drop-shadow(0 0 32px hsl(var(--primary) / 0.8)); }
        }
        @keyframes onb-sigil-unlock {
          0% { transform: scale(0.85); opacity: 0.6; filter: blur(6px) drop-shadow(0 0 0 hsl(var(--primary))); }
          60% { transform: scale(1.18); opacity: 1; filter: blur(0) drop-shadow(0 0 50px hsl(var(--primary))); }
          100% { transform: scale(1); opacity: 1; filter: blur(0) drop-shadow(0 0 28px hsl(var(--primary) / 0.7)); }
        }
        @keyframes onb-glow-pulse-soft {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.85; }
        }
        @keyframes onb-draw-icon { to { stroke-dashoffset: 0; } }
        @keyframes onb-particle-burst {
          0% { opacity: 1; }
          100% { opacity: 0; transform: var(--final-transform, rotate(0deg) translateY(-80px)); }
        }
        @keyframes onb-shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes onb-line-draw {
          0% { stroke-dasharray: 100; stroke-dashoffset: 100; }
          100% { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        @keyframes onb-dot-pop {
          0% { r: 0; opacity: 0; }
          100% { r: 0.9; opacity: 1; }
        }
        @keyframes onb-border-glow {
          0%, 100% { box-shadow: 0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.25); }
          50% { box-shadow: 0 0 35px hsl(var(--primary) / 0.8), 0 0 70px hsl(var(--primary) / 0.4); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingFlow;