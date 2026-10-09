import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Moon } from "lucide-react";

interface Props {
  dream: DreamEntry;
  rank: number;
}

const TopTenCard: React.FC<Props> = ({ dream, rank }) => {
  const navigate = useNavigate();
  const imageUrl = dream.generatedImage || dream.image_url;

  return (
    <button
      type="button"
      onClick={() => {
        const from = window.location.pathname + window.location.search;
        navigate(`/lucid-repo/${dream.id}?from=${encodeURIComponent(from)}`);
      }}
      className="flex-shrink-0 snap-start flex items-end gap-0 stable-card"
    >
      <span
        className="text-[110px] md:text-[140px] font-black leading-none tracking-tighter text-transparent select-none"
        style={{
          WebkitTextStroke: "2px hsl(var(--foreground) / 0.85)",
          fontFamily: "Impact, 'Arial Black', sans-serif",
          lineHeight: "0.8",
        }}
      >
        {rank}
      </span>
      <div className="relative w-[100px] md:w-[120px] aspect-[2/3] rounded-md overflow-hidden bg-muted/30 -ml-2">
        {imageUrl ? (
          <img src={imageUrl} alt={dream.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Moon className="h-8 w-8 text-foreground/40" />
          </div>
        )}
      </div>
    </button>
  );
};

export default TopTenCard;