import React from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MasonryDreamGridProps {
  dreams: DreamEntry[];
  tags: DreamTag[];
  onLike: (dreamId: string) => void;
  onOpenDream: (dream: DreamEntry) => void;
  onUserClick: (username: string | undefined) => void;
  onTagClick: (tagId: string) => void;
  currentUser?: any;
}

const MasonryDreamGrid = ({
  dreams,
  tags,
  onLike,
  onOpenDream,
  onUserClick,
  currentUser,
}: MasonryDreamGridProps) => {
  return (
    <div className="masonry-grid pb-4">
      {dreams.map((dream, index) => (
        <MasonryDreamCard
          key={dream.id}
          dream={dream}
          tags={tags}
          onLike={onLike}
          onOpenDream={onOpenDream}
          onUserClick={onUserClick}
          index={index}
        />
      ))}
    </div>
  );
};

interface MasonryDreamCardProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onLike: (dreamId: string) => void;
  onOpenDream: (dream: DreamEntry) => void;
  onUserClick: (username: string | undefined) => void;
  index: number;
}

const MasonryDreamCard = ({
  dream,
  tags,
  onLike,
  onOpenDream,
  onUserClick,
  index,
}: MasonryDreamCardProps) => {
  const userProfile = dream.profiles || {};
  const username = (userProfile as any)?.username;
  const displayName = (userProfile as any)?.display_name || username || "Anonymous";
  const imageUrl = dream.generatedImage || dream.image_url;
  const isLiked = (dream as any).isLiked || (dream as any).liked;
  
  // Vary card heights for masonry effect
  const hasLongContent = dream.content?.length > 150;
  const showFullContent = index % 3 === 0 && hasLongContent;

  return (
    <div 
      className="masonry-item luminous-card rounded-xl overflow-hidden cursor-pointer group bg-card"
      onClick={() => onOpenDream(dream)}
    >
      {/* Image */}
      {imageUrl && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={dream.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cosmic-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Lucid badge */}
          {dream.lucid && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-aurora-violet/90 text-white">
                ✦ Lucid
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {dream.title}
        </h3>
        
        <p className={cn(
          "text-sm text-muted-foreground mb-3",
          showFullContent ? "line-clamp-4" : "line-clamp-2"
        )}>
          {dream.content}
        </p>
        
        {/* Tags */}
        {dream.tags && dream.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dream.tags.slice(0, 2).map((tagId, i) => {
              const tag = tags.find(t => t.id === tagId || t.name === tagId);
              return tag ? (
                <span 
                  key={i} 
                  className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary/80"
                >
                  {tag.name}
                </span>
              ) : null;
            })}
            {dream.tags.length > 2 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{dream.tags.length - 2}
              </span>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-primary/10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUserClick(username);
            }}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-aurora-purple to-aurora-violet flex items-center justify-center text-white text-xs font-medium">
              {displayName[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
              @{username || "anon"}
            </span>
          </button>
          
          <div className="flex items-center gap-3 text-muted-foreground">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(dream.id);
              }}
              className={cn(
                "flex items-center gap-1 transition-colors text-xs",
                isLiked ? "text-aurora-gold" : "hover:text-aurora-gold"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current")} />
              {dream.like_count || 0}
            </button>
            
            <div className="flex items-center gap-1 text-xs">
              <MessageCircle className="h-3.5 w-3.5" />
              {dream.comment_count || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasonryDreamGrid;
