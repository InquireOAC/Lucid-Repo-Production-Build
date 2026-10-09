import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, Image as ImageIcon, Mic, Moon, MoreVertical, Pause, Play, Plus, Trash2, Upload, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { VoiceRecorder } from "@/components/dreams/VoiceRecorder";
import type { DreamTag } from "@/types/dream";

export interface DreamEditorValues {
  title: string;
  content: string;
  coverUrl: string;
  mood: string;
  lucid: boolean;
  tags: string[];
  audioUrl: string;
}

interface Props {
  mode: "new" | "edit";
  values: DreamEditorValues;
  onChange: (next: DreamEditorValues) => void;
  tags: DreamTag[];
  sceneCount?: number;
  status: string;
  busy: boolean;
  onBack: () => void;
  onDiscard: () => void;
  onSave: () => void;
  onOpenStudio: () => void;
  onRecording: (blob: Blob) => void;
  onClearRecording: () => void;
}

const DEFAULT_COVER = "/dream-art/whale-over-lake-v2.png";
const COVERS = [DEFAULT_COVER, "/dream-art/starry-lake.png", "/dream-art/door-at-horizon.png", "/dream-art/city-above-clouds.png"];
const MOODS = ["Awe", "Peaceful", "Joyful", "Curious", "Mysterious", "Exciting", "Anxious", "Fear", "Sad", "Neutral", "Other"];
const field = "w-full rounded-[20px] border border-[#274562] bg-[#0b2034]/70 text-[#eaf3ff] outline-none transition focus:border-[#5296f5] focus:ring-2 focus:ring-[#3484f6]/20 placeholder:text-[#7289a4]";
const label = "mb-2.5 block text-[15px] font-medium text-[#a9bed7] sm:text-lg";

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

