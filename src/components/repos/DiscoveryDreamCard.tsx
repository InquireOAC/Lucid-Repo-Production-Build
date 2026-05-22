import React from "react";
import { useNavigate } from "react-router-dom";
import { DreamEntry } from "@/types/dream";
import { Heart, Eye, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import SymbolAvatar from "@/components/profile/SymbolAvatar";

interface DiscoveryDreamCardProps {
  dream: DreamEntry;
  onOpenDream?: (dream: DreamEntry) => void;
  onLike: (dreamId: string) => void;
  onUserClick: (username: string | undefined) => void;
}

const DiscoveryDreamCard: React.FC<DiscoveryDreamCardProps> = ({
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
      className="flex-shrink-0 w-[140px] md:w-full md:min-w-0 cursor-pointer stable-card"
      onClick={() => {
        const currentPath = window.location.pathname + window.location.search;
        navigate(`/lucid-repo/${dream.id}?from=${encodeURIComponent(currentPath)}`);
      }}
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted/30 mb-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={dream.title}
            className="w-full h-full object-cover relative z-0"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 relative z-0">
            <span className="text-3xl">🌙</span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
        
        {/* Bottom info on cover */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-20">
          <h3 className="text-xs font-semibold text-white line-clamp-2 leading-tight mb-1">
            {dream.title}
          </h3>
          <div className="flex items-center gap-2 text-white/70">
            <span className="flex items-center gap-0.5 text-[10px]">
              <Heart className={cn("h-2.5 w-2.5", isLiked && "fill-current text-red-400")} />
              {dream.like_count || 0}
            </span>
            <span className="flex items-center gap-0.5 text-[10px]">
              <Eye className="h-2.5 w-2.5" />
              {dream.view_count || 0}
            </span>
          </div>
        </div>

        {dream.lucid && (
          <div className="absolute top-1.5 left-1.5 z-20">
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/90 text-primary-foreground">
              LUCID
            </span>
          </div>
        )}

        {dream.audio_url && (
          <div className="absolute top-1.5 right-1.5 z-20">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-black/60 text-white">
              <Headphones className="h-2.5 w-2.5" />
            </span>
          </div>
        )}
      </div>

      {/* Author */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUserClick(username);
        }}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity w-full"
      >
        <SymbolAvatar
          symbol={profile.avatar_symbol}
          color={profile.avatar_color}
          avatarUrl={profile.avatar_url}
          fallbackLetter={displayName[0]?.toUpperCase() || "?"}
          size={20}
        />
        <span className="text-[11px] text-muted-foreground truncate">
          {displayName}
        </span>
      </button>
    </div>
  );
};

export default DiscoveryDreamCard;
