interface ChapterProgressProps {
  currentStep: number;
  chapters: string[];
}

const ChapterProgress = ({ currentStep, chapters }: ChapterProgressProps) => (
  <div className="flex items-center justify-center gap-0.5 md:gap-3 px-2 overflow-x-auto">
    {chapters.map((chapter, index) => {
      const isPast = index < currentStep;
      const isCurrent = index === currentStep;
      return (
        <div key={chapter} className="flex items-center shrink-0">
          <div className="flex flex-col items-center gap-1 md:gap-2">
            <div
              className={`relative w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-500 ${
                isCurrent
                  ? "bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.8)]"
                  : isPast
                    ? "bg-primary/60"
                    : "bg-white/20 border border-white/30"
              }`}
            >
              {isCurrent && <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />}
            </div>
            <span
              className={`text-[8px] md:text-[10px] font-medium tracking-[0.18em] uppercase whitespace-nowrap transition-all duration-500 ${
                isCurrent ? "text-primary" : isPast ? "text-muted-foreground" : "text-muted-foreground/50"
              }`}
            >
              {chapter}
            </span>
          </div>
          {index < chapters.length - 1 && (
            <div className="w-4 md:w-14 h-px mx-1 md:mx-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10" />
              <div
                className="absolute inset-0 bg-gradient-to-r from-primary/70 to-primary/30 transition-transform duration-700 origin-left"
                style={{ transform: `scaleX(${isPast ? 1 : isCurrent ? 0.5 : 0})` }}
              />
            </div>
          )}
        </div>
      );
    })}
  </div>
);

export default ChapterProgress;