function RecordingCard({ url, onRecording, onClearRecording, busy }: Pick<Props, "onRecording" | "onClearRecording" | "busy"> & { url: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [recorderOpen, setRecorderOpen] = useState(false);

  useEffect(() => { setTime(0); setPlaying(false); setDuration(0); }, [url]);

  const togglePlay = async () => {
    if (!audio.current) return;
    if (audio.current.paused) {
      try { await audio.current.play(); setPlaying(true); } catch { setPlaying(false); }
    } else { audio.current.pause(); setPlaying(false); }
  };

  return <div className="rounded-[20px] border border-[#203d5b] bg-[#0b2034]/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.03)] sm:p-5">
    {url ? <>
      <audio ref={audio} src={url} preload="metadata" onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} onEnded={() => setPlaying(false)} />
      <div className="flex items-center gap-4">
        <button type="button" onClick={togglePlay} aria-label={playing ? "Pause recording" : "Play recording"} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1b467f] text-white hover:bg-[#2861a8] sm:h-16 sm:w-16">{playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className="ml-1 h-6 w-6 fill-current" />}</button>
        <div className="min-w-0 flex-1"><div className="mb-2 truncate text-[15px] font-medium text-[#dce9fa] sm:text-lg">Original recording · {duration ? formatTime(duration) : "Audio"}</div><div className="flex items-center gap-3"><input aria-label="Recording position" type="range" min="0" max={duration || 1} step="0.1" value={time} onChange={(e) => { if (audio.current) audio.current.currentTime = Number(e.target.value); setTime(Number(e.target.value)); }} className="h-1.5 min-w-0 flex-1 accent-[#3785ff]" /><span className="whitespace-nowrap text-xs text-[#9bb4d3] sm:text-sm">{formatTime(time)} / {formatTime(duration)}</span></div></div>
        <div className="relative"><button type="button" aria-label="Recording options" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="rounded-full p-2 text-[#9bb4d3] hover:bg-white/10"><MoreVertical size={20} /></button>{menuOpen && <div className="absolute right-0 top-full z-20 w-44 rounded-xl border border-[#31516f] bg-[#102b43] p-1 shadow-xl"><button type="button" onClick={() => { setRecorderOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"><Mic size={15} /> Replace</button><button type="button" onClick={() => { onClearRecording(); setMenuOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-white/10"><Trash2 size={15} /> Remove</button></div>}</div>
      </div>
    </> : <button type="button" onClick={() => setRecorderOpen(!recorderOpen)} className="flex w-full items-center gap-4 text-left"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1b467f] text-[#d7e8ff]"><Mic size={25} /></span><span><strong className="block text-base font-medium">Add a voice recording</strong><small className="text-[#9db4d0]">Capture the dream while it is fresh</small></span><Plus className="ml-auto text-[#9db4d0]" /></button>}
    {recorderOpen && <div className="mt-4 border-t border-white/10 pt-4"><VoiceRecorder onRecordingComplete={(blob) => { onRecording(blob); setRecorderOpen(false); }} onClear={onClearRecording} disabled={busy} /></div>}
  </div>;
}

export function DreamEditorForm({ mode, values, onChange, tags, sceneCount = 0, status, busy, onBack, onDiscard, onSave, onOpenStudio, onRecording, onClearRecording }: Props) {
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const change = (patch: Partial<DreamEditorValues>) => onChange({ ...values, ...patch });
  const availableTags = tags.filter((tag) => !values.tags.includes(tag.id));

  const uploadCover = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") change({ coverUrl: reader.result }); setCoverPickerOpen(false); };
    reader.readAsDataURL(file);
  };

  return <div className="min-h-screen bg-[#031321] pb-36 text-[#edf5ff] sm:pb-44">
    <div className="mx-auto w-full max-w-[980px] px-4 pt-5 sm:px-8 sm:pt-8">
      <header className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center sm:mb-8">
        <button type="button" onClick={onBack} aria-label="Back to journal" className="w-fit rounded-full p-1 text-white hover:bg-white/10"><ArrowLeft className="h-7 w-7 sm:h-8 sm:w-8" /></button>
        <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-[38px]">{mode === "edit" ? "Edit Dream" : "New Dream"}</h1>
        <div className="flex items-center justify-end gap-2 text-right text-[10px] text-[#a6bdd8] sm:text-base"><span className="sm:hidden">{status === "Unsaved changes" ? "Unsaved" : status === "Draft saved" ? "Draft" : "Saved"}</span><span className="hidden sm:inline">{status}</span><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3985f6] text-white sm:h-8 sm:w-8"><Check size={17} /></span></div>
      </header>

      <div className="relative mb-7 aspect-[2.3/1] overflow-hidden rounded-[20px] border border-[#234869] bg-[#0b2943] sm:mb-8 sm:aspect-[2.35/1]">
        <img src={values.coverUrl || DEFAULT_COVER} alt="Dream cover" className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#031321]/65 to-transparent" />
        <button type="button" onClick={() => setCoverPickerOpen(true)} className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-[#708aaa]/70 bg-[#0a1d32]/85 px-4 py-2.5 text-sm text-white backdrop-blur-md hover:bg-[#163754] sm:bottom-5 sm:right-5 sm:px-5 sm:text-lg"><ImageIcon size={19} /> Change Cover</button>
      </div>

      <div className="space-y-5 sm:space-y-7">
        <div><label htmlFor="dream-title" className={label}>Title</label><input id="dream-title" value={values.title} onChange={(e) => change({ title: e.target.value })} placeholder="Give this dream a title" maxLength={120} className={`${field} h-16 px-5 text-xl sm:h-[76px] sm:px-7 sm:text-[28px]`} /></div>
        <div><label htmlFor="dream-details" className={label}>Dream Details</label><textarea id="dream-details" value={values.content} onChange={(e) => change({ content: e.target.value })} placeholder="What happened in your dream?" maxLength={3000} className={`${field} min-h-[160px] resize-y px-5 py-4 text-lg leading-relaxed sm:min-h-[180px] sm:px-7 sm:py-5 sm:text-[26px]`} /><p className="mt-1 text-right text-xs text-[#6885a4]">{values.content.length} / 3000</p></div>
        <RecordingCard url={values.audioUrl} onRecording={onRecording} onClearRecording={onClearRecording} busy={busy} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7">
          <div><label htmlFor="dream-mood" className={label}>Mood</label><div className="relative"><span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl">{values.mood === "Awe" ? "🌄" : values.mood === "Fear" ? "🌑" : "✨"}</span><select id="dream-mood" value={values.mood} onChange={(e) => change({ mood: e.target.value })} className={`${field} h-[68px] appearance-none pl-16 pr-12 text-lg sm:h-[76px] sm:text-xl`}>{MOODS.map((mood) => <option className="bg-[#0b2034]" key={mood} value={mood}>{mood}</option>)}</select><ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#a6bdd8]" /></div></div>
          <div><span className={label}>Lucid Dream</span><div className={`${field} flex h-[68px] items-center gap-4 px-5 sm:h-[76px] sm:px-7`}><Moon className="h-6 w-6 fill-[#3787fa] text-[#3787fa]" /><span className="min-w-0 flex-1 truncate text-lg sm:text-xl">Mark as lucid</span><Switch aria-label="Mark as lucid" checked={values.lucid} onCheckedChange={(lucid) => change({ lucid })} className="scale-110 data-[state=checked]:bg-[#3985f6]" /></div></div>
        </div>

        <div><span className={label}>Tags</span><div className="flex flex-wrap gap-2.5">{values.tags.map((id) => { const tag = tags.find((item) => item.id === id); return <button key={id} type="button" onClick={() => change({ tags: values.tags.filter((item) => item !== id) })} aria-label={`Remove ${tag?.name || id} tag`} className="flex items-center gap-2 rounded-full border border-[#3b5878] bg-[#0a1e32] px-4 py-2.5 text-base hover:border-[#6c9bd0]"><span className="text-[#49a6fc]">{tag?.name.toLowerCase().includes("water") ? "💧" : tag?.name.toLowerCase().includes("fly") ? "🪽" : "✦"}</span>{tag?.name || id}<X size={17} className="ml-1 text-[#9db7d7]" /></button>; })}<button type="button" onClick={() => setTagPickerOpen(!tagPickerOpen)} aria-expanded={tagPickerOpen} className="flex items-center gap-2 rounded-full border border-[#29445f] bg-[#0a1e32] px-4 py-2.5 text-base text-[#aec4dd] hover:border-[#6c9bd0]"><Plus size={20} /> Add tag</button></div>{tagPickerOpen && <div className="mt-3 flex flex-wrap gap-2 rounded-2xl border border-[#29445f] bg-[#0b2034] p-3">{availableTags.length ? availableTags.map((tag) => <button key={tag.id} type="button" onClick={() => { change({ tags: [...values.tags, tag.id] }); setTagPickerOpen(false); }} className="rounded-full border border-[#3b5878] px-3 py-1.5 text-sm hover:bg-[#244568]">{tag.name}</button>) : <span className="text-sm text-[#9db7d7]">All tags added</span>}</div>}</div>

        <button type="button" onClick={onOpenStudio} disabled={busy} className="flex w-full items-center gap-4 rounded-[20px] border border-[#23435f] bg-[#0b2034]/70 p-4 text-left transition hover:border-[#4b7cae] hover:bg-[#112d47] disabled:opacity-50 sm:p-5"><img src={values.coverUrl || DEFAULT_COVER} alt="" className="h-16 w-16 rounded-xl object-cover sm:h-20 sm:w-20" /><span className="min-w-0 flex-1"><strong className="block text-lg font-semibold sm:text-[23px]">Open Scene Studio</strong><small className="block truncate text-sm text-[#a8bed8] sm:text-lg">{mode === "new" ? "Save this dream, then explore its scenes" : sceneCount > 0 ? `Explore and edit the ${sceneCount} scenes from this dream` : "Build scenes, images and a film from this dream"}</small></span><ChevronRight className="shrink-0 text-[#b9d1ec]" /></button>
      </div>
    </div>

    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-[#1c3854] bg-[#031321]/95 px-4 py-3 backdrop-blur-xl pb-safe-bottom sm:px-8 sm:py-5"><div className="mx-auto grid max-w-[980px] grid-cols-2 gap-3 sm:gap-5"><button type="button" onClick={onDiscard} disabled={busy} className="flex h-14 items-center justify-center gap-2 rounded-[18px] border border-[#6b819b] bg-[#172a3d] text-sm font-medium text-white hover:bg-[#243d55] disabled:opacity-50 sm:h-[70px] sm:text-xl"><Trash2 className="h-5 w-5" /> Discard changes</button><button type="button" onClick={onSave} disabled={busy} className="flex h-14 items-center justify-center gap-2 rounded-[18px] bg-[#3985f6] text-sm font-medium text-white shadow-[0_12px_30px_rgba(29,103,225,.2)] hover:bg-[#5b9cff] disabled:opacity-50 sm:h-[70px] sm:text-xl"><Check className="h-6 w-6" />{busy ? "Saving…" : "Save Dream"}</button></div></footer>

    {coverPickerOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Choose dream cover" onClick={() => setCoverPickerOpen(false)}><div className="w-full max-w-xl rounded-3xl border border-[#31516f] bg-[#091e32] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">Choose a cover</h2><button type="button" onClick={() => setCoverPickerOpen(false)} aria-label="Close cover picker"><X /></button></div><div className="grid grid-cols-2 gap-3">{COVERS.map((cover) => <button key={cover} type="button" onClick={() => { change({ coverUrl: cover }); setCoverPickerOpen(false); }} className={`overflow-hidden rounded-xl border-2 ${values.coverUrl === cover ? "border-[#3985f6]" : "border-transparent"}`}><img src={cover} alt="Dream cover option" className="aspect-[1.7/1] w-full object-cover" /></button>)}</div><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadCover(e.target.files?.[0])} /><button type="button" onClick={() => fileRef.current?.click()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#4776a3] px-4 py-3 hover:bg-white/10"><Upload size={18} /> Upload your own image</button></div></div>}
  </div>;
}

export { DEFAULT_COVER };
