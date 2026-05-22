import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Heart, Eye, MessageCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import SymbolAvatar from "@/components/profile/SymbolAvatar";

interface StoryListCardProps {
  dream: DreamEntry;
  onLike?: (dreamId: string) => void;
  onUserClick?: (username: string | undefined) => void;
  queueIds?: string[];
  variant?: "list" | "wide";
}

const StoryListCard: React.FC<StoryListCardProps> = ({ dream, onLike, onUserClick, queueIds, variant = "list" }) => {
  const navigate = useNavigate();
  const imageUrl = dream.generatedImage || dream.image_url;
  const profile = dream.profiles || {} as any;
  const username = profile.username;
  const displayName = profile.display_name || username || "Anonymous";
  const isLiked = (dream as any).liked;
  const sceneCount = Array.isArray((dream as any).section_images)
    ? (dream as any).section_images.filter((s: any) => s.image_url).length
    : 0;

  const handleClick = () => {
    const currentPath = window.location.pathname + window.location.search;
    const fromParam = `from=${encodeURIComponent(currentPath)}`;
    const queueParam = queueIds ? `&queue=${queueIds.join(",")}` : "";
    navigate(`/dream/${dream.id}?${fromParam}${queueParam}`);
  };

  if (variant === "wide") {
    return (
      <div
        className="flex-shrink-0 w-[260px] sm:w-[300px] md:w-full md:min-w-0 cursor-pointer stable-card group"
        onClick={handleClick}
      >
        <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 mb-2">
          {imageUrl ? (
            <img src={imageUrl} alt={dream.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
              <span className="text-3xl">🌙</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
          </div>
          {sceneCount > 0 && (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/70 text-white">
              {sceneCount} scenes
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-white line-clamp-1 leading-snug">
          {dream.title}
        </h3>
        <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">{displayName}</p>
      </div>
    );
  }

  return (
    <div
      className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      {/* Cover thumbnail */}
      <div className="flex-shrink-0 w-24 aspect-[2/3] rounded-lg overflow-hidden bg-white/5">
        {imageUrl ? (
          <img src={imageUrl} alt={dream.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
            <span className="text-2xl">🌙</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="text-base font-semibold text-white line-clamp-2 leading-snug mb-1">
            {dream.title}
          </h3>
          {/* Author */}
          <button
            onClick={(e) => { e.stopPropagation(); onUserClick?.(username); }}
            className="flex items-center gap-1.5 mb-1.5 hover:opacity-80 transition-opacity"
          >
            <SymbolAvatar
              symbol={profile.avatar_symbol}
              color={profile.avatar_color}
              avatarUrl={profile.avatar_url}
              fallbackLetter={displayName[0]?.toUpperCase() || "?"}
              size={18}
            />
            <span className="text-[11px] text-white/60 truncate">{displayName}</span>
          </button>
          {/* Excerpt */}
          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
            {dream.content}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2">
          <span className={cn("flex items-center gap-1 text-[11px]", isLiked ? "text-red-400" : "text-white/50")}>
            <Heart className={cn("h-3 w-3", isLiked && "fill-current")} />
            {dream.like_count || 0}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-white/50">
            <Eye className="h-3 w-3" />
            {dream.view_count || 0}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-white/50">
            <MessageCircle className="h-3 w-3" />
            {dream.comment_count || 0}
          </span>
          {sceneCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-white/50">
              <BookOpen className="h-3 w-3" />
              {sceneCount} scenes
            </span>
          )}
          {dream.lucid && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white text-black">
              LUCID
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryListCard;
