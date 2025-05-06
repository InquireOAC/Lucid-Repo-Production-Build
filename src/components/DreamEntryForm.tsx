import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DreamTag } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DreamAnalysis from "./DreamAnalysis";
import DreamImageGenerator from "./DreamImageGenerator";
import { X } from "lucide-react";
import { toast } from "sonner";

interface DreamEntryFormProps {
  existingDream?: any;
  tags: DreamTag[];
  onSubmit?: (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

const DreamEntryForm = ({ 
  existingDream, 
  tags, 
  onSubmit, 
  isSubmitting: externalIsSubmitting 
}: DreamEntryFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: existingDream?.title || "",
    content: existingDream?.content || "",
    date: existingDream?.date
      ? new Date(existingDream.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    tags: existingDream?.tags || [],
    mood: existingDream?.mood || "Neutral",
    analysis: existingDream?.analysis || "",
    generatedImage: existingDream?.image_url || existingDream?.generatedImage || "",
    imagePrompt: existingDream?.image_prompt || existingDream?.imagePrompt || "",
    lucid: existingDream?.lucid || false, // We'll keep this in the state but not show UI for it
  });
  const [availableTags, setAvailableTags] = useState<DreamTag[]>(tags);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");

  useEffect(() => {
    setAvailableTags(tags);
  }, [tags]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleTagSelect = (tagId: string) => {
    setFormData((p) => ({
      ...p,
      tags: p.tags.includes(tagId)
        ? p.tags.filter((id) => id !== tagId)
        : [...p.tags, tagId],
    }));
  };

  const handleAddTag = async () => {
    if (!user) return;
    if (!newTagName.trim()) {
      toast.error("Tag name cannot be empty");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("dream_tags")
        .insert({
          name: newTagName.trim(),
          color: newTagColor,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setAvailableTags([...availableTags, data]);
      setFormData(p => ({ ...p, tags: [...p.tags, data.id] }));
      setNewTagName("");
      setShowTagInput(false);
      toast.success("Tag added successfully!");
    } catch (error: any) {
      toast.error(`Failed to add tag: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !onSubmit) return navigate("/auth");
    
    // Use external submit handler if provided
    if (onSubmit) {
      onSubmit({
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        lucid: formData.lucid,
        mood: formData.mood,
      });
      return;
    }

    setIsSubmitting(true);
    const dreamData = {
      title: formData.title,
      content: formData.content,
      dream_date: formData.date,
      tags: formData.tags,
      mood: formData.mood,
      user_id: user?.id,
      analysis: formData.analysis,
      is_public: false,
      image_url: formData.generatedImage,
      image_prompt: formData.imagePrompt,
      lucid: formData.lucid
    };

    try {
      if (existingDream) {
        const { error } = await supabase
          .from("dream_entries")
          .update(dreamData)
          .eq("id", existingDream.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("dream_entries")
          .insert(dreamData);
        if (error) throw error;
      }
      navigate(-1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close - just navigate back or reset form state
  const handleClose = () => {
    // If using in a dialog, just reset form state
    if (onSubmit) {
      return;
    }
    
    // Otherwise navigate back
    navigate(-1);
  };

  return (
    <div className="relative bg-background">
      {/* Scrollable Form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-y-auto pt-4 pb-6 space-y-8"
      >
        {/* Dream Details */}
        <div className="space-y-4">
          <Input
            type="text"
            name="title"
            placeholder="Dream Title"
            value={formData.title}
            onChange={handleChange}
            className="dream-input"
            required
          />
          <Textarea
            name="content"
            placeholder="Dream Description"
            value={formData.content}
            onChange={handleChange}
            className="dream-input resize-none"
            rows={4}
            required
          />
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="dream-input"
            required
          />
        </div>

        {/* Dream Tags */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Tags</Label>
            {!showTagInput && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTagInput(true)}
                className="text-xs"
              >
                + Add Tag
              </Button>
            )}
          </div>
          
          {showTagInput && (
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
                className="flex-1"
              />
              <Input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-12 p-1 h-10"
              />
              <Button 
                type="button"
                size="sm"
                onClick={handleAddTag}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTagInput(false)}
              >
                Cancel
              </Button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tag) => (
              <Badge
                key={tag.id}
                variant={formData.tags.includes(tag.id) ? "default" : "outline"}
                onClick={() => handleTagSelect(tag.id)}
                style={{ backgroundColor: tag.color + "40", color: tag.color }}
                className="cursor-pointer text-xs font-normal border"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mood Dropdown */}
        <div className="space-y-2">
          <Label>Mood</Label>
          <Select
            name="mood"
            value={formData.mood}
            onValueChange={(v) =>
              setFormData((p) => ({
                ...p,
                mood: v,
              }))
            }
          >
            <SelectTrigger className="dream-input">
              <SelectValue placeholder="Select Mood" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Happy",
                "Sad",
                "Neutral",
                "Anxious",
                "Angry",
                "Excited",
                "Relaxed",
                "Confused",
              ].map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Analysis & Image */}
        <div className="space-y-8">
          <DreamAnalysis
            dreamContent={formData.content}
            existingAnalysis={formData.analysis}
            onAnalysisComplete={(analysis) =>
              setFormData((p) => ({ ...p, analysis }))
            }
          />
          <DreamImageGenerator
            dreamContent={formData.content}
            existingPrompt={formData.imagePrompt}
            existingImage={formData.generatedImage}
            onImageGenerated={(url, prompt) =>
              setFormData((p) => ({
                ...p,
                generatedImage: url,
                imagePrompt: prompt,
              }))
            }
          />

          {/* Save */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={externalIsSubmitting || isSubmitting}
              className="bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
            >
              {externalIsSubmitting || isSubmitting ? "Saving..." : "Save Dream"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DreamEntryForm;
