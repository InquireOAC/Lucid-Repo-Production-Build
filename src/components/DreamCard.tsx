
import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Heart } from "lucide-react";
import { DreamEntry, DreamTag } from "@/types/dream";

interface DreamCardProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onClick: () => void;
}

const DreamCard = ({ dream, tags, onClick }: DreamCardProps) => {
  const formattedDate = format(new Date(dream.date), "MMM d, yyyy");
  const dreamTags = dream.tags
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter(Boolean) as DreamTag[];

  // Check either isPublic or is_public field
  const isPublic = dream.is_public || dream.isPublic;
  
  // Use either likeCount or like_count, ensuring we have a consistent value
  const likeCount = typeof dream.likeCount !== 'undefined' ? dream.likeCount : (dream.like_count || 0);
  
  // Similarly handle comment count
  const commentCount = typeof dream.commentCount !== 'undefined' ? dream.commentCount : (dream.comment_count || 0);

  return (
    <Card 
      className="dream-card cursor-pointer hover:scale-[1.02] transition-all"
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg gradient-text font-bold line-clamp-1">
            {dream.title}
          </CardTitle>
          <div className="flex items-center text-xs text-muted-foreground">
            <Moon size={12} className="mr-1" />
            {formattedDate}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {dream.content}
        </p>
        <div className="flex flex-wrap gap-1">
          {dreamTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color + "40", color: tag.color }}
              className="text-xs font-normal border"
            >
              {tag.name}
            </Badge>
          ))}
          {dream.lucid && (
            <Badge
              variant="secondary"
              className="text-xs font-normal bg-dream-lavender/20 text-dream-lavender"
            >
              Lucid
            </Badge>
          )}
        </div>
        {dream.generatedImage && (
          <div className="mt-2 h-20 w-full overflow-hidden rounded-md">
            <img
              src={dream.generatedImage}
              alt="Dream visualization"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        
        {/* Show like count if dream is public */}
        {isPublic && (
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <Heart size={12} className="mr-1" />
            <span>{likeCount} likes</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DreamCard;
