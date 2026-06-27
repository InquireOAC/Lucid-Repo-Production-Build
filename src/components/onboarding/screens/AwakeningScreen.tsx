import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { LucidSigil } from "../components";

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

const AwakeningScreen = ({ onNext, onSkip }: Props) => {
  const [s, setS] = useState({ sigil: false, hello: false, welcome: false, brand: false, tag: false, cta: false });

  useEffect(() => {
    const t = [
      setTimeout(() => setS((x) => ({ ...x, sigil: true })), 200),
      setTimeout(() => setS((x) => ({ ...x, hello: true })), 900),
      setTimeout(() => setS((x) => ({ ...x, welcome: true })), 1500),
      setTimeout(() => setS((x) => ({ ...x, brand: true })), 2100),
      setTimeout(() => setS((x) => ({ ...x, tag: true })), 2800),
      setTimeout(() => setS((x) => ({ ...x, cta: true })), 3400),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh] text-center px-6 py-4">
      <div
        className={`mb-6 md:mb-8 transition-all duration-1000 ${s.sigil ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
      >
        <LucidSigil size="md" animate="breathe" className="md:scale-125" />
      </div>

      <p
        className={`text-[11px] md:text-sm tracking-[0.4em] uppercase text-primary/80 font-light mb-3 transition-all duration-700 ${
          s.hello ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        Hello Dreamer
      </p>

      <h1
        className={`text-xl md:text-3xl font-medium text-foreground tracking-tight transition-all duration-700 ${
          s.welcome ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        Welcome to
      </h1>

      <h1
        className={`mt-1 md:mt-2 text-4xl md:text-6xl font-extrabold tracking-tight transition-all duration-700 ${
          s.brand ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{
          background: "linear-gradient(135deg, #3B82F6, #93C5FD, #ffffff, #93C5FD, #3B82F6)",
          backgroundSize: "300% auto",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          animation: s.brand ? "onb-shimmer 5s linear infinite" : undefined,
        }}
      >
        Lucid Repo
      </h1>

      <p
        className={`mt-6 md:mt-8 max-w-xs md:max-w-sm text-sm md:text-base text-muted-foreground italic leading-relaxed transition-all duration-700 ${
          s.tag ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        Your dreams, as cinema. Record them, and watch them come alive.
      </p>

      <div
        className={`mt-10 md:mt-14 flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full max-w-sm sm:w-auto transition-all duration-700 ${
          s.cta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Button
          onClick={onNext}
          size="lg"
          className="group relative w-full sm:w-auto px-7 py-6 text-base font-semibold bg-primary hover:bg-primary/90 shadow-[0_0_30px_hsl(var(--primary)/0.35)] hover:shadow-[0_0_44px_hsl(var(--primary)/0.55)] min-h-[48px]"
        >
          <span className="flex items-center gap-2">
            Begin the Journey
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
        <Button onClick={onSkip} variant="ghost" className="text-muted-foreground hover:text-foreground min-h-[44px]">
          Skip
        </Button>
      </div>
    </div>
  );
};

export default AwakeningScreen;