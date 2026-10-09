import { useEffect, useState } from "react";
import { Moon, Star, Brain, Eye, Archive } from "lucide-react";

const steps = [
  { icon: Moon, title: "Dream Input", description: "Capture it the moment you wake" },
  { icon: Star, title: "Symbol Analysis", description: "Surface the hidden language" },
  { icon: Brain, title: "Pattern Recognition", description: "Find the threads across nights" },
  { icon: Eye, title: "AI Interpretation", description: "Decode what your mind is saying" },
  { icon: Archive, title: "Personal Archive", description: "Build your dream repository" },
];

const FlowDiagram = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((p) => (p + 1) % steps.length);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto px-2">
      {/* Desktop */}
      <div className="hidden md:block relative">
        <div className="absolute top-7 left-[10%] right-[10%] h-px bg-white/10">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between relative z-10">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = i <= activeStep;
            const isCurrent = i === activeStep;
            return (
              <div key={s.title} className="flex flex-col items-center text-center w-1/5">
                <div
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive
                      ? "bg-primary/20 border-2 border-primary shadow-[0_0_28px_hsl(var(--primary)/0.45)]"
                      : "bg-white/5 border border-white/20"
                  } ${isCurrent ? "scale-110" : ""}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {isCurrent && <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />}
                </div>
                <div className={`mt-3 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-40"}`}>
                  <h4 className="text-xs font-semibold text-foreground">{s.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i <= activeStep;
          const isCurrent = i === activeStep;
          return (
            <div
              key={s.title}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                isCurrent ? "bg-primary/10 border border-primary/30" : "bg-white/[0.02] border border-white/[0.04]"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isActive ? "bg-primary/20 border border-primary" : "bg-white/5 border border-white/20"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className={`transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-50"}`}>
                <h4 className="text-sm font-semibold text-foreground leading-tight">{s.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlowDiagram;