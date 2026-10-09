import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { DreamEditorForm, DEFAULT_COVER, type DreamEditorValues } from "@/components/dreams/DreamEditorForm";
import { toast } from "sonner";

const blank: DreamEditorValues = { title: "", content: "", coverUrl: DEFAULT_COVER, mood: "Neutral", lucid: false, tags: [], audioUrl: "" };

export default function EditDream() {
  const navigate = useNavigate();
  const { dreamId } = useParams<{ dreamId: string }>();
  const { user } = useAuth();
  const { tags, entries, handleEditDream, isSubmitting } = useDreamJournal();
  const { uploadAudio, isUploading } = useAudioUpload();
  const dream = entries.find((entry) => entry.id === dreamId);
  const [values, setValues] = useState<DreamEditorValues>(blank);
  const [initial, setInitial] = useState<DreamEditorValues>(blank);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dream || loadedId === dream.id) return;
    const next: DreamEditorValues = {
      title: dream.title || "",
      content: dream.content || "",
      coverUrl: dream.generatedImage || dream.image_url || DEFAULT_COVER,
      mood: dream.mood || "Neutral",
      lucid: dream.lucid || false,
      tags: dream.tags || [],
      audioUrl: dream.audioUrl || dream.audio_url || "",
    };
    setValues(next);
    setInitial(next);
    setLoadedId(dream.id);
  }, [dream, loadedId]);

  const dirty = JSON.stringify(values) !== JSON.stringify(initial) || Boolean(recordedAudio);
  const sceneCount = dream?.section_images?.length || 0;

  const save = async (openStudio = false) => {
    if (!user || !dreamId) { navigate("/auth"); return; }
    if (!values.title.trim()) { toast.error("Add a title for your dream."); return; }
    if (!values.content.trim()) { toast.error("Add your dream details."); return; }
    setSaving(true);
    try {
      let audioUrl = values.audioUrl;
      if (recordedAudio) {
        const uploaded = await uploadAudio(recordedAudio, dreamId);
        if (!uploaded) return;
        audioUrl = uploaded;
      }
      const saved = await handleEditDream({
        title: values.title.trim(), content: values.content.trim(), tags: values.tags,
        lucid: values.lucid, mood: values.mood,
        analysis: dream?.analysis || "", imagePrompt: dream?.imagePrompt || dream?.image_prompt || "",
        generatedImage: values.coverUrl, audioUrl: audioUrl || undefined,
      }, dreamId);
      if (!saved) return;
      const next = { ...values, audioUrl };
      setValues(next);
      setInitial(next);
      setRecordedAudio(null);
      setSavedAt(new Date());
      if (openStudio) navigate(`/journal/studio/${dreamId}`);
    } finally { setSaving(false); }
  };

  if (!dream || loadedId !== dream.id) return <div className="flex min-h-screen items-center justify-center bg-[#031321] text-[#abc1da]">Loading dream…</div>;

  return <DreamEditorForm mode="edit" values={values} onChange={(next) => { setValues(next); setSavedAt(null); }} tags={tags} sceneCount={sceneCount} status={dirty ? "Unsaved changes" : savedAt ? "Saved just now" : "All changes saved"} busy={saving || isSubmitting || isUploading} onBack={() => navigate("/journal")} onDiscard={() => { setValues(initial); setRecordedAudio(null); setSavedAt(null); }} onSave={() => void save()} onOpenStudio={() => void save(true)} onRecording={(blob) => { setRecordedAudio(blob); setValues((current) => ({ ...current, audioUrl: URL.createObjectURL(blob) })); }} onClearRecording={() => { setRecordedAudio(null); setValues((current) => ({ ...current, audioUrl: "" })); }} />;
}
