
import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamAnalysis from "./DreamAnalysis";
import DreamComments from "./DreamComments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Globe, Trash2, Lock, MessageCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DreamDetailProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<DreamEntry>) => void;
  onDelete: (id: string) => void;
  isAuthenticated: boolean;
}

const DreamDetail = ({
  dream,
  tags,
  onClose,
  onUpdate,
  onDelete,
  isAuthenticated,
}: DreamDetailProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const formattedDate = format(new Date(dream.date), "EEEE, MMMM d, yyyy");
  const formattedTime = format(new Date(dream.date), "h:mm a");
  
  const dreamTags = dream.tags
    .map((tagId) => tags.find((t) => t.id === tagId))
    .filter(Boolean) as DreamTag[];
  
  // Use is_public for consistency with the database field
  const [isPublic, setIsPublic] = useState(dream.is_public || dream.isPublic || false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(dream.comment_count || dream.commentCount || 0);
  
  // Get user info from profiles if available
  const username = dream.profiles?.username || "Anonymous";
  const displayName = dream.profiles?.display_name || "Anonymous User";
  const avatarUrl = dream.profiles?.avatar_url || "";

  const handleAnalysisComplete = (analysis: string) => {
    onUpdate(dream.id, { analysis });
  };

  const handleShareToggle = (checked: boolean) => {
    if (!isAuthenticated) {
      return;
    }
    
    setIsPublic(checked);
    onUpdate(dream.id, { 
      is_public: checked,
      isPublic: checked // Update both fields for consistency
    });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    try {
      onDelete(dream.id);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleNavigateToProfile = () => {
    if (dream.user_id) {
      onClose();
      navigate(`/profile/${dream.user_id}`);
    }
  };
  
  const canModifyDream = user && dream.user_id === user.id;
  
  // Use either likeCount or like_count, ensuring we have a consistent value
  const likeCount = typeof dream.likeCount !== 'undefined' ? dream.likeCount : (dream.like_count || 0);
  const isLiked = dream.liked || false;

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-xl gradient-text">
              {dream.title}
            </DialogTitle>
            {dream.user_id && (
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:underline"
                onClick={handleNavigateToProfile}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{displayName}</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Moon size={14} className="mr-1" /> {formattedDate} at {formattedTime}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image First */}
          {dream.generatedImage && (
            <div className="rounded-md overflow-hidden">
              <img
                src={dream.generatedImage}
                alt="Dream visualization"
                className="w-full h-auto object-cover"
              />
              {dream.imagePrompt && (
                <p className="mt-1 text-xs text-muted-foreground italic px-2">
                  "{dream.imagePrompt}"
                </p>
              )}
            </div>
          )}
          
          {/* Dream Content Second */}
          <div>
            <div className="flex flex-wrap gap-1 mb-3">
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
              {dream.mood && (
                <Badge
                  variant="outline"
                  className="text-xs font-normal"
                >
                  Mood: {dream.mood}
                </Badge>
              )}
            </div>

            <p className="whitespace-pre-wrap">
              {dream.content}
            </p>
          </div>
          
          {/* Social actions */}
          {isPublic && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "flex items-center gap-1",
                    isLiked && "text-red-500 border-red-200 bg-red-50"
                  )}
                  onClick={() => onUpdate(dream.id, { liked: !isLiked })}
                  disabled={!isAuthenticated}
                >
                  <Heart size={16} />
                  <span>{likeCount}</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageCircle size={16} />
                  <span>{commentCount}</span>
                </Button>
              </div>
              
              {canModifyDream && (
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="share-dream"
                    checked={isPublic}
                    onCheckedChange={handleShareToggle}
                  />
                  <Label htmlFor="share-dream" className="flex gap-1 items-center">
                    {isPublic ? (
                      <>
                        <Globe size={16} className="text-dream-purple" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Private</span>
                      </>
                    )}
                  </Label>
                </div>
              )}
            </div>
          )}
          
          {showComments && (
            <>
              <Separator />
              <DreamComments 
                dreamId={dream.id} 
                onCommentCountChange={(count) => {
                  setCommentCount(count);
                  onUpdate(dream.id, { commentCount: count });
                }}
              />
            </>
          )}
          
          {/* Analysis Third - Only show if it's the user's own dream or if analysis already exists */}
          {(dream.analysis || canModifyDream) && (
            <>
              <Separator />
              <DreamAnalysis
                dreamContent={dream.content}
                existingAnalysis={dream.analysis}
                onAnalysisComplete={handleAnalysisComplete}
                disabled={!canModifyDream}
              />
            </>
          )}
          
          {/* Delete button for owners only */}
          {canModifyDream && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this dream from your journal.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default DreamDetail;
