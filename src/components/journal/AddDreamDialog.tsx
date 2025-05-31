
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { DreamTag } from "@/types/dream";
import { containsInappropriateContent, getContentWarningMessage } from "@/utils/contentFilter";
import { toast } from "sonner";

interface AddDreamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
    isPublic: boolean;
  }) => Promise<void>;
  tags: DreamTag[];
  isSubmitting: boolean;
}

const MOODS = ["Amazing", "Good", "Neutral", "Confusing", "Disturbing"];

const AddDreamDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  tags,
  isSubmitting
}: AddDreamDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [lucid, setLucid] = useState(false);
  const [mood, setMood] = useState("Neutral");
  const [isPublic, setIsPublic] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setLucid(false);
    setMood("Neutral");
    setIsPublic(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    // Check for inappropriate content
    const textToCheck = `${title} ${content}`;
    if (containsInappropriateContent(textToCheck)) {
      toast.error(getContentWarningMessage());
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        lucid,
        mood,
        isPublic
      });
      resetForm();
    } catch (error) {
      console.error("Error submitting dream:", error);
    }
  };

  const handleAddTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagId));
  };

  const getTagById = (tagId: string) => tags.find(t => t.id === tagId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Dream</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dream-title">Title *</Label>
            <Input
              id="dream-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your dream a title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="dream-content">Dream Content *</Label>
            <Textarea
              id="dream-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your dream in detail..."
              className="min-h-32"
              required
            />
          </div>

          <div>
            <Label>Tags</Label>
            <Select onValueChange={handleAddTag}>
              <SelectTrigger>
                <SelectValue placeholder="Add tags to categorize your dream" />
              </SelectTrigger>
              <SelectContent>
                {tags.map((tag) => (
                  <SelectItem 
                    key={tag.id} 
                    value={tag.id}
                    disabled={selectedTags.includes(tag.id)}
                  >
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tagId) => {
                  const tag = getTagById(tagId);
                  return tag ? (
                    <Badge 
                      key={tagId} 
                      variant="secondary" 
                      className="flex items-center gap-1"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.name}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveTag(tagId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div>
            <Label>Mood</Label>
            <Select value={mood} onValueChange={setMood}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOODS.map((moodOption) => (
                  <SelectItem key={moodOption} value={moodOption}>
                    {moodOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="lucid" 
              checked={lucid}
              onCheckedChange={(checked) => setLucid(checked as boolean)}
            />
            <Label htmlFor="lucid">This was a lucid dream</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="public" 
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked as boolean)}
            />
            <Label htmlFor="public">Make this dream public</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Dream"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDreamDialog;
