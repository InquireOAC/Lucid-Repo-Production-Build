import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Headphones } from "lucide-react";

interface Props {
  dream: DreamEntry;
  width?: "sm" | "md";
}

const PosterCard: React.FC<Props> = ({ dream, width = "md" }) => {
  const navigate = useNavigate();
  const imageUrl = dream.generatedImage || dream.image_url;
  const w = width === "sm" ? "w-[110px]" : "w-[130px] md:w-[150px]";

  return (
    <button
      type="button"
      onClick={() => {
        const from = window.location.pathname + window.location.search;
        navigate(`/lucid-repo/${dream.id}?from=${encodeURIComponent(from)}`);
      }}
      className={`flex-shrink-0 ${w} snap-start text-left stable-card`}
    >
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted/30">
        {imageUrl ? (
          <img src={imageUrl} alt={dream.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-3xl">🌙</span>
          </div>
        )}
        {dream.lucid && (
          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/90 text-primary-foreground uppercase">
            Lucid
          </span>
        )}
        {dream.audio_url && (
          <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-5 w-5 rounded-full bg-black/60 text-white">
            <Headphones className="h-2.5 w-2.5" />
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-foreground/90 line-clamp-1 font-medium">{dream.title}</p>
    </button>
  );
};

export default PosterCard;