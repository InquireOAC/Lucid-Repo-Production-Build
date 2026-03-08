import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DreamSeries } from "@/hooks/useDreamSeries";

interface CreateSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    cover_image_url?: string;
    tags?: string[];
    is_public?: boolean;
  }) => Promise<any>;
  editSeries?: DreamSeries | null;
  onUpdate?: (id: string, data: Partial<DreamSeries>) => Promise<boolean>;
}

const TAG_OPTIONS = ["Nightmare", "Lucid", "Recurring", "Adventure", "Spiritual", "Flying", "Falling", "Water", "Love"];

const CreateSeriesDialog: React.FC<CreateSeriesDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  editSeries,
  onUpdate,
}) => {
  const [title, setTitle] = useState(editSeries?.title || "");
  const [description, setDescription] = useState(editSeries?.description || "");
  const [coverUrl, setCoverUrl] = useState(editSeries?.cover_image_url || "");
  const [isPublic, setIsPublic] = useState(editSeries?.is_public || false);
  const [selectedTags, setSelectedTags] = useState<string[]>(editSeries?.tags || []);
  const [status, setStatus] = useState(editSeries?.status || "ongoing");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (editSeries) {
      setTitle(editSeries.title);
      setDescription(editSeries.description || "");
      setCoverUrl(editSeries.cover_image_url || "");
      setIsPublic(editSeries.is_public);
      setSelectedTags(editSeries.tags || []);
      setStatus(editSeries.status);
    } else {
      setTitle("");
      setDescription("");
      setCoverUrl("");
      setIsPublic(false);
      setSelectedTags([]);
      setStatus("ongoing");
    }
  }, [editSeries, open]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      if (editSeries && onUpdate) {
        await onUpdate(editSeries.id, {
          title,
          description: description || null,
          cover_image_url: coverUrl || null,
          tags: selectedTags,
          is_public: isPublic,
          status,
        });
      } else {
        await onSubmit({
          title,
          description: description || undefined,
          cover_image_url: coverUrl || undefined,
          tags: selectedTags,
          is_public: isPublic,
        });
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editSeries ? "Edit Series" : "Create Dream Series"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="series-title">Title</Label>
            <Input
              id="series-title"
              placeholder="My Dream Series..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="series-desc">Description</Label>
            <Textarea
              id="series-desc"
              placeholder="What is this series about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="series-cover">Cover Image URL</Label>
            <Input
              id="series-cover"
              placeholder="https://..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="mt-1"
            />
            {coverUrl && (
              <img src={coverUrl} alt="Cover preview" className="mt-2 rounded-lg max-h-32 object-cover w-full" />
            )}
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {TAG_OPTIONS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {editSeries && (
            <div>
              <Label>Status</Label>
              <div className="flex gap-2 mt-1">
                {["ongoing", "completed", "hiatus"].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      status === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="series-public">Make Public</Label>
            <Switch id="series-public" checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <Button onClick={handleSubmit} disabled={!title.trim() || isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : editSeries ? "Save Changes" : "Create Series"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSeriesDialog;
