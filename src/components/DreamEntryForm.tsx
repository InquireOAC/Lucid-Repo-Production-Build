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
import { VoiceRecorder } from "./dreams/VoiceRecorder";
import { AudioPlayer } from "./dreams/AudioPlayer";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { Check, Mic, FileText } from "lucide-react";
import { toast } from "sonner";
import { containsInappropriateContent, getContentWarningMessage } from "@/utils/contentFilter";

interface DreamEntryFormProps {
  existingDream?: any;
  tags: DreamTag[];
  onSubmit?: (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
    analysis?: string;
    generatedImage?: string;
    imagePrompt?: string;
    audio_url?: string;
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
  const { uploadAudio, isUploading } = useAudioUpload();
  
  const [formData, setFormData] = useState({
    title: existingDream?.title || "",
    content: existingDream?.content || "",
    date: existingDream?.date
      ? new Date(existingDream.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    tags: existingDream?.tags || [],
    mood: existingDream?.mood || "Neutral",
    analysis: existingDream?.analysis || "",
    generatedImage: existingDream?.generatedImage || existingDream?.image_url || "",
    imagePrompt: existingDream?.imagePrompt || existingDream?.image_prompt || "",
    lucid: existingDream?.lucid || false,
  });
  
  const [availableTags, setAvailableTags] = useState<DreamTag[]>(tags);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>(existingDream?.audio_url || '');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const CHARACTER_LIMIT = 3000;

  useEffect(() => {
    setAvailableTags(tags);
  }, [tags]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Apply character limit to content field
    if (name === "content" && value.length > CHARACTER_LIMIT) {
      return;
    }
    
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

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setRecordedAudio(audioBlob);
    setAudioUrl(URL.createObjectURL(audioBlob));
    setIsProcessingAudio(true);
    
    // Show processing message in content
    setFormData(p => ({
      ...p,
      content: p.content + (p.content ? '\n\n' : '') + '🎵 Processing audio transcription...'
    }));
    
    try {
      // Upload audio first
      const uploaded = await uploadAudio(audioBlob, existingDream?.id || 'new');
      if (uploaded) {
        setAudioUrl(uploaded);
      }

      // Convert blob to base64 for transcription
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          
          // Call voice-to-text edge function
          const response = await fetch('https://oelghoaiuvjhywlzldkt.supabase.co/functions/v1/voice-to-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audio: base64Audio }),
          });

          if (!response.ok) {
            throw new Error('Transcription failed');
          }

          const result = await response.json();
          if (result.success && result.text) {
            // Replace processing message with transcription
            setFormData(p => ({
              ...p,
              content: p.content.replace('🎵 Processing audio transcription...', result.text)
            }));
            toast.success('Recording transcribed successfully!');
          } else {
            throw new Error(result.error || 'Transcription failed');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          // Replace processing message with error
          setFormData(p => ({
            ...p,
            content: p.content.replace('🎵 Processing audio transcription...', '🎵 Audio recorded (transcription failed)')
          }));
          toast.error('Failed to transcribe recording. Audio saved successfully.');
        } finally {
          setIsProcessingAudio(false);
        }
      };
    } catch (error) {
      console.error('Audio processing error:', error);
      setFormData(p => ({
        ...p,
        content: p.content.replace('🎵 Processing audio transcription...', '🎵 Audio recorded')
      }));
      setIsProcessingAudio(false);
      toast.error('Failed to process audio recording.');
    }
  };

  const handleClearRecording = () => {
    setRecordedAudio(null);
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !onSubmit) return navigate("/auth");

    // Check for inappropriate content
    const textToCheck = `${formData.title} ${formData.content}`;
    if (containsInappropriateContent(textToCheck)) {
      toast.error(getContentWarningMessage());
      return;
    }

    let uploadedAudioUrl = audioUrl;

    // Upload audio if there's a new recording
    if (recordedAudio) {
      const uploaded = await uploadAudio(recordedAudio, existingDream?.id || 'new');
      if (uploaded) {
        uploadedAudioUrl = uploaded;
      }
    }
    
    // Use external submit handler if provided
    if (onSubmit) {
      try {
        await onSubmit({
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
          lucid: formData.lucid,
          mood: formData.mood,
          analysis: formData.analysis,
          generatedImage: formData.generatedImage,
          imagePrompt: formData.imagePrompt,
          audio_url: uploadedAudioUrl || null
        });
      } catch (error) {
        console.error("Submit error:", error);
      }
      return;
    }

    setIsSubmitting(true);
    try {
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
        lucid: formData.lucid,
        audio_url: uploadedAudioUrl || null
      };

      console.log("Saving dream with image URL:", formData.generatedImage);
      console.log("Saving dream with audio URL:", uploadedAudioUrl);

