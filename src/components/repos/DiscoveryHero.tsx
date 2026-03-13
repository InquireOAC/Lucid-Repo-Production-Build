import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import SymbolAvatar from "@/components/profile/SymbolAvatar";

interface DiscoveryHeroProps {
  dream: DreamEntry;
  onOpenDream?: (dream: DreamEntry) => void;
  onLike: (dreamId: string) => void;
  onUserClick: (username: string | undefined) => void;
}

const DiscoveryHero: React.FC<DiscoveryHeroProps> = ({
  dream,
  onLike,
  onUserClick,
}) => {
  const navigate = useNavigate();
  const imageUrl = dream.generatedImage || dream.image_url;
  const profile = dream.profiles || {} as any;
  const username = profile.username;
  const displayName = profile.display_name || username || "Anonymous";
  const isLiked = (dream as any).liked;

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-6 cursor-pointer stable-card"
      onClick={() => navigate(`/lucid-repo/${dream.id}`)}
    >
      <div className="aspect-[16/9] md:aspect-[21/9] relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={dream.title}
            className="w-full h-full object-cover relative z-0"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center relative z-0">
            <span className="text-6xl">🌙</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          <div className="flex items-center gap-1 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground uppercase tracking-wider">
              Featured
            </span>
            {dream.lucid && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                Lucid
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-white mb-1.5 line-clamp-2 leading-tight">
            {dream.title}
          </h2>
          <p className="text-sm text-white/70 line-clamp-2 mb-3">
            {dream.content}
          </p>

          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUserClick(username);
              }}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <SymbolAvatar
                symbol={profile.avatar_symbol}
                color={profile.avatar_color}
                avatarUrl={profile.avatar_url}
                fallbackLetter={displayName[0]?.toUpperCase() || "?"}
                size={28}
              />
              <span className="text-sm font-medium text-white">
                {displayName}
              </span>
            </button>

            <div className="flex items-center gap-3 text-white/70">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(dream.id);
                }}
                className={cn(
                  "flex items-center gap-1 text-xs transition-colors",
                  isLiked ? "text-red-400" : "hover:text-white"
                )}
              >
                <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
                {dream.like_count || 0}
              </button>
              <span className="flex items-center gap-1 text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                {dream.comment_count || 0}
              </span>
              <span className="flex items-center gap-1 text-xs">
                <Eye className="h-3.5 w-3.5" />
                {dream.view_count || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryHero;
