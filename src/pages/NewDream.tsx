import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, FileText, Sparkles, X, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import { VoiceRecorder } from "@/components/dreams/VoiceRecorder";
import { AudioPlayer } from "@/components/dreams/AudioPlayer";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { DreamDataPlugin } from "@/plugins/DreamDataPlugin";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const CHARACTER_LIMIT = 2000;
const EMOTIONS = ["Awe", "Dreamy", "Fear", "Excited", "Calm"];

const deriveTitle = (content: string): string => {
  const firstLine = (content.trim().split(/\n/)[0] || "").trim();
  const words = firstLine.split(/\s+/).slice(0, 6).join(" ");
  if (!words) return "Untitled dream";
  return words.length > 60 ? words.slice(0, 60) + "…" : words;
};

const NewDream = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tags, handleAddDream, isSubmitting } = useDreamJournal();
  const { uploadAudio, isUploading } = useAudioUpload();

  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [lucidity, setLucidity] = useState(0);
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [showTagPicker, setShowTagPicker] = useState(false);

  const now = useMemo(() => new Date(), []);
  const availableTags = tags.filter((t) => !selectedTags.includes(t.id));
  const tagName = (id: string) => tags.find((t) => t.id === id)?.name ?? id;

  const handleVoiceRecording = async (blob: Blob) => {
    setRecordedAudio(blob);
    setAudioUrl(URL.createObjectURL(blob));
  };
  const handleTranscription = (text: string) =>
    setContent((c) => (c ? (c + "\n\n" + text).trim() : text));

  const save = async (visualize: boolean) => {
    if (!user) { navigate("/auth"); return; }
    if (content.trim().length < 10) {
      toast.error("Tell us a little more about your dream first.");
      return;
    }

    let uploadedAudioUrl = audioUrl;
    if (recordedAudio) {
      const uploaded = await uploadAudio(recordedAudio, "new");
      if (uploaded) uploadedAudioUrl = uploaded;
      else { toast.error("Failed to upload audio recording"); return; }
    }

    const newId = await handleAddDream({
      title: deriveTitle(content),
      content,
      tags: selectedTags,
      lucid: lucidity > 0,
      mood: emotion || "Neutral",
      audioUrl: uploadedAudioUrl || undefined,
      lucidity_level: lucidity || undefined,
    });

    if (Capacitor.getPlatform() === "ios") {
      DreamDataPlugin.saveLatestDream({
        title: deriveTitle(content),
        preview: content.slice(0, 120),
        date: format(now, "MMM d"),
      }).catch(() => {});
    }

    if (visualize && newId) navigate(`/dream/${newId}`);
    else navigate("/journal");
  };

  const busy = isSubmitting || isUploading;

  return (
    <div className="min-h-screen starry-background animate-page-reveal pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/70 backdrop-blur-lg border-b border-border/30 pt-safe-top">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground p-1 -ml-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-foreground">New Dream</h1>
          <button
            onClick={() => save(false)}
            disabled={busy || content.trim().length < 10}
            className="text-primary font-semibold text-sm disabled:opacity-40"
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 py-5 space-y-7 max-w-2xl mx-auto">
        <p className="text-xs text-muted-foreground">{format(now, "MMM d, yyyy · h:mm a")}</p>

        {/* Text / Voice toggle */}
        <div className="flex items-center bg-muted/30 rounded-full p-1 w-fit">
          {(["text", "voice"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setInputMode(m)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize",
                inputMode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "text" ? <FileText className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {m}
            </button>
          ))}
        </div>

        {/* Dream content */}
        {inputMode === "voice" && (
          <div className="space-y-3">
            <div className="border border-border/30 rounded-2xl p-5 bg-muted/5">
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
                onTranscriptionComplete={handleTranscription}
                onClear={() => {
                  setRecordedAudio(null);
                  if (audioUrl?.startsWith("blob:")) { URL.revokeObjectURL(audioUrl); setAudioUrl(""); }
                }}
                disabled={busy}
              />
            </div>
            {audioUrl && (
              <div className="border border-border/30 rounded-xl p-4 bg-muted/5">
                <AudioPlayer audioUrl={audioUrl} title="Dream Recording" compact />
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <div className="rounded-2xl border border-primary/30 bg-card/40 p-4 focus-within:border-primary/60 transition-colors">
            <Textarea
              value={content}
              onChange={(e) => e.target.value.length <= CHARACTER_LIMIT && setContent(e.target.value)}
              placeholder="Close your eyes and let the dream flow back to you…"
              className="resize-none min-h-[180px] text-base leading-relaxed bg-transparent border-0 p-0 focus-visible:ring-0 placeholder:text-muted-foreground/40"
            />
            <div className="flex justify-end pt-2">
              <span className={cn("text-xs", content.length > CHARACTER_LIMIT * 0.9 ? "text-destructive" : "text-muted-foreground/60")}>
                {content.length} / {CHARACTER_LIMIT}
              </span>
            </div>
          </div>
        </div>

        {/* Emotions */}
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-foreground">Emotions</p>
          <p className="text-xs text-muted-foreground -mt-1.5">How did you feel?</p>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmotion((cur) => (cur === e ? "" : e))}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm border transition-all",
                  emotion === e
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "bg-transparent text-foreground/80 border-border/40 hover:bg-muted/30",
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-foreground">Tags</p>
          <p className="text-xs text-muted-foreground -mt-1.5">Add keywords</p>
          <div className="flex flex-wrap gap-2 items-center">
            {selectedTags.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedTags((s) => s.filter((x) => x !== id))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-primary/15 text-primary border border-primary/30"
              >
                {tagName(id)}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowTagPicker((v) => !v)}
              disabled={availableTags.length === 0}
              className="h-8 w-8 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {showTagPicker && availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {availableTags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedTags((s) => [...s, t.id]);
                    if (availableTags.length === 1) setShowTagPicker(false);
                  }}
                  className="px-3 py-1.5 rounded-full text-sm bg-transparent text-foreground/70 border border-border/40 hover:bg-muted/30"
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lucidity */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Lucidity</p>
              <p className="text-xs text-muted-foreground">How aware were you?</p>
            </div>
            <span className="text-sm font-semibold text-primary">{lucidity} / 10</span>
          </div>
          <Slider value={[lucidity]} onValueChange={([v]) => setLucidity(v)} min={0} max={10} step={1} />
        </div>
      </div>

      {/* Visualize CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/70 backdrop-blur-lg border-t border-border/30 pb-safe-bottom z-20 md:static md:border-0 md:bg-transparent md:backdrop-blur-none md:max-w-2xl md:mx-auto md:mb-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => save(true)}
            disabled={busy || content.trim().length < 10}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-[0_0_24px_hsl(var(--primary)/0.35)] hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            <Sparkles className="h-5 w-5" />
            {isSubmitting ? "Saving…" : "Visualize Dream"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDream;