      if (existingDream) {
        const { error } = await supabase
          .from("dream_entries")
          .update(dreamData)
          .eq("id", existingDream.id);
          
        if (error) {
          console.error("Error updating dream:", error);
          toast.error("Failed to save dream");
          setIsSubmitting(false);
          return;
        } else {
          toast.success("Dream updated successfully");
        }
      } else {
        const { error } = await supabase
          .from("dream_entries")
          .insert(dreamData);
          
        if (error) {
          console.error("Error creating dream:", error);
          toast.error("Failed to save dream");
          setIsSubmitting(false);
          return;
        }
        toast.success("Dream saved successfully");
      }
      
      // Only navigate away on success
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save dream");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
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

          {/* Input Mode Toggle */}
          <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg">
            <Button
              type="button"
              variant={inputMode === 'text' ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode('text')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Text
            </Button>
            <Button
              type="button"
              variant={inputMode === 'voice' ? "default" : "outline"}
              size="sm"
              onClick={() => setInputMode('voice')}
              className="flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Voice
            </Button>
          </div>
          
          {inputMode === 'voice' ? (
            <div className="space-y-4">
              <Label>Record Your Dream</Label>
              <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 rounded-xl p-6 border border-primary/10">
                <VoiceRecorder
                  onRecordingComplete={handleVoiceRecording}
                  onClear={handleClearRecording}
                  disabled={isUploading || externalIsSubmitting || isSubmitting || isProcessingAudio}
                />
              </div>
              
              {/* Show audio player if there's a recording */}
              {audioUrl && (
                <div className="mt-4">
                  <AudioPlayer 
                    audioUrl={audioUrl} 
                    title="Dream Recording"
                    compact
                  />
                </div>
              )}

              {/* Still show text area but make it optional */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Additional Notes (Optional)</Label>
                  <span className={`text-sm ${
                    formData.content.length > CHARACTER_LIMIT * 0.9 
                      ? 'text-red-500' 
                      : 'text-muted-foreground'
                  }`}>
                    {formData.content.length}/{CHARACTER_LIMIT}
                  </span>
                </div>
                <Textarea
                  name="content"
                  placeholder="Add any additional details or notes about your dream..."
                  value={formData.content}
                  onChange={handleChange}
                  className={`dream-input resize-none ${isProcessingAudio ? 'bg-muted/50 cursor-not-allowed' : ''}`}
                  rows={3}
                  maxLength={CHARACTER_LIMIT}
                  disabled={isProcessingAudio}
                />
                <p className="text-xs text-muted-foreground">
                  {isProcessingAudio 
                    ? '🎵 Processing audio transcription...' 
                    : 'Voice transcription will be added here automatically'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Dream Description</Label>
                <span className={`text-sm ${
                  formData.content.length > CHARACTER_LIMIT * 0.9 
                    ? 'text-red-500' 
                    : 'text-muted-foreground'
                }`}>
                  {formData.content.length}/{CHARACTER_LIMIT}
                </span>
              </div>
              <Textarea
                name="content"
                placeholder="Describe your dream in detail..."
                value={formData.content}
                onChange={handleChange}
                className={`dream-input resize-none ${isProcessingAudio ? 'bg-muted/50 cursor-not-allowed' : ''}`}
                rows={4}
                required
                maxLength={CHARACTER_LIMIT}
                disabled={isProcessingAudio}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="dream-input w-fit max-w-48"
              required
            />
          </div>
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
            {availableTags.map((tag) => {
              const isSelected = formData.tags.includes(tag.id);
              return (
                <Badge
                  key={tag.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleTagSelect(tag.id)}
                  style={{ 
                    backgroundColor: isSelected ? tag.color : tag.color + "10", 
                    color: isSelected ? "#fff" : tag.color,
                    borderColor: tag.color
                  }}
                  className="cursor-pointer text-xs font-normal border transition-all duration-200 relative pl-6"
                >
                  <span className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                    <Check size={12} className="stroke-white" />
                  </span>
                  {tag.name}
                </Badge>
              );
            })}
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
            onImageGenerated={(url, prompt) => {
              console.log("Image generated callback with URL:", url);
              setFormData((p) => ({
                ...p,
                generatedImage: url,
                imagePrompt: prompt,
              }));
            }}
          />

          {/* Save */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={externalIsSubmitting || isSubmitting || isUploading}
              className="bg-gradient-to-r from-dream-purple to-dream-lavender hover:opacity-90"
            >
              {isUploading ? "Uploading Audio..." : 
               (externalIsSubmitting || isSubmitting) ? "Saving..." : 
               "Save Dream"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DreamEntryForm;