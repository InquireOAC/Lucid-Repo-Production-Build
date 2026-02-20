import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import type { Technique } from "./techniqueData";
import { getDifficultyStyles } from "@/utils/techniqueStyles";

interface TechniqueCardProps {
  technique: Technique;
  index: number;
}

const TechniqueCard: React.FC<TechniqueCardProps> = ({ technique, index }) => {
  const navigate = useNavigate();
  const styles = getDifficultyStyles(technique.difficulty);

  return (
    <div
      onClick={() => navigate(`/insights/technique/${index}`)}
      className={`relative flex items-center justify-between rounded-2xl border ${styles.border} bg-gradient-to-r ${styles.gradient} backdrop-blur-md p-5 min-h-[140px] cursor-pointer transition-all duration-300 hover:brightness-110 overflow-hidden group`}
    >
      {/* Difficulty badge pill */}
      <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${styles.badgeBg} text-[10px] font-semibold uppercase tracking-wider z-10`}>
        <span>{technique.difficulty}</span>
        <div className="flex gap-0.5">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={`w-1.5 h-1.5 rounded-full ${
                dot <= technique.difficultyRating ? "bg-current opacity-100" : "bg-current opacity-25"
              }`}
            />
          ))}
        </div>
      </div>

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
        {/* Effectiveness stars */}
        <div className="flex items-center gap-1 mt-3">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= technique.effectiveness
                  ? "text-primary fill-primary"
                  : "text-muted-foreground/25"
              }`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground/60 ml-1 uppercase tracking-wider">
            effectiveness
          </span>
        </div>
      </div>

      {/* Right icon with frosted backdrop */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className={`w-20 h-20 rounded-full ${styles.iconBg} bg-white/5 backdrop-blur-sm flex items-center justify-center`}>
          <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
            {technique.icon}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TechniqueCard;
