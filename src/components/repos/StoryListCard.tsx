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
}

const StoryListCard: React.FC<StoryListCardProps> = ({ dream, onLike, onUserClick, queueIds }) => {
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
    const params = queueIds ? `?queue=${queueIds.join(",")}` : "";
    navigate(`/dream/${dream.id}${params}`);
  };

  return (
    <div
      className="flex gap-3 p-3 rounded-xl bg-card/50 border border-border/20 hover:bg-card/80 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      {/* Cover thumbnail */}
      <div className="flex-shrink-0 w-20 aspect-[2/3] rounded-lg overflow-hidden bg-muted/30">
        {imageUrl ? (
          <img src={imageUrl} alt={dream.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-2xl">🌙</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-1">
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
            <span className="text-[11px] text-muted-foreground truncate">{displayName}</span>
          </button>
          {/* Excerpt */}
          <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
            {dream.content}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-2">
          <span className={cn("flex items-center gap-1 text-[11px]", isLiked ? "text-red-400" : "text-muted-foreground")}>
            <Heart className={cn("h-3 w-3", isLiked && "fill-current")} />
            {dream.like_count || 0}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Eye className="h-3 w-3" />
            {dream.view_count || 0}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            {dream.comment_count || 0}
          </span>
          {sceneCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              {sceneCount} scenes
            </span>
          )}
          {dream.lucid && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/20 text-primary">
              LUCID
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryListCard;
