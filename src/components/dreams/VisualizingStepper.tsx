import React from "react";
import { Search, Layers, Sparkles, Clapperboard, Lightbulb } from "lucide-react";
import DreamImageBackdrop from "@/components/ui/DreamImageBackdrop";

export const VISUALIZE_STAGES = [
  { key: "analyzing", label: "Analyzing Dream", icon: Search },
  { key: "crafting", label: "Crafting Scenes", icon: Layers },
  { key: "generating", label: "Generating Visuals", icon: Sparkles },
  { key: "assembling", label: "Assembling Cinematic", icon: Clapperboard },
] as const;

const TIPS = [
  "The more details you add, the more vivid your dream becomes.",
  "Name the people in your dream to keep their faces consistent across scenes.",
  "Strong emotions make for stronger cinematics.",
];

interface VisualizingStepperProps {
  /** 0..3 — which stage is currently active. */
  activeIndex: number;
  /** 0..100 overall progress for the active stage. */
  progress?: number;
  title?: string;
  subtitle?: string;
  tip?: string;
}

/** Full-screen "Visualizing Your Dream" progress overlay (matches the mockup). */
const VisualizingStepper: React.FC<VisualizingStepperProps> = ({
  activeIndex,
  progress = 0,
  title = "Visualizing Your Dream",
  subtitle = "Bringing your dream to life…",
  tip = TIPS[0],
}) => {
  return (
    <div className="fixed inset-0 z-[120] bg-background flex flex-col" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <DreamImageBackdrop dim={0.66} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-10">{subtitle}</p>

        {/* Stage stepper */}
        <div className="flex items-start justify-center gap-2 sm:gap-4 w-full max-w-md mb-6">
          {VISUALIZE_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const done = i < activeIndex;
            const active = i === activeIndex;
            return (
              <React.Fragment key={stage.key}>
                <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                  <div
                    className={[
                      "h-11 w-11 rounded-full flex items-center justify-center border transition-all",
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_24px_hsl(var(--primary)/0.5)]"
                        : done
                        ? "bg-primary/20 text-primary border-primary/40"
                        : "bg-white/[0.04] text-muted-foreground border-white/10",
                    ].join(" ")}
                  >
                    <Icon className={["h-5 w-5", active ? "animate-pulse" : ""].join(" ")} />
                  </div>
                  <span
                    className={[
                      "text-[10px] leading-tight",
                      active ? "text-foreground font-semibold" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {stage.label}
                  </span>
                </div>
                {i < VISUALIZE_STAGES.length - 1 && (
                  <div className="h-11 flex items-center">
                    <div className={["h-px w-4 sm:w-6", done ? "bg-primary/50" : "bg-white/10"].join(" ")} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
            />
          </div>
          <p className="text-right text-xs text-muted-foreground mt-1">{Math.round(progress)}%</p>
        </div>

        {/* Lucid tip */}
        <div className="mt-8 w-full max-w-md flex items-start gap-3 rounded-xl glass-card p-4 text-left">
          <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Lucid Tip</p>
            <p className="text-xs text-muted-foreground mt-0.5">{tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizingStepper;
