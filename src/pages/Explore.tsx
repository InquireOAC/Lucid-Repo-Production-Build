import React, { useState, useMemo } from "react";
import { Search, Compass, Wand2, Brain, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserSearchResults from "@/components/explore/UserSearchResults";
import TechniqueGridCard from "@/components/explore/TechniqueGridCard";
import { techniques } from "@/components/insights/techniqueData";
import { getDifficultyStyles } from "@/utils/techniqueStyles";

const meditations = [
  { icon: "🫁", name: "Breath Focus", description: "Anchor awareness on your breath to calm the mind and improve dream recall." },
  { icon: "🧘", name: "Body Scan", description: "Systematically relax each body part to enter a deeply receptive state before sleep." },
  { icon: "🌌", name: "Visualization", description: "Picture vivid dream scenes to prime your subconscious for lucid entry." },
  { icon: "🔔", name: "Mindful Awareness", description: "Cultivate present-moment attention that carries into your dream state." },
];

const dailyTips = [
  "Keep a dream journal by your bed — writing immediately after waking dramatically improves recall.",
  "Perform reality checks throughout the day: try pushing your finger through your palm.",
  "Set an intention before sleep: 'Tonight I will realize I'm dreaming.'",
  "Wake up 5 hours after sleeping, stay up briefly, then go back to sleep for vivid lucid dreams (WBTB).",
  "Look for recurring dream signs in your journal — they're your gateway to lucidity.",
  "Meditate for even 5 minutes before bed to sharpen your dream awareness.",
  "Visualize a recent dream as you fall asleep, but imagine becoming lucid within it.",
];

const difficultyOrder = ["Beginner", "Intermediate", "Advanced"] as const;

const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const todayTip = dailyTips[new Date().getDay()];

  const grouped = useMemo(() => {
    return difficultyOrder.map((level) => ({
      level,
      items: techniques
        .map((t, i) => ({ technique: t, index: i }))
        .filter(({ technique }) => technique.difficulty === level),
    }));
  }, []);

  return (
    <div className="min-h-screen pt-safe-top">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">Explore</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-7">Discover techniques and deepen your practice</p>
      </div>

      <div className="px-4 space-y-5">
        {/* User Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full border-primary/15 bg-card/60 backdrop-blur-md focus:ring-primary/30"
          />
        </div>

        <UserSearchResults query={searchQuery} />

        {/* Techniques grouped by difficulty */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Techniques</h2>
          </div>
          {grouped.map(({ level, items }) => {
            const styles = getDifficultyStyles(level);
            return (
              <div key={level}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${styles.badgeBg}`}>
                    {level}
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
                  {items.map(({ technique, index }) => (
                    <div key={index} className="shrink-0 w-[140px]">
                      <TechniqueGridCard technique={technique} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Tip Banner */}
        <div className="featured-card rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 shrink-0">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-1">Quick Tip</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{todayTip}</p>
            </div>
          </div>
        </div>

        {/* Meditation Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Meditation</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {meditations.map((m, i) => (
              <div
                key={i}
                className="glass-card flex flex-col items-center rounded-2xl p-4 h-[160px] justify-center border-t-[3px] border-t-primary/40 hover:border-t-primary/70 transition-all duration-300 hover:shadow-[0_0_15px_hsla(var(--primary)/0.15)]"
              >
                <span className="text-[32px] leading-none mb-2">{m.icon}</span>
                <h3 className="text-[13px] font-bold text-foreground text-center leading-tight">{m.name}</h3>
                <p className="text-[10px] text-muted-foreground text-center mt-1 line-clamp-3">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
