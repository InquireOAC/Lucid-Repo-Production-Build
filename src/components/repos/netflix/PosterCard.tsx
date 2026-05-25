import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Moon } from "lucide-react";

interface Props {
  dream: DreamEntry;
  width?: "sm" | "md";
}

const pickPoster = (dream: DreamEntry): string | undefined => {
  if (dream.generatedImage) return dream.generatedImage;
  if (dream.image_url) return dream.image_url;
  const sec = dream.section_images?.find((s) => s.image_url);
  return sec?.image_url;
};

const PosterCard: React.FC<Props> = ({ dream, width = "md" }) => {
  const navigate = useNavigate();
  const imageUrl = pickPoster(dream);
  const w = width === "sm" ? "w-[110px]" : "w-[130px] md:w-[150px]";

  const handleClick = () => {
    const from = window.location.pathname + window.location.search;
    navigate(`/lucid-repo/${dream.id}?from=${encodeURIComponent(from)}`);
  };

  const authorName =
    dream.profiles?.display_name ||
    dream.profiles?.username ||
    "Dreamer";

  return (
    <div className={`flex-shrink-0 ${w} snap-start flex flex-col stable-card`}>
      <button
        type="button"
        onClick={handleClick}
        className="relative text-left w-full"
      >
        <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted/30">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={dream.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <Moon className="h-8 w-8 text-foreground/40" />
            </div>
          )}
        </div>
      </button>

      {/* Title — bigger and bolder */}
      <p className="mt-1.5 text-xs font-bold text-foreground line-clamp-1">
        {dream.title || "Untitled dream"}
      </p>

      {/* Author avatar + name */}
      <div className="flex items-center gap-1.5 mt-0.5">
        {dream.profiles?.avatar_url ? (
          <img
            src={dream.profiles.avatar_url}
            alt=""
            className="h-4 w-4 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="h-4 w-4 rounded-full bg-primary/30 flex-shrink-0" />
        )}
        <span className="text-[10px] text-muted-foreground truncate">
          {authorName}
        </span>
      </div>
    </div>
  );
};

export default PosterCard;
