import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, BookOpen, Sparkles, Clapperboard, Compass } from "lucide-react";
import { LucidSigil } from "../components";

interface Props {
  onNext: () => void;
  onSkip: () => void;
}

const FEATURES = [
  { icon: BookOpen, title: "Journal", desc: "Capture your dreams" },
  { icon: Sparkles, title: "Visualize", desc: "See them come to life" },
  { icon: Clapperboard, title: "Cinematic", desc: "Turn dreams into films" },
  { icon: Compass, title: "Explore", desc: "Discover dreamscapes" },
];

const AwakeningScreen = ({ onNext, onSkip }: Props) => {
  const [s, setS] = useState({ sigil: false, brand: false, features: false, quote: false, cta: false });

  useEffect(() => {
    const t = [
      setTimeout(() => setS((x) => ({ ...x, sigil: true })), 200),
      setTimeout(() => setS((x) => ({ ...x, brand: true })), 900),
      setTimeout(() => setS((x) => ({ ...x, features: true })), 1600),
      setTimeout(() => setS((x) => ({ ...x, quote: true })), 2400),
      setTimeout(() => setS((x) => ({ ...x, cta: true })), 2900),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh] text-center px-6 py-6">
      {/* Logo */}
      <div className={`mb-5 transition-all duration-1000 ${s.sigil ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
        <LucidSigil size="md" animate="breathe" />
      </div>

      {/* Wordmark + tagline */}
      <h1
        className={`text-4xl md:text-5xl font-black tracking-[0.12em] transition-all duration-700 ${
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
        LUCID REPO
      </h1>
      <p
        className={`mt-2 text-[11px] md:text-xs uppercase tracking-[0.4em] text-primary/80 transition-all duration-700 ${
          s.brand ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        Engineer Your Dreams
      </p>

      {/* Feature list */}
      <div
        className={`mt-9 w-full max-w-xs space-y-3.5 text-left transition-all duration-700 ${
          s.features ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
              <p className="text-xs text-muted-foreground leading-tight">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quote */}
      <p
        className={`mt-9 max-w-xs text-sm text-muted-foreground italic leading-relaxed transition-all duration-700 ${
          s.quote ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        “The subconscious is more powerful than you know. Make it cinematic.”
      </p>

      {/* CTA */}
      <div
        className={`mt-9 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm sm:w-auto transition-all duration-700 ${
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
