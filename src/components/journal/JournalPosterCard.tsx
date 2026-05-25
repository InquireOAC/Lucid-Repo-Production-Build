import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Play, Moon, Headphones, Film, Pencil, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  dream: DreamEntry;
  width?: "sm" | "md" | "lg";
  showPlayOverlay?: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const pickPoster = (dream: DreamEntry): string | undefined => {
  if (dream.generatedImage) return dream.generatedImage;
  if (dream.image_url) return dream.image_url;
  const sec = dream.section_images?.find((s) => s.image_url);
  return sec?.image_url;
};

const JournalPosterCard: React.FC<Props> = ({
  dream,
  width = "md",
  showPlayOverlay,
  isSelectMode = false,
  isSelected = false,
  onSelect,
}) => {
  const navigate = useNavigate();
  const imageUrl = pickPoster(dream);
  const hasVideo = !!dream.video_url;
  const w =
    width === "sm" ? "w-[110px]" :
    width === "lg" ? "w-[150px] md:w-[180px]" :
    "w-[130px] md:w-[150px]";

  const handleCardClick = () => {
    if (isSelectMode) {
      onSelect?.(dream.id);
    } else {
      navigate(`/dream/${dream.id}`);
    }
  };

  return (
    <div className={cn("flex-shrink-0 snap-start flex flex-col gap-1 stable-card", w)}>
      <button
        type="button"
        onClick={handleCardClick}
        className="relative text-left w-full"
      >
        <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted/30">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={dream.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <Moon className="h-8 w-8 text-foreground/40" />
            </div>
          )}

          {/* Select mode checkbox overlay */}
          {isSelectMode && (
            <div className="absolute inset-0 bg-black/30 flex items-start justify-start p-1.5">
              {isSelected ? (
                <CheckCircle2 className="h-5 w-5 text-primary drop-shadow-md" />
              ) : (
                <Circle className="h-5 w-5 text-white/80 drop-shadow-md" />
              )}
            </div>
          )}

          {/* Selected highlight ring */}
          {isSelectMode && isSelected && (
            <div className="absolute inset-0 rounded-md ring-2 ring-primary pointer-events-none" />
          )}

          {!isSelectMode && dream.lucid && (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/90 text-primary-foreground uppercase">
              Lucid
            </span>
          )}
          {!isSelectMode && dream.audio_url && !hasVideo && (
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-5 w-5 rounded-full bg-black/60 text-white">
              <Headphones className="h-2.5 w-2.5" />
            </span>
          )}
          {!isSelectMode && hasVideo && (
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-5 w-5 rounded-full bg-black/60 text-white">
              <Film className="h-2.5 w-2.5" />
            </span>
          )}

          {!isSelectMode && (showPlayOverlay || hasVideo) && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-10 w-10 rounded-full bg-white/85 text-black flex items-center justify-center shadow-lg">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
              </div>
            </>
          )}
        </div>
      </button>

      {/* Edit icon — only visible outside select mode */}
      {!isSelectMode && (
        <button
          type="button"
          aria-label="Edit dream"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/journal/edit/${dream.id}`);
          }}
          className="self-start ml-0.5 p-1 rounded hover:bg-muted/50 transition-colors"
        >
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
      )}

      <p className="mt-0.5 text-[11px] text-foreground/90 line-clamp-1 font-medium">
        {dream.title || "Untitled dream"}
      </p>
    </div>
  );
};

export default JournalPosterCard;
