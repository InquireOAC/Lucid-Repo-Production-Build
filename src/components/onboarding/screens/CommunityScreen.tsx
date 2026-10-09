import { useEffect, useState, useMemo } from "react";
import { GlassCard } from "../components";
import { Users, Globe, Heart } from "lucide-react";

const Constellation = () => {
  const dots = useMemo(
    () => [
      { x: 20, y: 25 }, { x: 75, y: 15 }, { x: 50, y: 50 },
      { x: 30, y: 70 }, { x: 80, y: 65 }, { x: 15, y: 45 },
      { x: 65, y: 35 }, { x: 45, y: 80 },
    ],
    []
  );
  const lines = useMemo(
    () => [[0, 2], [1, 6], [2, 6], [2, 3], [4, 6], [3, 7], [5, 0], [4, 7]] as const,
    []
  );
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={dots[a].x}
          y1={dots[a].y}
          x2={dots[b].x}
          y2={dots[b].y}
          stroke="hsl(var(--primary))"
          strokeOpacity={0.2}
          strokeWidth={0.3}
          style={{ animation: `onb-line-draw 2s ${i * 0.2}s ease-out both` }}
        />
      ))}
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={0.9}
          fill="hsl(var(--primary))"
          fillOpacity={0.7}
          style={{ animation: `onb-dot-pop 0.4s ${i * 0.15}s ease-out both` }}
        />
      ))}
    </svg>
  );
};

const cards = [
  { icon: Users, title: "Share Dreams", description: "Post the dreams brave enough to be seen." },
  { icon: Globe, title: "Lucid Repo", description: "Browse a living library of the world's dreams." },
  { icon: Heart, title: "Collective Patterns", description: "Discover the symbols dreamers share with you." },
];

const CommunityScreen = () => {
  const [show, setShow] = useState({ title: false, art: false, cards: false });

  useEffect(() => {
    const t = [
      setTimeout(() => setShow((s) => ({ ...s, title: true })), 200),
      setTimeout(() => setShow((s) => ({ ...s, art: true })), 500),
      setTimeout(() => setShow((s) => ({ ...s, cards: true })), 900),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start md:justify-center min-h-[60vh] md:min-h-[70vh] px-4 md:px-6 py-4 md:py-8">
      <div
        className={`text-center mb-4 md:mb-6 transition-all duration-1000 ${
          show.title ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <h2 className="text-2xl md:text-4xl font-bold mb-2">You're Not Alone in the Dark</h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
          Discover the dreams you hold in common with strangers across the world.
        </p>
      </div>

      <div
        className={`relative w-[200px] h-[120px] md:w-[260px] md:h-[140px] mb-4 md:mb-6 transition-opacity duration-1000 ${
          show.art ? "opacity-100" : "opacity-0"
        }`}
      >
        <Constellation />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl w-full">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <GlassCard
              key={c.title}
              className="h-full"
              style={{
                transitionDelay: `${i * 120}ms`,
                opacity: show.cards ? 1 : 0,
                transform: show.cards ? "translateY(0)" : "translateY(16px)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-foreground mb-1">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityScreen;