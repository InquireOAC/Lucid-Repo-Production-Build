import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Technique } from "./techniqueData";

import realityChecksImg from "@/assets/techniques/reality-checks.jpeg";
import wildImg from "@/assets/techniques/wild.jpeg";
import ssildImg from "@/assets/techniques/ssild.jpeg";
import fildImg from "@/assets/techniques/fild.jpeg";
import deildImg from "@/assets/techniques/deild.jpeg";
import meditationImg from "@/assets/techniques/meditation.jpeg";

const TECHNIQUE_IMAGES: Record<number, string> = {
  0: realityChecksImg,
  3: wildImg,
  4: ssildImg,
  5: fildImg,
  6: deildImg,
  7: meditationImg,
};

interface TechniqueCardProps {
  technique: Technique;
  index: number;
}

const Meter: React.FC<{ value: number; max?: number }> = ({ value, max = 3 }) => (
  <div className="flex gap-1">
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        className={`h-1 w-4 rounded-full ${i < value ? "bg-primary" : "bg-foreground/15"}`}
      />
    ))}
  </div>
);

const TechniqueCard: React.FC<TechniqueCardProps> = ({ technique, index }) => {
  const navigate = useNavigate();
  const hero = TECHNIQUE_IMAGES[index];

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => navigate(`/insights/technique/${index}`)}
      className="group relative w-full overflow-hidden rounded-2xl bg-glass border border-glass backdrop-blur-xl text-left flex flex-col"
    >
      {/* Hero */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {hero ? (
          <img
            src={hero}
            alt={technique.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-background flex items-center justify-center">
            <span className="text-6xl opacity-60">{technique.icon}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-md bg-background/70 backdrop-blur-md text-ink-soft border border-glass">
            {technique.difficulty}
          </span>
        </div>
        <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 text-foreground/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="text-base font-medium text-foreground leading-tight tracking-tight">
            {technique.name}
            {technique.acronym && (
              <span className="font-mono text-primary/80 ml-2 text-xs uppercase tracking-wider">
                {technique.acronym}
              </span>
            )}
          </h3>
          <p className="text-xs text-ink-soft mt-1.5 line-clamp-2 leading-relaxed">
            {technique.shortDescription}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-glass">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-faint">Difficulty</span>
            <Meter value={technique.difficultyRating} />
          </div>
          <div className="flex flex-col gap-1 items-end">
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-faint">Effective</span>
            <Meter value={technique.effectiveness} />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default TechniqueCard;
