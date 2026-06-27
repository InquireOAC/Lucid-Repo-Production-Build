import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Play, Moon, Pencil, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  dream: DreamEntry;
  width?: "sm" | "md" | "lg";
  showPlayOverlay?: boolean;
  /** When set, replaces the author line with this metadata (e.g. "13 Scenes"). */
  meta?: string;
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
  meta,
  isSelectMode = false,
  isSelected = false,
  onSelect,
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const imageUrl = pickPoster(dream);
  const hasVideo = !!dream.video_url;
  const w =
    width === "sm"
      ? "w-[110px] lg:w-[130px]"
      : width === "lg"
      ? "w-[150px] md:w-[180px] lg:w-[220px] xl:w-[260px]"
      : "w-[130px] md:w-[150px] lg:w-[180px] xl:w-[200px]";

  const handleCardClick = () => {
    if (isSelectMode) {
      onSelect?.(dream.id);
    } else {
      navigate(`/dream/${dream.id}`);
    }
  };

  return (
    <div className={cn("flex-shrink-0 snap-start flex flex-col stable-card", w)}>
      <button
        type="button"
        onClick={handleCardClick}
        className="relative text-left w-full"
      >
        <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted/30 md:transition-all md:duration-200 md:hover:-translate-y-1 md:hover:shadow-2xl md:hover:ring-2 md:hover:ring-primary/40 md:cursor-pointer">
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

          {/* Edit icon — bottom-right inside card, only outside select mode */}
          {!isSelectMode && (
            <button
              type="button"
              aria-label="Edit dream"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/journal/edit/${dream.id}`);
              }}
              className="absolute bottom-1.5 right-1.5 h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-white/90 text-black flex items-center justify-center hover:bg-white transition-colors shadow-md"
            >
              <Pencil className="h-4 w-4 lg:h-4 lg:w-4 fill-current" />
            </button>
          )}
        </div>
      </button>

      {/* Title — below card, bigger and bolder */}
      <p className="mt-1.5 lg:mt-2 text-xs lg:text-sm font-bold text-foreground line-clamp-1">
        {dream.title || "Untitled dream"}
      </p>

      {/* Metadata (e.g. "13 Scenes") or author avatar + name */}
      {meta ? (
        <p className="mt-0.5 lg:mt-1 text-[10px] lg:text-xs text-muted-foreground truncate">
          {meta}
        </p>
      ) : (
        <div className="flex items-center gap-1.5 mt-0.5 lg:mt-1">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-4 w-4 lg:h-5 lg:w-5 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-4 w-4 lg:h-5 lg:w-5 rounded-full bg-primary/30 flex-shrink-0" />
          )}
          <span className="text-[10px] lg:text-xs text-muted-foreground truncate">
            {profile?.display_name || profile?.username || "You"}
          </span>
        </div>
      )}
    </div>
  );
};

export default JournalPosterCard;
