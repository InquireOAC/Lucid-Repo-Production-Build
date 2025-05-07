
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { DreamEntry, DreamTag } from "@/types/dream";
import { Edit, Heart, Globe, Lock, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface DreamDetailProps {
  dream: DreamEntry;
  tags: DreamTag[];
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<DreamEntry>) => void;
  onDelete?: (id: string) => void;
  isAuthenticated?: boolean;
}

const DreamDetail = ({ dream, tags, onClose, onUpdate, onDelete, isAuthenticated }: DreamDetailProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // For audio URL, check both snake_case and camelCase properties
  const audioUrl = dream.audioUrl || dream.audio_url;
  
  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
    };
  }, []);

  const handleTogglePublic = async () => {
    if (onUpdate) {
      const newStatus = !(dream.is_public || dream.isPublic);
      await onUpdate(dream.id, { 
        is_public: newStatus,
        isPublic: newStatus
      });
    }
  };

  const handleDeleteDream = async () => {
    if (onDelete) {
      onDelete(dream.id);
    }
  };

  const toggleAudio = () => {
    if (!audioUrl) return;
    
    if (!audioElement) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
      
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        toast.error("Could not play audio recording");
      });
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.currentTime = 0;
        audioElement.play().catch(err => {
          console.error('Error playing audio:', err);
          toast.error("Could not play audio recording");
        });
        setIsPlaying(true);
      }
    }
  };
  
  // Check either isPublic or is_public field
  const isPublic = dream.is_public || dream.isPublic;

  // Map tag IDs to tag objects
  const dreamTags = dream.tags
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter(Boolean) as DreamTag[];

  const formattedDate = format(new Date(dream.date), "MMMM d, yyyy");

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl gradient-text">{dream.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            {/* Date */}
            <div className="text-sm text-muted-foreground">{formattedDate}</div>
            
            {/* Content */}
            <div className="text-sm whitespace-pre-wrap">{dream.content}</div>
            
            {/* Audio recording */}
            {audioUrl && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 ${
                    isPlaying ? "bg-green-500/10 text-green-600 border-green-400" : "bg-blue-500/10 text-blue-600 border-blue-400"
                  }`}
                  onClick={toggleAudio}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={16} /> Pause Audio Recording
                    </>
                  ) : (
                    <>
                      <Play size={16} /> Play Audio Recording
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {/* Tags */}
            {dreamTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {dreamTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{ backgroundColor: tag.color + "40", color: tag.color }}
                    className="text-xs font-normal border"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Dream Image */}
            {dream.generatedImage && (
              <div className="mt-4">
                <img 
                  src={dream.generatedImage} 
                  alt="Dream visualization" 
                  className="rounded-md w-full h-auto"
                />
              </div>
            )}

            {/* Dream Analysis */}
            {dream.analysis && (
              <div className="mt-4 p-3 bg-muted/40 rounded-md">
                <h3 className="text-sm font-medium mb-1">Dream Analysis</h3>
                <div className="text-sm text-muted-foreground">{dream.analysis}</div>
              </div>
            )}

            {/* Footer actions - Only show actions if user is authenticated */}
            {isAuthenticated && (
              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-2">
                  {onDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  {onUpdate && (
                    <Button
                      variant={isPublic ? "outline" : "default"}
                      size="sm"
                      onClick={handleTogglePublic}
                    >
                      {isPublic ? (
                        <>
                          <Lock size={14} className="mr-1" /> Make Private
                        </>
                      ) : (
                        <>
                          <Globe size={14} className="mr-1" /> Share
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The dream will be permanently deleted from your journal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDream}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DreamDetail;
