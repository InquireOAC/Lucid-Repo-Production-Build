import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Check, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AddChapterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
  existingDreamIds: string[];
  onAddChapter: (dreamId: string) => Promise<boolean>;
}

const AddChapterDialog: React.FC<AddChapterDialogProps> = ({
  open,
  onOpenChange,
  seriesId,
  existingDreamIds,
  onAddChapter,
}) => {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !user) return;
    const fetchDreams = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("dream_entries")
        .select("id, title, content, generatedImage, image_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setDreams(data || []);
      setIsLoading(false);
    };
    fetchDreams();
  }, [open, user]);

  const handleAdd = async (dreamId: string) => {
    setAddingId(dreamId);
    await onAddChapter(dreamId);
    setAddingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Chapter</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-3">Select a dream to add as the next chapter.</p>

        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))
          ) : dreams.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No dreams found. Create a dream first!</p>
          ) : (
            dreams.map(dream => {
              const alreadyAdded = existingDreamIds.includes(dream.id);
              const imageUrl = dream.generatedImage || dream.image_url;
              return (
                <div
                  key={dream.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    alreadyAdded
                      ? "border-primary/30 bg-primary/5 opacity-60"
                      : "border-border/30 hover:border-primary/40 hover:bg-muted/20 cursor-pointer"
                  }`}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🌙</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{dream.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{dream.content?.slice(0, 60)}</p>
                  </div>
                  {alreadyAdded ? (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAdd(dream.id)}
                      disabled={addingId === dream.id}
                      className="flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddChapterDialog;
