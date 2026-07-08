import { useEffect, useState } from "react";
import { LucidSigil } from "../components";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  onEnter: () => void;
}

const ThresholdScreen = ({ termsAccepted, setTermsAccepted, onEnter }: Props) => {
  const [show, setShow] = useState({ sigil: false, text: false, terms: false, cta: false });

  useEffect(() => {
    const t = [
      setTimeout(() => setShow((s) => ({ ...s, sigil: true })), 200),
      setTimeout(() => setShow((s) => ({ ...s, text: true })), 1500),
      setTimeout(() => setShow((s) => ({ ...s, terms: true })), 2100),
      setTimeout(() => setShow((s) => ({ ...s, cta: true })), 2500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh] text-center px-6">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[200px] md:h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center top, hsl(var(--primary) / 0.18) 0%, transparent 70%)" }}
      />

      <div
        className={`mb-6 md:mb-10 transition-all duration-1000 ${
          show.sigil ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        <LucidSigil size="md" animate="unlock" className="md:scale-125" />
      </div>

      <h1
        className={`text-2xl md:text-4xl font-bold text-primary mb-3 md:mb-4 transition-all duration-1000 ${
          show.text ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        The Threshold Is Yours
      </h1>
      <p
        className={`text-sm md:text-lg text-muted-foreground max-w-sm mb-8 transition-all duration-1000 delay-150 ${
          show.text ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        Step through. Thousands of dreamers are already on the other side.
      </p>

      <div
        className={`flex items-start gap-3 max-w-sm mb-6 transition-all duration-700 ${
          show.terms ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(c) => setTermsAccepted(c === true)}
          className="mt-0.5 border-primary/50 data-[state=checked]:bg-primary"
        />
        <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed text-left cursor-pointer">
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

      <div
        className={`w-full max-w-sm transition-all duration-700 ${
          show.cta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <Button
          onClick={onEnter}
          disabled={!termsAccepted}
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-full relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: termsAccepted
              ? "linear-gradient(135deg, hsl(var(--primary)), hsl(263 60% 55%))"
              : "hsl(var(--primary) / 0.3)",
            animation: termsAccepted ? "onb-border-glow 2.5s ease-in-out infinite" : undefined,
          }}
        >
          <span className="relative z-10">Enter the Dream Realm</span>
        </Button>
      </div>
    </div>
  );
};

export default ThresholdScreen;