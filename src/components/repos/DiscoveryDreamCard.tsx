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
      className="flex-shrink-0 w-[140px] cursor-pointer group"
      onClick={() => navigate(`/lucid-repo/${dream.id}`)}
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted/30 mb-2">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={dream.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <span className="text-3xl">🌙</span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Bottom info on cover */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
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
          <div className="absolute top-1.5 left-1.5">
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/90 text-primary-foreground">
              LUCID
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
