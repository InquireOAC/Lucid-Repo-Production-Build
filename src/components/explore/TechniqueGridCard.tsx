import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import type { Technique } from "@/components/insights/techniqueData";
import { getDifficultyStyles } from "@/utils/techniqueStyles";

interface TechniqueGridCardProps {
  technique: Technique;
  index: number;
}

const TechniqueGridCard: React.FC<TechniqueGridCardProps> = ({ technique, index }) => {
  const navigate = useNavigate();
  const styles = getDifficultyStyles(technique.difficulty);

  return (
    <div
      onClick={() => navigate(`/insights/technique/${index}`)}
      className={`relative flex flex-col items-center justify-center rounded-2xl border ${styles.border} bg-gradient-to-br ${styles.gradient} backdrop-blur-md p-4 h-[160px] cursor-pointer transition-all duration-300 hover:brightness-110 group`}
    >

      {/* Icon */}
      <span className="text-[36px] leading-none group-hover:scale-110 transition-transform duration-300 mb-2">
        {technique.icon}
      </span>

      <h3 className="text-[13px] font-bold text-foreground text-center leading-tight line-clamp-2">
        {technique.name}
      </h3>

      {/* Difficulty dots + effectiveness stars */}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex gap-0.5">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={`w-1.5 h-1.5 rounded-full ${
                dot <= technique.difficultyRating ? "bg-primary" : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
        <div className="w-px h-3 bg-muted-foreground/20" />
        <div className="flex gap-0.5">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-2.5 h-2.5 ${
                star <= technique.effectiveness
                  ? "text-primary fill-primary"
                  : "text-muted-foreground/25"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechniqueGridCard;
