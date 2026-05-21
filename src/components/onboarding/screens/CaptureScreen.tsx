import { useEffect, useState } from "react";
import { GlassCard, AnimatedIcon } from "../components";
import type { DrawIconName } from "../components/AnimatedIcon";

const powers: { icon: DrawIconName; title: string; description: string }[] = [
  { icon: "mic", title: "Voice Capture", description: "Speak it before it fades — full transcription on wake." },
  { icon: "pen", title: "Written Journal", description: "A canvas for the fragments your morning mind remembers." },
  { icon: "moon", title: "Lucidity Tracking", description: "Mark every flicker of awareness inside the dream." },
  { icon: "tag", title: "Dream Tags", description: "Symbols, people, places — your private dream lexicon." },
];

const CaptureScreen = () => {
  const [show, setShow] = useState({ title: false, cards: false });

  useEffect(() => {
    const t = [
      setTimeout(() => setShow((s) => ({ ...s, title: true })), 200),
      setTimeout(() => setShow((s) => ({ ...s, cards: true })), 700),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start md:justify-center min-h-[60vh] md:min-h-[70vh] px-4 md:px-6 py-4 md:py-8">
      <div
        className={`text-center mb-6 md:mb-10 transition-all duration-1000 ${
          show.title ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <h2 className="text-2xl md:text-4xl font-bold mb-2">Capture Every Dream</h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
          Every dream is a message. Catch it before it dissolves into morning.
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 max-w-2xl w-full`}>
        {powers.map((p, i) => (
          <GlassCard
            key={p.title}
            className="h-full"
            style={{
              transitionDelay: `${i * 120}ms`,
              opacity: show.cards ? 1 : 0,
              transform: show.cards ? "translateY(0)" : "translateY(18px)",
            }}
          >
            <div className="flex items-start gap-3 md:gap-4">
              <AnimatedIcon icon={p.icon} delay={700 + i * 180} />
              <div>
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">{p.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default CaptureScreen;