import React from "react";
import { useNavigate } from "react-router-dom";
import type { Technique } from "./techniqueData";

interface TechniqueCardProps {
  technique: Technique;
  index: number;
}

const TechniqueCard: React.FC<TechniqueCardProps> = ({ technique, index }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/insights/technique/${index}`)}
      className="relative flex items-center justify-between rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-5 min-h-[140px] cursor-pointer transition-all duration-300 hover:border-primary/25 hover:bg-card/80 overflow-hidden group"
    >
      {/* Left content */}
      <div className="flex-1 min-w-0 pr-4 z-10">
        <h3 className="text-base font-bold text-foreground leading-tight">
          {technique.name}
          {technique.acronym && (
            <span className="text-primary ml-1.5 text-sm font-normal">
              ({technique.acronym})
            </span>
          )}
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
          {technique.shortDescription}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-medium">
            {technique.difficulty}
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`w-1.5 h-1.5 rounded-full ${
                  dot <= technique.difficultyRating
                    ? "bg-primary"
                    : "bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right icon with sparkle decorations */}
      <div className="relative shrink-0 flex items-center justify-center w-20 h-20">
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {technique.icon}
        </span>
        {/* Sparkle dots */}
        <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-accent/25 animate-pulse delay-300" />
        <div className="absolute top-3 left-0 w-1 h-1 rounded-full bg-primary/20 animate-pulse delay-700" />
      </div>
    </div>
  );
};

export default TechniqueCard;
