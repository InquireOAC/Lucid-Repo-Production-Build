import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Play, Moon, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  dream: DreamEntry;
  size?: "full" | "compact";
  label?: string;
}

const pickPoster = (dream: DreamEntry): string | undefined => {
  if (dream.generatedImage) return dream.generatedImage;
  if (dream.image_url) return dream.image_url;
  const sec = dream.section_images?.find((s) => s.image_url);
  return sec?.image_url;
};

const JournalHeroPoster: React.FC<Props> = ({ dream, size = "full" }) => {
  const navigate = useNavigate();
  const imageUrl = pickPoster(dream);
  const hasVideo = !!dream.video_url;

  const ago = (() => {
    const d = dream.created_at || dream.date;
    if (!d) return "";
    try {
      return formatDistanceToNow(new Date(d), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  const open = () => navigate(`/dream/${dream.id}`);

  const aspect =
    size === "compact"
      ? "aspect-[16/9] md:aspect-[21/9]"
      : "aspect-[3/4] md:aspect-[21/9]";

  return (
    <div className="relative -mx-4 sm:-mx-6 md:mx-0 mb-6 md:rounded-2xl overflow-hidden stable-card">
      <div className={cn("relative cursor-pointer", aspect)} onClick={open}>
        {hasVideo ? (
          <video
            key={dream.video_url}
            src={dream.video_url}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster={imageUrl}
          />
        ) : imageUrl ? (
          <img src={imageUrl} alt={dream.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
            <Moon className="h-20 w-20 text-white/60" />
          </div>
        )}
        {/* Top fade for status bar */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent pointer-events-none" />
        {/* Bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />
      </div>

      {/* Hero content */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-10 z-10">
        <h1
          className={cn(
            "font-bold text-white leading-tight line-clamp-2 mb-1 drop-shadow-md",
            size === "compact" ? "text-xl md:text-3xl" : "text-2xl md:text-4xl",
          )}
        >
          {dream.title || "Untitled dream"}
        </h1>

        {ago && (
          <p className="text-xs text-white/60 mb-4">{ago}</p>
        )}

        <div className="flex items-center gap-2">
          {hasVideo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/journal/edit/${dream.id}?play=1`);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              <Play className="h-4 w-4 fill-current" />
              Watch Cinematic
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className={cn(
              "ml-auto flex items-center gap-1 px-4 py-2 rounded-full font-semibold text-xs transition-colors",
              hasVideo
                ? "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
                : "bg-white text-black hover:bg-white/90",
            )}
          >
            Open
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalHeroPoster;
