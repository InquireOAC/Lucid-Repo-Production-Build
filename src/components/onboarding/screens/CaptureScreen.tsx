import { useEffect, useState } from "react";
import { GlassCard, AnimatedIcon } from "../components";
import type { DrawIconName } from "../components/AnimatedIcon";

const powers: { icon: DrawIconName; title: string; description: string }[] = [
  { icon: "mic", title: "Capture", description: "Speak or write your dream the moment you wake, before it fades." },
  { icon: "sparkles", title: "Generate Scenes", description: "Turn your words into striking AI dream imagery." },
  { icon: "moon", title: "Cinematic Shorts", description: "Stitch your scenes into a narrated ~30-second film." },
  { icon: "globe", title: "Share & Discover", description: "Post to the Repo and explore the dreams of others." },
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
        <h2 className="text-2xl md:text-4xl font-bold mb-2">Dreams Become Films</h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
          Capture the dream, then watch it become scenes — then a short cinematic, all from your words.
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