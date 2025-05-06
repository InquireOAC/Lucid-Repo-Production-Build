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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DreamAnalysis from "./DreamAnalysis";
import DreamImageGenerator from "./DreamImageGenerator";
import { X } from "lucide-react";

interface DreamEntryFormProps {
  existingDream?: any;
  tags: DreamTag[];
  onClose: () => void;
}

const DreamEntryForm = ({ existingDream, tags, onClose }: DreamEntryFormProps) => {
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
    generatedImage:
      existingDream?.image_url || existingDream?.generatedImage || "",
    imagePrompt:
      existingDream?.image_prompt || existingDream?.imagePrompt || "",
  });
  const [availableTags, setAvailableTags] = useState(tags);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAvailableTags(tags);
  }, [tags]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagSelect = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }
    setIsSubmitting(true);

    const dreamData = {
      title: formData.title,
      content: formData.content,
      dream_date: formData.date,
      tags: formData.tags,
      mood: formData.mood,
      user_id: user.id,
      analysis: formData.analysis,
      is_public: false,
      image_url: formData.generatedImage,
      image_prompt: formData.imagePrompt,
    };

    try {
      if (existingDream) {
        const { data, error } = await supabase
          .from("dream_entries")
          .update(dreamData)
          .eq("id", existingDream.id)
          .select()
          .single();
        if (error) throw error;
        console.log("Dream updated:", data);
      } else {
        const { data, error } = await supabase
          .from("dream_entries")
          .insert(dreamData)
          .select()
          .single();
        if (error) throw error;
        console.log("Dream created:", data);
      }
      onClose();
    } catch (err) {
      console.error("Error saving dream:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    console.log("Close icon tapped");  // verify this logs on tap
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-8 overflow-y-auto max-h-screen p-4"
    >
      {/* Close Button - X Icon */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-6 right-4 z-50 p-1 rounded-full bg-white dark:bg-gray-800"
      >
        <X className="h-6 w-6 text-gray-600" />
      </button>

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
        <Label>Tags</Label>
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
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, mood: value }))
          }
        >
          <SelectTrigger className="dream-input">
            <SelectValue placeholder="Select Mood" />
          </SelectTrigger>
          <SelectContent>
            {["Happy", "Sad", "Neutral", "Angry", "Excited", "Relaxed", "Confused"].map(
              (m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Dream Analysis & Image */}
      <div className="space-y-8">
        <DreamAnalysis
          dreamContent={formData.content}
          existingAnalysis={formData.analysis}
          onAnalysisComplete={(analysis) =>
            setFormData((prev) => ({ ...prev, analysis }))
          }
        />
        <DreamImageGenerator
          dreamContent={formData.content}
          existingPrompt={formData.imagePrompt}
          existingImage={formData.generatedImage}
          onImageGenerated={(imageUrl, prompt) =>
            setFormData((prev) => ({
              ...prev,
              generatedImage: imageUrl,
              imagePrompt: prompt,
            }))
          }
        />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
          >
            {isSubmitting ? "Saving..." : "Save Dream"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DreamEntryForm;
