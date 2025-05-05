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
    date: existingDream?.date ? new Date(existingDream.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    tags: existingDream?.tags || [],
    mood: existingDream?.mood || "Neutral",  // Default mood set to Neutral
    analysis: existingDream?.analysis || "",
    generatedImage: existingDream?.image_url || existingDream?.generatedImage || "",
    imagePrompt: existingDream?.image_prompt || existingDream?.imagePrompt || ""
  });
  const [availableTags, setAvailableTags] = useState(tags);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAvailableTags(tags);
  }, [tags]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleTagSelect = (tagId: string) => {
    setFormData(prevState => {
      if (prevState.tags.includes(tagId)) {
        return {
          ...prevState,
          tags: prevState.tags.filter(id => id !== tagId)
        };
      } else {
        return {
          ...prevState,
          tags: [...prevState.tags, tagId]
        };
      }
    });
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
      is_public: false, // Default to private
      image_url: formData.generatedImage,
      image_prompt: formData.imagePrompt
    };

    try {
      if (existingDream) {
        // Update existing dream
        const { data, error } = await supabase
          .from("dream_entries")
          .update(dreamData)
          .eq("id", existingDream.id)
          .select()
          .single();

        if (error) throw error;
        console.log("Dream updated:", data);
      } else {
        // Create new dream
        const { data, error } = await supabase
          .from("dream_entries")
          .insert(dreamData)
          .select()
          .single();

        if (error) throw error;
        console.log("Dream created:", data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving dream:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 overflow-y-auto max-h-screen p-4">
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
          {availableTags.map(tag => (
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
          onValueChange={(value) => setFormData({ ...formData, mood: value })}
        >
          <SelectTrigger className="dream-input">
            <SelectValue placeholder="Select Mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Happy">Happy</SelectItem>
            <SelectItem value="Sad">Sad</SelectItem>
            <SelectItem value="Neutral">Neutral</SelectItem>
            <SelectItem value="Angry">Angry</SelectItem>
            <SelectItem value="Excited">Excited</SelectItem>
            <SelectItem value="Relaxed">Relaxed</SelectItem>
            <SelectItem value="Confused">Confused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dream Analysis */}
      <div className="space-y-8">
        <DreamAnalysis
          dreamContent={formData.content}
          existingAnalysis={formData.analysis}
          onAnalysisComplete={(analysis) => {
            setFormData({
              ...formData,
              analysis: analysis
            });
          }}
        />
        
        <DreamImageGenerator
          dreamContent={formData.content}
          existingPrompt={formData.imagePrompt}
          existingImage={formData.generatedImage}
          onImageGenerated={(imageUrl, prompt) => {
            setFormData({
              ...formData,
              generatedImage: imageUrl,
              imagePrompt: prompt
            });
          }}
        />
        
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
