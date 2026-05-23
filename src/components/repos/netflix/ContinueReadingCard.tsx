import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Play, Info } from "lucide-react";

interface Props {
  dream: DreamEntry;
  progress?: number; // 0-1
}

const ContinueReadingCard: React.FC<Props> = ({ dream, progress = 0.4 }) => {
  const navigate = useNavigate();
  const imageUrl = dream.generatedImage || dream.image_url;

  const open = () => {
    const from = window.location.pathname + window.location.search;
    navigate(`/lucid-repo/${dream.id}?from=${encodeURIComponent(from)}`);
  };

  return (
    <div className="flex-shrink-0 w-[230px] md:w-[260px] snap-start stable-card">
      <button
        type="button"
        onClick={open}
        className="relative block w-full aspect-video rounded-md overflow-hidden bg-muted/30 group"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={dream.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-2xl">🌙</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="h-11 w-11 rounded-full border-2 border-white/90 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Play className="h-5 w-5 text-white fill-current ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
          <div className="h-full bg-primary" style={{ width: `${Math.max(8, progress * 100)}%` }} />
        </div>
      </button>
      <div className="flex items-center justify-between mt-1.5 px-0.5">
        <p className="text-[11px] text-foreground/90 line-clamp-1 font-medium flex-1">{dream.title}</p>
        <button onClick={open} className="text-muted-foreground hover:text-foreground ml-2">
          <Info className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ContinueReadingCard;