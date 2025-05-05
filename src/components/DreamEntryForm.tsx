
import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DreamTag } from "@/types/dream";
import { toast } from "sonner";

interface DreamEntryFormProps {
  onSubmit: (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
  }) => void;
  tags: DreamTag[];
  isSubmitting: boolean;
}

const moods = [
  "Calm",
  "Happy",
  "Anxious",
  "Scared",
  "Confused",
  "Excited",
  "Sad",
  "Neutral",
];

const DreamEntryForm = ({ onSubmit, tags, isSubmitting }: DreamEntryFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [lucid, setLucid] = useState(false);
  const [mood, setMood] = useState("Neutral");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a dream title");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter your dream description");
      return;
    }

    onSubmit({
      title,
      content,
      tags: selectedTags,
      lucid,
      mood,
    });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {format(new Date(), "EEEE, MMMM d, yyyy")}
      </div>
      
      <Input
        placeholder="What was your dream about?"
        className="dream-input text-lg"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <Textarea
        placeholder="Describe your dream in detail... What happened? Who was there? How did you feel?"
        className="dream-input min-h-[150px]"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      
      <div>
        <Label className="mb-2 block">Dream Tags</Label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              style={{
                backgroundColor: selectedTags.includes(tag.id)
                  ? tag.color
                  : tag.color + "20",
                color: selectedTags.includes(tag.id) ? "white" : tag.color,
              }}
              className="cursor-pointer px-3 py-1.5 transition-all hover:opacity-90"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="mood-select" className="mb-2 block">
            Mood
          </Label>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger id="mood-select">
              <SelectValue placeholder="Select mood" />
            </SelectTrigger>
            <SelectContent>
              {moods.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end space-x-2">
          <Label htmlFor="lucid">Lucid Dream</Label>
          <Switch
            id="lucid"
            checked={lucid}
            onCheckedChange={setLucid}
          />
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-gradient-to-r from-dream-lavender to-dream-purple hover:opacity-90"
        >
          {isSubmitting ? "Saving..." : "Save Dream"}
        </Button>
      </div>
    </form>
  );
};

export default DreamEntryForm;
