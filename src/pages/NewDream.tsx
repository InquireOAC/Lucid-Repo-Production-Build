import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, FileText, Save, Calendar, Tag, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import { VoiceRecorder } from "@/components/dreams/VoiceRecorder";
import { AudioPlayer } from "@/components/dreams/AudioPlayer";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import DreamAnalysis from "@/components/DreamAnalysis";
import DreamImageGenerator from "@/components/DreamImageGenerator";
import { toast } from "sonner";
import { containsInappropriateContent, getContentWarningMessage } from "@/utils/contentFilter";
import { cn } from "@/lib/utils";

const NewDream = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tags, handleAddDream, isSubmitting } = useDreamJournal();
  const { uploadAudio, isUploading } = useAudioUpload();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    tags: [] as string[],
    mood: "Neutral",
    analysis: "",
    generatedImage: "",
    imagePrompt: "",
    lucid: false
  });

  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const CHARACTER_LIMIT = 3000;

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  {
    const { name, value } = e.target;
    if (name === "content" && value.length > CHARACTER_LIMIT) return;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleTagSelect = (tagId: string) => {
    setFormData((p) => ({
      ...p,
      tags: p.tags.includes(tagId) ?
      p.tags.filter((id) => id !== tagId) :
      [...p.tags, tagId]
    }));
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setRecordedAudio(audioBlob);
    const localAudioUrl = URL.createObjectURL(audioBlob);
    setAudioUrl(localAudioUrl);
  };

  const handleTranscriptionComplete = (text: string) => {
    setFormData((p) => ({
      ...p,
      content: p.content ? (p.content + '\n\n' + text).trim() : text
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please add a title for your dream");
      return;
    }

    const textToCheck = `${formData.title} ${formData.content}`;
    if (containsInappropriateContent(textToCheck)) {
      toast.error(getContentWarningMessage());
      return;
    }

    let uploadedAudioUrl = audioUrl;
    if (recordedAudio) {
      const uploaded = await uploadAudio(recordedAudio, 'new');
      if (uploaded) {
        uploadedAudioUrl = uploaded;
      } else {
        toast.error('Failed to upload audio recording');
        return;
      }
    }

    try {
      await handleAddDream({
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        lucid: formData.lucid,
        mood: formData.mood,
        analysis: formData.analysis,
        generatedImage: formData.generatedImage,
        imagePrompt: formData.imagePrompt,
        audioUrl: uploadedAudioUrl || undefined
      });
      navigate("/");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to save dream");
    }
  };

  return (
    <div className="min-h-screen dream-tome-bg animate-page-reveal">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-card border-b border-primary/10 pt-safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-white/70 hover:text-white">

            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold white-text">What did you dream?</h1>
          <Button
            variant="aurora"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading || !formData.title.trim()}
            className="gap-2">

            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 pb-24 space-y-8 max-w-2xl mx-auto">

        {/* Title Input */}
        <div className="space-y-2">
          <Input
            type="text"
            name="title"
            placeholder="Title your dream..."
            value={formData.title}
            onChange={handleChange}
            className="text-xl font-medium bg-transparent border-0 border-b border-primary/20 rounded-none px-0 focus:border-primary/50 placeholder:text-muted-foreground/50" />

        </div>

        {/* Input Mode Toggle */}
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant={inputMode === 'text' ? "aurora" : "outline"}
            size="sm"
            onClick={() => setInputMode('text')}
            className="flex items-center gap-2">

            <FileText className="h-4 w-4" />
            Text
          </Button>
          <Button
            type="button"
            variant={inputMode === 'voice' ? "aurora" : "outline"}
            size="sm"
            onClick={() => setInputMode('voice')}
            className="flex items-center gap-2">

            <Mic className="h-4 w-4" />
            Voice
          </Button>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {inputMode === 'voice' ?
          <div className="space-y-4">
              {/* Voice Recorder */}
              <div className="luminous-card p-6 rounded-2xl">
                <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
                onTranscriptionComplete={handleTranscriptionComplete}
                onClear={() => {
                  setRecordedAudio(null);
                  if (audioUrl && audioUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(audioUrl);
                    setAudioUrl('');
                  }
                }}
                disabled={isUploading || isSubmitting} />

              </div>

              {/* Show recording preview */}
              {audioUrl &&
            <div className="glass-card p-4 rounded-xl">
                  <AudioPlayer
                audioUrl={audioUrl}
                title="Dream Recording"
                compact />

                </div>
            }

              {/* Optional notes */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Additional Notes (Optional)</Label>
                <Textarea
                name="content"
                placeholder="Add any extra details..."
                value={formData.content}
                onChange={handleChange}
                className="dream-input resize-none min-h-[100px]"
                maxLength={CHARACTER_LIMIT} />

              </div>
            </div> :

          <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-muted-foreground">Describe your dream</Label>
                <span className={cn(
                "text-xs",
                formData.content.length > CHARACTER_LIMIT * 0.9 ?
                'text-destructive' :
                'text-muted-foreground'
              )}>
                  {formData.content.length}/{CHARACTER_LIMIT}
                </span>
              </div>
              <Textarea
              name="content"
              placeholder="Close your eyes and let the dream flow back to you..."
              value={formData.content}
              onChange={handleChange}
              className="dream-input resize-none min-h-[200px] text-base leading-relaxed"
              maxLength={CHARACTER_LIMIT} />

            </div>
          }
        </div>

        {/* Metadata Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Date
            </Label>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="dream-input w-full h-9 text-sm" />

          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Mood</Label>
            <Select
              value={formData.mood}
              onValueChange={(value) => setFormData((p) => ({ ...p, mood: value }))}>

              <SelectTrigger className="dream-input w-full h-9 text-sm">
                <SelectValue placeholder="How did it feel?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Joyful">✨ Joyful</SelectItem>
                <SelectItem value="Peaceful">🌙 Peaceful</SelectItem>
                <SelectItem value="Neutral">😐 Neutral</SelectItem>
                <SelectItem value="Anxious">😰 Anxious</SelectItem>
                <SelectItem value="Scary">😱 Scary</SelectItem>
                <SelectItem value="Confused">🤔 Confused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4" />
            Tags
          </Label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={formData.lucid ? "lucid" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => setFormData((p) => ({ ...p, lucid: !p.lucid }))}>

              ✦ Lucid
            </Badge>
            {tags.map((tag) =>
            <Badge
              key={tag.id}
              variant={formData.tags.includes(tag.id) ? "aurora" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => handleTagSelect(tag.id)}>

                {tag.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Transform Section - Always visible */}
        <div className="space-y-4">
          <DreamAnalysis
            dreamContent={formData.content}
            existingAnalysis={formData.analysis}
            onAnalysisComplete={(analysis) => setFormData((p) => ({ ...p, analysis }))} />
          <DreamImageGenerator
            dreamContent={formData.content}
            existingImage={formData.generatedImage}
            existingPrompt={formData.imagePrompt}
            onImageGenerated={(image, prompt) =>
              setFormData((p) => ({ ...p, generatedImage: image, imagePrompt: prompt }))
            } />
        </div>

        {/* Save Button (mobile bottom) */}
        <div className="pt-4">
          <Button
            variant="luminous"
            className="w-full h-12 text-lg font-semibold text-secondary-foreground"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading || !formData.title.trim()}>

            {isSubmitting ? "Saving..." : "Save Dream"}
          </Button>
        </div>
      </div>
    </div>);

};

export default NewDream;