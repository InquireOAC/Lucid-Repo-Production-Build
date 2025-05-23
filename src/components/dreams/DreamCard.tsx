import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Globe, Pencil, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamCardUser from "./DreamCardUser";
import DreamCardTags from "./DreamCardTags";
import DreamCardSocial from "./DreamCardSocial";
import { Button } from "@/components/ui/button";

interface DreamCardProps {
  dream: DreamEntry;
  tags?: DreamTag[];
  dreamTags?: string[];
  onLike?: () => void;
  showUser?: boolean;
  onClick?: () => void;
  onUserClick?: () => void;
  onTagClick?: (tagId: string) => void;
  // Removed audio props
  // New props for actions
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePublic?: () => void;
  // Prop to control badge visibility
  showSharedBadge?: boolean;
}

const DreamCard = ({ 
  dream, 
  tags = [], 
  dreamTags = [],
  onLike, 
  showUser = false, 
  onClick, 
  onUserClick,
  onTagClick,
  // Removed audio props
  // New action props with defaults
  showActions = false,
  onEdit,
  onDelete,
  onTogglePublic,
  // Default to false so it's only shown when explicitly requested
  showSharedBadge = false
}: DreamCardProps) => {
  // Format the dream date
  const formattedDate = dream.date ? format(new Date(dream.date), "MMM d, yyyy") : "No date";
  
  // Check either isPublic or is_public field
  const isPublic = dream.is_public || dream.isPublic;
  
  // Use either likeCount or like_count, ensuring we have a consistent value
  const likeCount = typeof dream.likeCount !== 'undefined' ? dream.likeCount : (dream.like_count || 0);
  
  // Similarly handle comment count
  const commentCount = typeof dream.commentCount !== 'undefined' ? dream.commentCount : (dream.comment_count || 0);

  const handleUserClick = (e: React.MouseEvent) => {
    if (onUserClick) {
      e.stopPropagation();
      onUserClick();
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    if (onEdit) {
      e.stopPropagation();
      onEdit();
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    if (onDelete) {
      e.stopPropagation();
      onDelete();
    }
  };
  
  const handleTogglePublic = (e: React.MouseEvent) => {
    if (onTogglePublic) {
      e.stopPropagation();
      onTogglePublic();
    }
  };

  return (
    <Card 
      className="dream-card h-full cursor-pointer transition-all relative"
      onClick={onClick}
    >
      {/* Only show Shared badge when specifically requested AND the dream is public */}
      {showSharedBadge && isPublic && (
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-y-[-1rem] z-10">
          <div className="bg-dream-purple text-white text-xs py-1 px-2 rounded-l-md flex items-center gap-1">
            <Globe size={12} /> Shared
          </div>
        </div>
      )}
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
        {showUser && (
          <DreamCardUser
            profile={dream.profiles}
            onUserClick={handleUserClick}
          />
        )}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {dream.content}
        </p>
        <DreamCardTags
          tags={tags}
          dreamTags={dreamTags}
          lucid={dream.lucid}
          onTagClick={onTagClick}
        />
        {dream.generatedImage && (
          <div className="mt-2 h-20 w-full overflow-hidden rounded-md">
            <img
              src={dream.generatedImage}
              alt="Dream visualization"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {/* Remove DreamCardSocial (which included likeCount and commentCount) */}
        {/* Action buttons (Edit/Delete/Public) remain unchanged */}
        {showActions && (
          <div className="flex justify-end gap-1 mt-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8"
              onClick={handleEdit}
            >
              <Pencil size={14} className="mr-1" /> Edit
            </Button>
            <Button
              size="sm"
              variant={isPublic ? "outline" : "default"}
              className={`h-8 ${isPublic ? "bg-white text-gray-800" : "bg-dream-purple"}`}
              onClick={handleTogglePublic}
            >
              {isPublic ? (
                <>
                  <Lock size={14} className="mr-1" /> Private
                </>
              ) : (
                <>
                  <Globe size={14} className="mr-1" /> Share
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8"
              onClick={handleDelete}
            >
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DreamCard;
