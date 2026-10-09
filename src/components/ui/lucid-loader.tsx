import { cn } from "@/lib/utils";
import logoSrc from "@/assets/lucid-logo.png";

type Size = "sm" | "md" | "lg" | "xl";

interface LucidLoaderProps {
  size?: Size;
  label?: string;
  fullscreen?: boolean;
  className?: string;
}

const sizeMap: Record<Size, { box: string }> = {
  sm: { box: "w-8 h-8" },
  md: { box: "w-14 h-14" },
  lg: { box: "w-24 h-24" },
  xl: { box: "w-36 h-36" },
};

/**
 * Lucid Studios shared loading state.
 * - Logo softly breathes (opacity + scale)
 * - Diagonal light-wipe sweeps across the logo silhouette
 * - Blurred primary-tinted ring pulses behind it
 */
export function LucidLoader({
  size = "lg",
  label,
  fullscreen = false,
  className,
}: LucidLoaderProps) {
  const { box } = sizeMap[size];

  const inner = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className={cn("relative", box)}>
        <div
          className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-logo-glow"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 rounded-full bg-primary/10 blur-xl scale-110"
          aria-hidden="true"
        />
        <img
          src={logoSrc}
          alt="Lucid"
          className="relative w-full h-full object-contain drop-shadow-[0_0_18px_hsl(var(--primary)/0.4)] animate-logo-breathe"
          draggable={false}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none mix-blend-screen animate-logo-shimmer"
          style={{
            backgroundImage:
              "linear-gradient(115deg, transparent 35%, hsl(var(--primary) / 0.0) 42%, hsl(0 0% 100% / 0.85) 50%, hsl(var(--primary) / 0.0) 58%, transparent 65%)",
            backgroundSize: "250% 100%",
            backgroundRepeat: "no-repeat",
            WebkitMaskImage: `url(${logoSrc})`,
            maskImage: `url(${logoSrc})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      </div>

      {label && (
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground/80">
          {label}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="flex min-h-screen w-full items-center justify-center bg-background safe-area-inset-top"
      >
        {inner}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      {inner}
    </div>
  );
}

export default LucidLoader;