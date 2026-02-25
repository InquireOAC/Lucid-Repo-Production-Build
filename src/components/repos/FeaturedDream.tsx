import React from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import SymbolAvatar from "@/components/profile/SymbolAvatar";

interface FeaturedDreamProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onLike: (dreamId: string) => void;
  onOpenDream: (dream: DreamEntry) => void;
  onUserClick: (username: string | undefined) => void;
  currentUser?: any;
}

const FeaturedDream = ({
  dream,
  tags,
  onLike,
  onOpenDream,
  onUserClick,
  currentUser,
}: FeaturedDreamProps) => {
  const userProfile = dream.profiles || {};
  const username = (userProfile as any)?.username;
  const displayName = (userProfile as any)?.display_name || username || "Anonymous";
  const imageUrl = dream.generatedImage || dream.image_url;
  const isLiked = (dream as any).isLiked || (dream as any).liked;

  return (
    <div 
      className="vault-glass corner-brackets rounded-2xl overflow-hidden cursor-pointer group mb-6 border border-primary/15"
      onClick={() => onOpenDream(dream)}
    >
      {/* Hero Image */}
      {imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={dream.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cosmic-black via-transparent to-transparent" />
          
          {/* Featured badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-aurora-gold/90 text-cosmic-black">
              ✦ Featured
            </span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
          {dream.title}
        </h2>
        
        <p className="text-muted-foreground line-clamp-2 mb-4">
          {dream.content}
        </p>
        
        {/* User & Stats */}
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUserClick(username);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <SymbolAvatar
              symbol={(userProfile as any)?.avatar_symbol}
              color={(userProfile as any)?.avatar_color}
              avatarUrl={(userProfile as any)?.avatar_url}
              fallbackLetter={displayName[0]?.toUpperCase() || "?"}
              size={32}
            />
            <span className="text-sm text-muted-foreground">@{username || "anonymous"}</span>
          </button>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(dream.id);
              }}
              className={cn(
                "flex items-center gap-1 transition-colors",
                isLiked ? "text-aurora-gold" : "hover:text-aurora-gold"
              )}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              <span className="text-sm">{dream.like_count || 0}</span>
            </button>
            
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{dream.comment_count || 0}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{dream.view_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedDream;
