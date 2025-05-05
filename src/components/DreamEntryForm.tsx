import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DreamTag } from "@/types/dream";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
    lucid: existingDream?.lucid || false,
    mood: existingDream?.mood || null,
    analysis: existingDream?.analysis || "",
    generatedImage: existingDream?.image_url || existingDream?.generatedImage || "",
    imagePrompt: existingDream?.image_prompt || existingDream?.imagePrompt || ""
  });
  const [availableTags, setAvailableTags] = useState(tags);
  const [newTag, setNewTag] = useState("");
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: checked
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

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from("dream_tags")
        .insert({ name: newTag, color: getRandomColor() })
        .select()
        .single();

      if (error) throw error;

      setAvailableTags(prevTags => [...prevTags, data]);
      setFormData(prevState => ({
        ...prevState,
        tags: [...prevState.tags, data.id]
      }));
      setNewTag("");
    } catch (error) {
      console.error("Error creating tag:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoodChange = (value: number[]) => {
    setFormData(prevState => ({
      ...prevState,
      mood: String(value[0])
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
      lucid: formData.lucid,
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

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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

        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="New Tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="dream-input flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCreateTag}
            disabled={isSubmitting}
            className="whitespace-nowrap border-dream-lavender text-dream-lavender hover:bg-dream-lavender/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Tag
          </Button>
        </div>
      </div>

      {/* Dream Mood */}
      <div className="space-y-2">
        <Label>Mood</Label>
        <Slider
          defaultValue={[formData.mood ? parseInt(formData.mood) : 5]}
          max={10}
          step={1}
          aria-label="Mood"
          onChange={handleMoodChange}
        />
      </div>

      {/* Dream State */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="lucid"
          name="lucid"
          checked={formData.lucid}
          onCheckedChange={(checked) => setFormData(prevState => ({ ...prevState, lucid: !!checked }))}
        />
        <Label htmlFor="lucid">Lucid Dream</Label>
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
