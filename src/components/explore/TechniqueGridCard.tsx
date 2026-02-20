import React from "react";
import { useNavigate } from "react-router-dom";
import type { Technique } from "@/components/insights/techniqueData";

interface TechniqueGridCardProps {
  technique: Technique;
  index: number;
}

const TechniqueGridCard: React.FC<TechniqueGridCardProps> = ({ technique, index }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/insights/technique/${index}`)}
      className="flex flex-col items-center justify-center rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-4 h-[130px] cursor-pointer transition-all duration-300 hover:border-primary/25 hover:bg-card/80 group"
    >
      <span className="text-[40px] leading-none group-hover:scale-110 transition-transform duration-300">
        {technique.icon}
      </span>
      <h3 className="text-[13px] font-bold text-foreground text-center mt-2 leading-tight line-clamp-2">
        {technique.name}
      </h3>
      <div className="flex gap-0.5 mt-2">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={`w-1.5 h-1.5 rounded-full ${
              dot <= technique.difficultyRating ? "bg-primary" : "bg-muted-foreground/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TechniqueGridCard;
