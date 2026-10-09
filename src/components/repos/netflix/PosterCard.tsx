import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";

interface Props {
  dream: DreamEntry;
  width?: "sm" | "md";
  fluid?: boolean;
}

const pickPoster = (dream: DreamEntry): string | undefined => {
  if (dream.generatedImage) return dream.generatedImage;
  if (dream.image_url) return dream.image_url;
  const sec = dream.section_images?.find((s) => s.image_url);
  return sec?.image_url;
};

const PosterCard: React.FC<Props> = ({ dream, width = "md", fluid = false }) => {
  const navigate = useNavigate();
  const imageUrl = pickPoster(dream);
  const w = fluid ? "w-full" :
    width === "sm"
      ? "w-[150px] lg:w-[180px]"
      : "w-[200px] md:w-[230px] lg:w-[260px] xl:w-[290px]";

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
        <div className="lucid-poster relative aspect-[3/4] md:transition-all md:duration-200 md:hover:-translate-y-1 md:hover:shadow-2xl md:hover:ring-2 md:hover:ring-primary/40 md:cursor-pointer">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={dream.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <img src="/dream-art/starry-lake.png" alt="" className="w-full h-full object-cover" />
          )}
        </div>
      </button>

      {/* Title — bigger and bolder */}
      <p className="lucid-display mt-2 text-base lg:text-xl text-foreground line-clamp-2">
        {dream.title || "Untitled dream"}
      </p>

      {/* Author avatar + name */}
      <div className="flex items-center gap-1.5 mt-0.5 lg:mt-1">
        {dream.profiles?.avatar_url ? (
          <img
            src={dream.profiles.avatar_url}
            alt=""
            className="h-4 w-4 lg:h-5 lg:w-5 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="h-4 w-4 lg:h-5 lg:w-5 rounded-full bg-primary/30 flex-shrink-0" />
        )}
        <span className="text-[10px] lg:text-xs text-muted-foreground truncate">
          {authorName}
        </span>
      </div>
    </div>
  );
};

export default PosterCard;
