import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Capacitor } from "@capacitor/core";
import { DreamDataPlugin } from "@/plugins/DreamDataPlugin";
import { useAuth } from "@/contexts/AuthContext";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import { useAudioUpload } from "@/hooks/useAudioUpload";
import { DreamEditorForm, DEFAULT_COVER, type DreamEditorValues } from "@/components/dreams/DreamEditorForm";
import { toast } from "sonner";

const draftKeyFor = (userId?: string) => `lucid-dream-draft:${userId || "guest"}`;
const emptyDream: DreamEditorValues = { title: "", content: "", coverUrl: DEFAULT_COVER, mood: "Awe", lucid: false, tags: [], audioUrl: "" };

function readDraft(key: string): DreamEditorValues {
  try {
    const guestHandoff = sessionStorage.getItem("lucid-draft-pending-auth") === "1";
    const saved = JSON.parse(localStorage.getItem(key) || (guestHandoff ? localStorage.getItem(draftKeyFor()) : null) || "{}");
    return { ...emptyDream, ...saved, tags: Array.isArray(saved.tags) ? saved.tags : Array.isArray(saved.selectedTags) ? saved.selectedTags : [] };
  } catch { return emptyDream; }
}

const deriveTitle = (content: string) => (content.trim().split(/\s+/).slice(0, 6).join(" ") || "Untitled dream").slice(0, 120);

export default function NewDream() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tags, handleAddDream, isSubmitting } = useDreamJournal();
  const { uploadAudio, isUploading } = useAudioUpload();
  const draftKey = draftKeyFor(user?.id);
  const [values, setValues] = useState<DreamEditorValues>(() => readDraft(draftKey));
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ ...values, audioUrl: values.audioUrl.startsWith("blob:") ? "" : values.audioUrl }));
      if (user?.id && sessionStorage.getItem("lucid-draft-pending-auth") === "1") {
        localStorage.removeItem(draftKeyFor());
        sessionStorage.removeItem("lucid-draft-pending-auth");
      }
    } catch { /* private browsing may disable local storage */ }
  }, [draftKey, user?.id, values]);

  const save = async (openStudio = false) => {
    if (!user) {
      try { sessionStorage.setItem("lucid-draft-pending-auth", "1"); } catch { /* storage unavailable */ }
      navigate("/auth");
      return;
    }
    if (!values.content.trim()) { toast.error("Add your dream details before saving."); return; }
    setSaving(true);
    try {
      let audioUrl = values.audioUrl;
      if (recordedAudio) {
        const uploaded = await uploadAudio(recordedAudio, "new");
        if (!uploaded) return;
        audioUrl = uploaded;
      }
      const title = values.title.trim() || deriveTitle(values.content);
      const dreamId = await handleAddDream({ title, content: values.content.trim(), tags: values.tags, lucid: values.lucid, mood: values.mood, generatedImage: values.coverUrl, audioUrl: audioUrl || undefined, lucidity_level: values.lucid ? 10 : undefined });
      if (!dreamId) return;
      try { localStorage.removeItem(draftKey); localStorage.removeItem(draftKeyFor()); } catch { /* storage unavailable */ }
      if (Capacitor.getPlatform() === "ios") DreamDataPlugin.saveLatestDream({ title, preview: values.content.slice(0, 120), date: format(new Date(), "MMM d") }).catch(() => {});
      navigate(openStudio ? `/journal/studio/${dreamId}` : `/journal/edit/${dreamId}`);
    } finally { setSaving(false); }
  };

  const discard = () => {
    try { localStorage.removeItem(draftKey); } catch { /* storage unavailable */ }
    setValues(emptyDream);
    setRecordedAudio(null);
    navigate("/journal");
  };

  return <DreamEditorForm mode="new" values={values} onChange={setValues} tags={tags} status="Draft saved" busy={saving || isSubmitting || isUploading} onBack={() => navigate("/journal")} onDiscard={discard} onSave={() => void save()} onOpenStudio={() => void save(true)} onRecording={(blob) => { setRecordedAudio(blob); setValues((current) => ({ ...current, audioUrl: URL.createObjectURL(blob) })); }} onClearRecording={() => { setRecordedAudio(null); setValues((current) => ({ ...current, audioUrl: "" })); }} />;
}
