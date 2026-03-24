import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mic, FileText, Save, Tag, Sparkles, ImageIcon, ChevronDown } from "lucide-react";
import SectionImagesManager from "@/components/dreams/SectionImagesManager";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { useUserRole } from "@/hooks/useUserRole";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import { supabase } from "@/integrations/supabase/client";
import { VoiceRecorder } from "@/components/dreams/VoiceRecorder";
import { AudioPlayer } from "@/components/dreams/AudioPlayer";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import DreamAnalysis from "@/components/DreamAnalysis";
import DreamImageGenerator from "@/components/DreamImageGenerator";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { format } from "date-fns";

const CHARACTER_LIMIT = 3000;

const EditDream = () => {
  const navigate = useNavigate();
  const { dreamId } = useParams<{ dreamId: string }>();
  const { user } = useAuth();
  const { tags, entries, handleEditDream, isSubmitting } = useDreamJournal();
  const { uploadAudio, isUploading } = useAudioUpload();
  const { subscription } = useSubscriptionContext();
  const { isAdmin } = useUserRole();
  const isMystic = isAdmin || (subscription?.status === 'active' && subscription?.plan === 'Premium');

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    tags: [] as string[],
    mood: "Neutral",
    analysis: "",
    generatedImage: "",
    imagePrompt: "",
    lucid: false,
  });

  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);
  const [sectionImages, setSectionImages] = useState<any[]>([]);

  // Pre-populate from existing dream
  useEffect(() => {
    if (!dreamId || loaded) return;
    const dream = entries.find((e) => e.id === dreamId);
    if (!dream) return;
    setFormData({
      title: dream.title || "",
      content: dream.content || "",
      date: dream.date || new Date().toISOString().split("T")[0],
      tags: dream.tags || [],
      mood: dream.mood || "Neutral",
      analysis: dream.analysis || "",
      generatedImage: dream.generatedImage || dream.image_url || "",
      imagePrompt: dream.imagePrompt || dream.image_prompt || "",
      lucid: dream.lucid || false,
    });
    setAudioUrl(dream.audioUrl || dream.audio_url || "");
    setVideoUrl(dream.video_url || undefined);
    setSectionImages(Array.isArray((dream as any).section_images) ? (dream as any).section_images : []);
    if (dream.analysis) setAnalysisOpen(true);
    if (dream.generatedImage || dream.image_url) setImageOpen(true);
    setLoaded(true);
  }, [dreamId, entries, loaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "content" && value.length > CHARACTER_LIMIT) return;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleTagSelect = (tagId: string) => {
    setFormData((p) => ({
      ...p,
      tags: p.tags.includes(tagId) ? p.tags.filter((id) => id !== tagId) : [...p.tags, tagId],
    }));
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    setRecordedAudio(audioBlob);
    setAudioUrl(URL.createObjectURL(audioBlob));
  };

  const handleTranscriptionComplete = (text: string) => {
    setFormData((p) => ({
      ...p,
      content: p.content ? (p.content + "\n\n" + text).trim() : text,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !dreamId) { navigate("/auth"); return; }
    if (!formData.title.trim()) { toast.error("Please add a title for your dream"); return; }


    let uploadedAudioUrl = audioUrl;
    if (recordedAudio) {
      const uploaded = await uploadAudio(recordedAudio, dreamId);
      if (uploaded) { uploadedAudioUrl = uploaded; }
      else { toast.error("Failed to upload audio recording"); return; }
    }

    try {
      await handleEditDream(
        {
          title: formData.title,
          content: formData.content,
          tags: formData.tags,
          lucid: formData.lucid,
          mood: formData.mood,
          analysis: formData.analysis,
          generatedImage: formData.generatedImage,
          imagePrompt: formData.imagePrompt,
          audioUrl: uploadedAudioUrl || undefined,
        },
        dreamId
      );
      navigate("/journal");
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Failed to save changes");
    }
  };

  if (!loaded && entries.length > 0 && dreamId && !entries.find((e) => e.id === dreamId)) {
    return (
      <div className="min-h-screen starry-background flex items-center justify-center">
        <p className="text-muted-foreground">Dream not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen starry-background animate-page-reveal">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-background/60 backdrop-blur-lg border-b border-border/30 pt-safe-top">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/journal")} className="text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground">Edit Dream</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSubmit()}
            disabled={isSubmitting || isUploading || !formData.title.trim()}
            className="text-primary font-semibold"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 pb-28 space-y-6 max-w-2xl mx-auto">
        {/* Title + date */}
        <div className="space-y-1">
          <Input
            type="text"
            name="title"
            placeholder="Title your dream..."
            value={formData.title}
            onChange={handleChange}
            className="text-2xl font-bold bg-transparent border-0 border-b-2 border-blue-500 rounded-none px-0 h-auto py-2 focus:border-blue-400 placeholder:text-muted-foreground/40"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="text-xs text-muted-foreground bg-transparent border-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Segmented control */}
        <div className="flex items-center bg-muted/30 rounded-full p-1 w-fit mx-auto">
          <button
            type="button"
            onClick={() => setInputMode("text")}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all",
              inputMode === "text"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Text
          </button>
          <button
            type="button"
            onClick={() => setInputMode("voice")}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-medium transition-all",
              inputMode === "voice"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Mic className="h-3.5 w-3.5" />
            Voice
          </button>
        </div>

        {/* Content area */}
        {inputMode === "voice" ? (
          <div className="space-y-4">
            <div className="border border-border/30 rounded-2xl p-6 bg-muted/5">
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
                onTranscriptionComplete={handleTranscriptionComplete}
                onClear={() => {
                  setRecordedAudio(null);
                  if (audioUrl?.startsWith("blob:")) { URL.revokeObjectURL(audioUrl); setAudioUrl(""); }
                }}
                disabled={isUploading || isSubmitting}
              />
            </div>
            {audioUrl && (
              <div className="border border-border/30 rounded-xl p-4 bg-muted/5">
                <AudioPlayer audioUrl={audioUrl} title="Dream Recording" compact />
              </div>
            )}
            <Textarea
              name="content"
              placeholder="Add any extra details..."
              value={formData.content}
              onChange={handleChange}
              className="resize-none min-h-[120px] bg-transparent border-border/20 focus:border-primary/40"
              maxLength={CHARACTER_LIMIT}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-end">
              <span className={cn("text-xs", formData.content.length > CHARACTER_LIMIT * 0.9 ? "text-destructive" : "text-muted-foreground")}>
                {formData.content.length}/{CHARACTER_LIMIT}
              </span>
            </div>
            <Textarea
              name="content"
              placeholder="Close your eyes and let the dream flow back to you..."
              value={formData.content}
              onChange={handleChange}
              className="resize-none min-h-[300px] text-base leading-relaxed bg-transparent border-blue-500 focus:border-blue-400 focus:shadow-[0_0_15px_hsl(var(--primary)/0.1)] transition-shadow"
              maxLength={CHARACTER_LIMIT}
            />
          </div>
        )}

        {/* Tags */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
            <Tag className="h-3.5 w-3.5" />
            Tags
          </Label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Badge
              variant={formData.lucid ? "lucid" : "outline"}
              className="cursor-pointer transition-all hover:scale-105 flex-shrink-0"
              onClick={() => setFormData((p) => ({ ...p, lucid: !p.lucid }))}
            >
              ✦ Lucid
            </Badge>
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={formData.tags.includes(tag.id) ? "aurora" : "outline"}
                className="cursor-pointer transition-all hover:scale-105 flex-shrink-0"
                onClick={() => handleTagSelect(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dream Tools */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Dream Tools</Label>

          {/* AI Analysis */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <button
              type="button"
              onClick={() => setAnalysisOpen(!analysisOpen)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/5 hover:bg-muted/10 transition-colors text-left"
            >
              <motion.div
                className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                animate={{ rotate: analysisOpen ? 10 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">AI Analysis</p>
                <p className="text-xs text-muted-foreground">Get insights about your dream</p>
              </div>
              <motion.div
                animate={{ rotate: analysisOpen ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </button>
          </motion.div>
          <AnimatePresence>
            {analysisOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <DreamAnalysis
                    dreamContent={formData.content}
                    existingAnalysis={formData.analysis}
                    onAnalysisComplete={(analysis) => setFormData((p) => ({ ...p, analysis }))}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dream Image */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <button
              type="button"
              onClick={() => setImageOpen(!imageOpen)}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/5 hover:bg-muted/10 transition-colors text-left"
            >
              <motion.div
                className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                animate={{ rotate: imageOpen ? 10 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ImageIcon className="h-4 w-4 text-primary" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Dream Image</p>
                <p className="text-xs text-muted-foreground">Generate art from your dream</p>
              </div>
              <motion.div
                animate={{ rotate: imageOpen ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </button>
          </motion.div>
          <AnimatePresence>
            {imageOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <DreamImageGenerator
                    dreamContent={formData.content}
                    existingImage={formData.generatedImage}
                    existingPrompt={formData.imagePrompt}
                    onImageGenerated={(image, prompt) =>
                      setFormData((p) => ({ ...p, generatedImage: image, imagePrompt: prompt }))
                    }
                    dreamId={dreamId}
                    existingVideoUrl={videoUrl}
                    onVideoGenerated={(url) => {
                      setVideoUrl(url);
                      if (dreamId) {
                        supabase.from('dream_entries').update({ video_url: url }).eq('id', dreamId);
                      }
                    }}
                    onVideoDeleted={() => setVideoUrl(undefined)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section Images Manager */}
          {dreamId && sectionImages.length > 0 && (
            <div className="mt-4">
              <SectionImagesManager
                dreamId={dreamId}
                sectionImages={sectionImages}
                onUpdate={setSectionImages}
                isMystic={isMystic}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Fixed bottom save */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/60 backdrop-blur-lg border-t border-border/30 pb-safe-bottom z-20">
        <div className="max-w-2xl mx-auto">
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={() => handleSubmit()}
            disabled={isSubmitting || isUploading || !formData.title.trim()}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditDream;
