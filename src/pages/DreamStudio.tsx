import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, Clapperboard, Download, Film, Image as ImageIcon,
  Loader2, Maximize2, Play, Plus, RefreshCw, Scissors, Share2, Sparkles, WandSparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useSceneFilm } from "@/hooks/useSceneFilm";
import { getUserAIContext } from "@/utils/aiContextUtils";
import { splitStoryAroundScenes } from "@/utils/illustratedStory";
import {
  isCurrentClip, makeScenePlan, normalizeScenes, selectClip, selectImage,
  STUDIO_STEPS, STYLE_OPTIONS, type StudioScene, type StudioStep,
} from "@/utils/dreamStudio";
import type { DreamEntry } from "@/types/dream";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { showSubscriptionPrompt } from "@/lib/stripe";

type BatchKind = "images" | "motion";
type BusyKind = "planning" | "images" | "motion" | "film" | null;
const panel = "rounded-[28px] border border-sky-200/10 bg-[#0c1b2c]/90 shadow-[0_20px_60px_rgba(0,0,0,.16)]";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function getInitialStep(dream: DreamEntry, scenes: StudioScene[]): StudioStep {
  if (dream.video_url) return "Film";
  if (scenes.some((scene) => scene.video_url)) return "Motion";
  if (scenes.some((scene) => scene.image_url)) return "Images";
  return scenes.length ? "Scenes" : "Story";
}

const DreamStudio = () => {
  const { dreamId } = useParams<{ dreamId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const { subscription } = useSubscriptionContext();
  const { isAdmin } = useUserRole();
  const isMystic = isAdmin || (subscription?.status === "active" && subscription?.plan === "Premium");
  const [dream, setDream] = useState<DreamEntry | null>(null);
  const [scenes, setScenes] = useState<StudioScene[]>([]);
  const [step, setStep] = useState<StudioStep>("Story");
  const [style, setStyle] = useState("surreal");
  const [useAvatar, setUseAvatar] = useState(false);
  const [motionPreset, setMotionPreset] = useState("Gentle cinematic movement, drifting atmosphere and a slow camera push");
  const [busy, setBusy] = useState<BusyKind>(null);
  const [activeScene, setActiveScene] = useState<number | null>(null);
  const [batch, setBatch] = useState<BatchKind | null>(null);
  const [batchIndices, setBatchIndices] = useState<number[]>([]);
  const [selectedMotion, setSelectedMotion] = useState<number[]>([]);
  const [batchPosition, setBatchPosition] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [previewScene, setPreviewScene] = useState<StudioScene | null>(null);
  const [filmPreviewIndex, setFilmPreviewIndex] = useState<number | null>(null);
  const [filmOrder, setFilmOrder] = useState<number[]>([]);
  const [includeVoice, setIncludeVoice] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { stage: filmStage, progress: filmProgress, exportFilm } = useSceneFilm(dreamId || "", (url) => {
    setDream((current) => current ? { ...current, video_url: url } : current);
  });

  useEffect(() => {
    if (authLoading) return;
    if (!userId) { navigate("/auth"); return; }
    if (!dreamId) { setLoadError("Dream not found"); setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase.from("dream_entries").select("*")
        .eq("id", dreamId).eq("user_id", userId).maybeSingle();
      if (cancelled) return;
      if (error || !data) { setLoadError("We couldn't open this dream. Check that it belongs to your account."); setLoading(false); return; }
      const loadedDream = data as DreamEntry;
      const loadedScenes = normalizeScenes(data.section_images, loadedDream.content);
      setDream(loadedDream);
      setScenes(loadedScenes);
      setSelectedMotion(loadedScenes.map((scene, index) => scene.image_url && !isCurrentClip(scene) ? index : -1).filter((index) => index >= 0));
      setStyle(loadedScenes[0]?.studio_style || "surreal");
      setUseAvatar(!!loadedScenes[0]?.studio_use_avatar);
      setFilmOrder(loadedScenes[0]?.film_order || loadedScenes.map((scene) => scene.section));
      setIncludeVoice(!!loadedScenes[0]?.include_voice);
      setStep(getInitialStep(loadedDream, loadedScenes));
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [authLoading, dreamId, navigate, userId]);

  const saveScenes = useCallback(async (next: StudioScene[]) => {
    if (!dreamId || !user) throw new Error("Please sign in to save your storyboard.");
    const numbered = next.map((scene, index) => ({ ...scene, section: index + 1 }));
    const { error } = await supabase.from("dream_entries")
      .update({ section_images: numbered as unknown as DreamEntry["section_images"] })
      .eq("id", dreamId).eq("user_id", user.id);
    if (error) throw error;
    setScenes(numbered);
    return numbered;
  }, [dreamId, user]);

  const storyParts = useMemo(() => splitStoryAroundScenes(dream?.content || "", scenes), [dream?.content, scenes]);
  const readyImages = scenes.filter((scene) => !!scene.image_url).length;
  const readyClips = scenes.filter(isCurrentClip).length;
  const previewClips = [...scenes.filter(isCurrentClip)].sort((a, b) => {
    const left = filmOrder.indexOf(a.section);
    const right = filmOrder.indexOf(b.section);
    return (left < 0 ? a.section : left) - (right < 0 ? b.section : right);
  });
  const missingImages = scenes.map((scene, index) => !scene.image_url ? index : -1).filter((index) => index >= 0);
  const missingClips = scenes.map((scene, index) => scene.image_url && !isCurrentClip(scene) ? index : -1).filter((index) => index >= 0);
  const selectedClipIndices = missingClips.filter((index) => selectedMotion.includes(index));
  const isWorking = busy !== null || filmStage === "preparing" || filmStage === "assembling" || filmStage === "uploading";

  const updateScene = async (index: number, patch: Partial<StudioScene>) => {
    const next = [...scenes];
    next[index] = { ...next[index], ...patch };
    setScenes(next);
    try { await saveScenes(next); }
    catch (error) { setScenes(scenes); throw error; }
  };

  const askBatch = (kind: BatchKind, indices: number[]) => {
    if (!indices.length) return;
    setBatchIndices(indices);
    setBatch(kind);
  };

  const saveFilmSettings = async (nextOrder: number[], nextVoice: boolean) => {
    setFilmOrder(nextOrder); setIncludeVoice(nextVoice);
    if (!scenes.length) return;
    try { await saveScenes([{ ...scenes[0], film_order: nextOrder, include_voice: nextVoice }, ...scenes.slice(1)]); }
    catch (error) { toast.error(errorMessage(error)); }
  };

  const moveFilmScene = (index: number, direction: -1 | 1) => {
    const order = previewClips.map((scene) => scene.section);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= order.length) return;
    [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
    saveFilmSettings(order, includeVoice);
  };

  const buildPlan = async () => {
    if (!dream?.content?.trim()) { toast.error("Add your dream story first."); return; }
    if (scenes.length) { setStep("Scenes"); return; }
    setBusy("planning");
    try {
      const { data, error } = await supabase.functions.invoke("split-dream-sections", { body: { content: dream.content } });
      const suggestions = !error && Array.isArray(data?.sections) ? data.sections : [];
      const fallback = Array.from({ length: Math.min(4, Math.max(2, Math.ceil(dream.content.length / 650))) }, () => ({ text: "" }));
      const plan = makeScenePlan(dream.content, suggestions.length >= 2 ? suggestions : fallback);
      await saveScenes(plan);
      setStep("Scenes");
      toast.success(suggestions.length >= 2 ? "Storyboard ready to review" : "Storyboard ready — you can refine each scene");
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(null); }
  };

  const splitScene = async (index: number) => {
    const current = scenes[index];
    if (!current || current.image_url) return;
    const midpoint = Math.floor(current.text.length / 2);
    const punctuation = [...current.text.matchAll(/[.!?](?=\s|$)/g)]
      .map((match) => (match.index || 0) + 1)
      .filter((position) => position > 30 && position < current.text.length - 30)
      .sort((a, b) => Math.abs(a - midpoint) - Math.abs(b - midpoint))[0];
    const whitespace = current.text.indexOf(" ", midpoint);
    const at = punctuation || whitespace;
    if (!at || at <= 0 || at >= current.text.length) { toast.error("This passage is too short to split."); return; }
    const first = current.text.slice(0, at).trim();
    const second = current.text.slice(at).trim();
    try {
      await saveScenes([...scenes.slice(0, index), { ...current, text: first, brief: first }, { section: 0, text: second, brief: second }, ...scenes.slice(index + 1)]);
    } catch (error) { toast.error(errorMessage(error)); }
  };

  const mergeScene = async (index: number) => {
    const current = scenes[index];
    const next = scenes[index + 1];
    if (!next || current.image_url || next.image_url) return;
    try {
      await saveScenes([...scenes.slice(0, index), { ...current, text: `${current.text} ${next.text}`.trim(), brief: `${current.brief || current.text} ${next.brief || next.text}`.trim() }, ...scenes.slice(index + 2)]);
    } catch (error) { toast.error(errorMessage(error)); }
  };

  const saveLook = async (nextStyle: string, nextAvatar: boolean) => {
    setStyle(nextStyle); setUseAvatar(nextAvatar);
    if (!scenes.length) return;
    try { await saveScenes(scenes.map((scene) => ({ ...scene, studio_style: nextStyle, studio_use_avatar: nextAvatar }))); }
    catch (error) { toast.error(errorMessage(error)); }
  };

  const generateImage = async (index: number, current: StudioScene[]): Promise<StudioScene[]> => {
    const scene = current[index];
    if (!scene) return current;
    try {
      const context = useAvatar && user ? await getUserAIContext(user.id).catch(() => null) : null;
      const { data: composed, error: promptError } = await supabase.functions.invoke("compose-cinematic-prompt", {
        body: { sceneBrief: `Dream Title: ${dream?.title || ""}\n\nScene: ${scene.brief || scene.text}`, imageStyle: style, hasCharacterReference: !!context?.photo_url },
      });
      if (promptError || !composed?.cinematicPrompt) throw new Error(promptError?.message || "Could not prepare this scene.");
      const { data: generated, error: imageError } = await supabase.functions.invoke("generate-dream-image", {
        body: {
          prompt: composed.cinematicPrompt, dreamContent: scene.text, dreamId,
          imageStyle: style,
          ...(context?.photo_url && { referenceImageUrl: context.photo_url }),
          ...(context?.outfit_photo_url && { outfitImageUrl: context.outfit_photo_url }),
          ...(context?.accessory_photo_url && { accessoryImageUrl: context.accessory_photo_url }),
        },
      });
      if (imageError || !generated?.imageUrl) throw new Error(imageError?.message || generated?.error || "Image generation failed.");
      const next = [...current];
      next[index] = { ...selectImage(scene, generated.imageUrl), prompt: composed.cinematicPrompt, studio_style: style, studio_use_avatar: useAvatar };
      await saveScenes(next);
      return next;
    } catch (error) {
      const next = [...current];
      next[index] = { ...scene, image_error: errorMessage(error) };
      try { await saveScenes(next); } catch { setScenes(next); }
      return next;
    }
  };

  const runImages = async (indices: number[]) => {
    if (!indices.length) { setStep("Motion"); return; }
    setBatch(null); setStep("Images"); setBusy("images"); setBatchTotal(indices.length);
    let current = [...scenes];
    for (let position = 0; position < indices.length; position++) {
      setBatchPosition(position + 1); setActiveScene(indices[position]);
      current = await generateImage(indices[position], current);
    }
    setActiveScene(null); setBusy(null);
    const ready = current.filter((scene) => scene.image_url).length;
    setSelectedMotion(current.map((scene, index) => scene.image_url && !isCurrentClip(scene) ? index : -1).filter((index) => index >= 0));
    toast[ready ? "success" : "error"](ready ? `${ready} scene image${ready === 1 ? "" : "s"} ready` : "Images could not be generated. Retry a scene below.");
  };

  const generateClip = async (index: number, current: StudioScene[]): Promise<StudioScene[]> => {
    const scene = current[index];
    if (!scene?.image_url) return current;
    const sourceImage = scene.image_url;
    try {
      let direction = scene.motion_prompt?.trim() || motionPreset;
      if (!scene.motion_prompt?.trim()) {
        const { data } = await supabase.functions.invoke("compose-animation-prompt", { body: { dreamContent: scene.text, imageUrl: sourceImage } });
        direction = `${motionPreset}. ${data?.prompt || ""}`.trim();
      }
      const { data, error } = await supabase.functions.invoke("generate-dream-video", {
        body: { dreamId, imageUrl: sourceImage, animationPrompt: direction, skipDreamUpdate: true },
      });
      if (error || !data?.videoUrl) throw new Error(error?.message || data?.error || "Motion generation failed.");
      const next = [...current];
      next[index] = { ...selectClip(scene, data.videoUrl, sourceImage), motion_prompt: direction };
      await saveScenes(next);
      return next;
    } catch (error) {
      const next = [...current];
      next[index] = { ...scene, clip_error: errorMessage(error) };
      try { await saveScenes(next); } catch { setScenes(next); }
      return next;
    }
  };

  const runMotion = async (indices: number[]) => {
    if (!isMystic) { showSubscriptionPrompt("video"); setBatch(null); return; }
    if (!indices.length) { setStep("Film"); return; }
    setBatch(null); setStep("Motion"); setBusy("motion"); setBatchTotal(indices.length);
    let current = [...scenes];
    for (let position = 0; position < indices.length; position++) {
      setBatchPosition(position + 1); setActiveScene(indices[position]);
      current = await generateClip(indices[position], current);
    }
    setActiveScene(null); setBusy(null);
    const ready = current.filter(isCurrentClip).length;
    setSelectedMotion(current.map((scene, index) => scene.image_url && !isCurrentClip(scene) ? index : -1).filter((index) => index >= 0));
    toast[ready ? "success" : "error"](ready ? `${ready} scene clip${ready === 1 ? "" : "s"} ready` : "Clips could not be generated. Retry a scene below.");
  };

  const exportCurrentFilm = async () => {
    const selected = previewClips.map((scene, index) => ({
      ...scene,
      narration_url: includeVoice && index === 0 ? dream?.audio_url : undefined,
    }));
    if (!selected.length) { toast.error("Animate at least one current image first."); return; }
    setBusy("film"); setStep("Film");
    try {
      const previousFilms = [...new Set([...(scenes[0]?.film_versions || []), dream?.video_url].filter(Boolean) as string[])];
      if (scenes[0] && dream?.video_url) await saveScenes([{ ...scenes[0], film_versions: previousFilms }, ...scenes.slice(1)]);
      const url = await exportFilm(selected);
      if (url) {
        if (scenes[0]) await saveScenes([{ ...scenes[0], film_versions: [...previousFilms, url] }, ...scenes.slice(1)]);
        setDream((current) => current ? { ...current, video_url: url } : current);
        setStep("Share");
      }
    } catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(null); }
  };

  const downloadFilm = async () => {
    if (!dream.video_url) return;
    try {
      const response = await fetch(dream.video_url);
      if (!response.ok) throw new Error("Could not download this film.");
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${dream.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "dream"}.mp4`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    } catch (error) { toast.error(errorMessage(error)); }
  };

  const shareDream = async () => {
    if (!dream.is_public) { toast.info("Make this dream public on its story page before sharing."); navigate(`/dream/${dream.id}`); return; }
    const url = `${window.location.origin}/dream/${dream.id}`;
    try {
      if (navigator.share) await navigator.share({ title: dream.title, url });
      else { await navigator.clipboard.writeText(url); toast.success("Dream link copied"); }
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") toast.error("Could not share this dream.");
    }
  };

  const navigateStep = (target: StudioStep) => {
    if (isWorking) return;
    if (target === "Scenes" && !scenes.length) return;
    if (target === "Images" && !scenes.length) return;
    if (target === "Motion" && !readyImages) return;
    if ((target === "Film" || target === "Share") && !readyClips && !dream?.video_url) return;
    setStep(target);
  };

  if (loading || authLoading) return <div className="mx-auto max-w-5xl px-5 py-24 text-center text-sky-100"><Loader2 className="mx-auto mb-4 animate-spin" />Opening your studio…</div>;
  if (loadError || !dream) return <div className="mx-auto max-w-xl px-5 py-24 text-center"><p>{loadError || "Dream not found"}</p><Button variant="outline" onClick={() => navigate("/journal")} className="mt-5">Back to library</Button></div>;

  return (
    <div className="min-h-screen bg-[#07111b] pb-36 text-slate-100">
      <div className="sticky top-0 z-30 border-b border-sky-100/10 bg-[#07111b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <button type="button" onClick={() => navigate(`/dream/${dream.id}`)} className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft size={18} /> <span className="hidden sm:inline">Back to dream</span></button>
          <div className="min-w-0 text-center"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-sky-300">Dream to Film Studio</p><p className="truncate text-xs text-slate-400">{dream.title}</p></div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] text-emerald-200">Saved to dream</span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-10">
        <div className="relative -mx-4 mb-6 h-48 overflow-hidden bg-[#10263d] sm:mx-0 sm:mt-5 sm:h-56 sm:rounded-[30px]">
          <img src={dream.image_url || dream.generatedImage || "/dream-art/luminous-whale.png"} alt="" className="h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07111b] via-[#07111b]/75 to-[#07111b]/10" />
          <div className="absolute inset-x-5 bottom-5 sm:inset-x-8 sm:bottom-7"><p className="mb-2 text-xs font-semibold uppercase tracking-[.3em] text-sky-300">Your creation workspace</p><h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">Bring your dream to life.</h1><p className="mt-2 max-w-xl text-sm text-slate-300">One story. A sequence of scenes. A film made from the images you choose.</p></div>
        </div>

        <nav aria-label="Creation stages" className="mb-7 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {STUDIO_STEPS.map((name, index) => {
            const current = step === name;
            const done = STUDIO_STEPS.indexOf(step) > index;
            return <button key={name} type="button" onClick={() => navigateStep(name)} aria-current={current ? "step" : undefined} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${current ? "border-sky-300/50 bg-sky-400/20 text-white" : done ? "border-emerald-300/20 bg-emerald-300/5 text-emerald-200" : "border-white/10 bg-white/[.03] text-slate-400 hover:text-white"}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full ${current ? "bg-sky-400 text-[#07111b]" : done ? "bg-emerald-400/20" : "bg-white/10"}`}>{done ? <Check size={12} /> : index + 1}</span>{name}</button>;
          })}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_315px]">
          <div className="min-w-0 space-y-5">
            {step === "Story" && <div className={`${panel} overflow-hidden`}><div className="border-b border-white/10 px-5 py-5 sm:px-7"><p className="text-xs font-semibold uppercase tracking-[.22em] text-sky-300">01 / Story</p><h2 className="mt-2 text-2xl font-semibold">The dream is the script</h2><p className="mt-1 text-sm text-slate-400">We’ll use your exact words throughout the visual story.</p></div><div className="space-y-4 px-5 py-6 text-base leading-8 text-slate-200 sm:px-7">{dream.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index} className="whitespace-pre-wrap">{paragraph}</p>)}<button type="button" onClick={() => navigate(`/journal/edit/${dream.id}`)} className="text-sm font-semibold text-sky-300 hover:text-sky-200">Edit the story <ChevronRight className="inline h-4 w-4" /></button></div></div>}

            {step === "Scenes" && <><StageHeading eyebrow="02 / Scenes" title="Shape your storyboard" description="Review the passages before any image credits are used. Each scene becomes a frame in the finished story." />{scenes.length === 0 ? <EmptyStage image="/dream-art/luminous-whale.png" title="Find the visual moments" text="We'll suggest a few scenes from your story. You can split, combine and change the visual direction before generating art." /> : <div className="space-y-5">{scenes.map((scene, index) => <div key={`${index}-${scene.section}`} className={`${panel} overflow-hidden`}><div className="flex items-center justify-between border-b border-white/10 px-5 py-3"><span className="text-xs font-bold uppercase tracking-[.25em] text-sky-300">Scene {index + 1} of {scenes.length}</span><span className="text-xs text-slate-500">{scene.text.length} characters</span></div><div className="space-y-4 p-5"><p className="whitespace-pre-wrap text-[15px] leading-7 text-slate-200">{scene.text || "This scene has no story passage yet."}</p><div><label htmlFor={`brief-${index}`} className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400">Visual direction</label><Textarea id={`brief-${index}`} defaultValue={scene.brief || scene.text} key={`${scene.section}-${scene.brief}`} onBlur={(event) => { const value = event.target.value.trim(); if (value !== (scene.brief || scene.text)) updateScene(index, { brief: value }).catch((error) => toast.error(errorMessage(error))); }} rows={2} className="border-sky-200/10 bg-[#071421] text-slate-100" /></div>{!scenes.some((item) => item.image_url) && <div className="flex flex-wrap gap-3 text-xs"><button type="button" onClick={() => splitScene(index)} className="inline-flex items-center gap-1.5 text-sky-300"><Scissors size={13} /> Split passage</button>{index < scenes.length - 1 && <button type="button" onClick={() => mergeScene(index)} className="inline-flex items-center gap-1.5 text-slate-300"><Plus size={13} /> Combine with next</button>}</div>}</div></div>)}</div>}</>}

            {step === "Images" && <><StageHeading eyebrow="03 / Images" title="Make the frames yours" description="Art appears in story order. Keep a frame, adjust its direction, or try a variation without losing the earlier one." /><div className="grid gap-5 sm:grid-cols-2">{scenes.map((scene, index) => <MediaCard key={index} scene={scene} index={index} kind="image" isActive={activeScene === index && busy === "images"} disabled={isWorking} onPreview={() => setPreviewScene(scene)} onRetry={() => askBatch("images", [index])} onSelectVariant={(url) => updateScene(index, selectImage(scene, url)).catch((error) => toast.error(errorMessage(error)))} onDirection={(value) => updateScene(index, { brief: value }).catch((error) => toast.error(errorMessage(error)))} />)}</div></>}

            {step === "Motion" && <><StageHeading eyebrow="04 / Motion" title="Bring the frames to life" description="Every clip starts from the image you selected. Animate them all or work scene by scene." /><div className={`${panel} p-5`}><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Motion mood</p><div className="flex flex-wrap gap-2">{["Gentle cinematic movement, drifting atmosphere and a slow camera push", "Dynamic cinematic movement with a sweeping camera and rising energy", "Quiet dreamlike motion with subtle light and floating particles"].map((preset, index) => <button type="button" key={preset} onClick={() => setMotionPreset(preset)} className={`rounded-full border px-4 py-2 text-xs ${motionPreset === preset ? "border-sky-300/60 bg-sky-400/20 text-white" : "border-white/10 text-slate-400"}`}>{["Cinematic", "Dynamic", "Dreamlike"][index]}</button>)}</div>{missingClips.length > 0 && <div className="mt-4 flex gap-4 text-xs"><button type="button" onClick={() => setSelectedMotion(missingClips)} className="text-sky-300">Select all ready frames</button><button type="button" onClick={() => setSelectedMotion([])} className="text-slate-400">Clear selection</button></div>}</div><div className="grid gap-5 sm:grid-cols-2">{scenes.map((scene, index) => <MediaCard key={index} scene={scene} index={index} kind="motion" isActive={activeScene === index && busy === "motion"} disabled={isWorking} selected={selectedMotion.includes(index)} onToggle={() => setSelectedMotion((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])} onPreview={() => setPreviewScene(scene)} onRetry={() => askBatch("motion", [index])} onSelectVariant={(url) => { const version = scene.clip_variants?.find((clip) => clip.url === url); if (version) updateScene(index, { video_url: version.url, clip_source_image_url: version.source_image_url }).catch((error) => toast.error(errorMessage(error))); }} onDirection={(value) => updateScene(index, { motion_prompt: value }).catch((error) => toast.error(errorMessage(error)))} />)}</div></>}

            {step === "Film" && <>
              <StageHeading eyebrow="05 / Film" title="See the whole sequence" description="Preview, order and trim the clips you already made. Export assembles them without regenerating images or motion." />
              {dream.video_url && <div className={`${panel} overflow-hidden p-3`}>
                <video src={dream.video_url} controls playsInline poster={dream.image_url || scenes[0]?.image_url} className="max-h-[70vh] w-full rounded-2xl bg-black object-contain" />
                <button type="button" onClick={() => setStep("Share")} className="m-3 text-sm font-semibold text-sky-300">Keep this film and continue →</button>
                {scenes[0]?.film_versions?.filter((url) => url !== dream.video_url).map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mx-3 mb-3 inline-block text-xs text-slate-400 underline">Earlier film {index + 1}</a>)}
              </div>}
              {readyClips > 0 && <>
                <div className={`${panel} p-5`}>
                  <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sky-300"><Clapperboard size={18} /><span className="text-xs font-bold uppercase tracking-[.25em]">Scene timeline</span></div><span className="text-xs text-slate-400">{previewClips.reduce((sum, scene) => sum + (scene.clip_duration_seconds || 5), 0)} sec</span></div>
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">{previewClips.map((scene, index) => <div key={scene.section} className="w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#071421]">
                    <img src={scene.image_url} alt={`Scene ${scene.section}`} className="aspect-[3/4] w-full object-cover" />
                    <div className="space-y-2 p-3"><p className="text-xs font-semibold">Scene {scene.section}</p><div className="flex gap-2"><button type="button" onClick={() => moveFilmScene(index, -1)} disabled={index === 0} aria-label={`Move scene ${scene.section} earlier`} className="rounded border border-white/10 px-2 py-1 text-xs disabled:opacity-30">←</button><button type="button" onClick={() => moveFilmScene(index, 1)} disabled={index === previewClips.length - 1} aria-label={`Move scene ${scene.section} later`} className="rounded border border-white/10 px-2 py-1 text-xs disabled:opacity-30">→</button></div><label className="block text-[11px] text-slate-400">Use {scene.clip_duration_seconds || 5} sec<input type="range" min="1" max="5" step="1" value={scene.clip_duration_seconds || 5} onChange={(event) => updateScene(scenes.findIndex((item) => item.section === scene.section), { clip_duration_seconds: Number(event.target.value) }).catch((error) => toast.error(errorMessage(error)))} className="mt-1 w-full accent-sky-400" /></label></div>
                  </div>)}</div>
                </div>
                {dream.audio_url && <div className={`${panel} flex items-center justify-between gap-4 p-5`}><div><p className="text-sm font-semibold">Include your voice recording</p><p className="text-xs text-slate-400">Use the audio you saved with this dream as narration.</p></div><Switch checked={includeVoice} onCheckedChange={(checked) => saveFilmSettings(filmOrder, checked)} aria-label="Include voice recording" /></div>}
                <div className={`${panel} p-4`}><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Preview your sequence</p><p className="text-xs text-slate-400">Plays existing clips in your chosen order without exporting.</p></div><Button variant="outline" onClick={() => setFilmPreviewIndex(0)} className="gap-2 border-sky-300/20"><Play size={14} /> Preview</Button></div>{filmPreviewIndex !== null && previewClips[filmPreviewIndex] && <video key={previewClips[filmPreviewIndex].video_url} src={previewClips[filmPreviewIndex].video_url} poster={previewClips[filmPreviewIndex].image_url} controls autoPlay playsInline onTimeUpdate={(event) => { const limit = previewClips[filmPreviewIndex].clip_duration_seconds || 5; if (limit < 5 && event.currentTarget.currentTime >= limit) setFilmPreviewIndex((current) => current !== null && current + 1 < previewClips.length ? current + 1 : null); }} onEnded={() => setFilmPreviewIndex((current) => current !== null && current + 1 < previewClips.length ? current + 1 : null)} className="mt-4 max-h-[60vh] w-full rounded-xl bg-black object-contain" />}</div>
              </>}
              {!readyClips && !dream.video_url && <EmptyStage image="/dream-art/luminous-whale.png" title="No clips yet" text="Return to Motion to animate at least one image before making your film." />}
              {filmStage === "error" && <p className="rounded-xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-200">Assembly failed. Your scene clips are saved; you can retry export.</p>}
              {isWorking && busy === "film" && <p className="text-sm text-sky-200">{filmStage === "preparing" ? "Preparing clips" : filmStage === "assembling" ? "Assembling film" : "Uploading film"} · {Math.round(filmProgress)}%</p>}
            </>}
            {step === "Share" && <><StageHeading eyebrow="06 / Share" title="Your dream has a new life" description="The illustrated story and film stay together on your dream page." /><div className={`${panel} overflow-hidden`}><div className="relative h-72"><img src={scenes.find((scene) => scene.image_url)?.image_url || dream.image_url || "/dream-art/luminous-whale.png"} alt="Dream artwork" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#07111b] to-transparent" /><h3 className="absolute bottom-5 left-5 text-2xl font-semibold">{dream.title}</h3></div><div className="flex flex-wrap gap-3 p-5"><Button onClick={() => navigate(`/dream/${dream.id}`)} className="gap-2"><ImageIcon size={16} /> Open illustrated story</Button>{dream.video_url && <Button variant="outline" onClick={downloadFilm} className="gap-2 border-sky-200/20 text-sky-200"><Download size={16} /> Download film</Button>}<Button variant="outline" onClick={shareDream} className="gap-2 border-sky-200/20 text-sky-200"><Share2 size={16} /> Share dream</Button></div></div></>}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start"><div className={`${panel} p-5`}><p className="text-xs font-bold uppercase tracking-[.25em] text-sky-300">Production notes</p><h3 className="mt-3 text-xl font-semibold">{dream.title}</h3><div className="mt-5 grid grid-cols-3 gap-2 text-center"><Counter value={scenes.length} label="Scenes" /><Counter value={readyImages} label="Images" /><Counter value={readyClips} label="Clips" /></div><div className="mt-5 border-t border-white/10 pt-4 text-xs leading-6 text-slate-400">Your original story remains intact. Generated media is saved to this dream as each scene finishes.</div></div>
            {(step === "Scenes" || step === "Images") && <div className={`${panel} p-5`}><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-slate-400">Visual language</p><div className="grid grid-cols-2 gap-2">{STYLE_OPTIONS.map((option) => <button type="button" key={option.id} onClick={() => saveLook(option.id, useAvatar)} className={`relative h-20 overflow-hidden rounded-xl border text-left ${style === option.id ? "border-sky-300" : "border-white/10"}`}><span className={`absolute inset-0 bg-gradient-to-br ${option.color}`} /><span className="absolute bottom-2 left-2 text-xs font-semibold text-white">{option.label}</span>{style === option.id && <Check className="absolute right-2 top-2 h-4 w-4 text-white" />}</button>)}</div><div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4"><div><p className="text-sm font-medium">Use my likeness</p><p className="text-xs text-slate-400">Use your saved avatar reference</p></div><Switch checked={useAvatar} onCheckedChange={(checked) => saveLook(style, checked)} aria-label="Use my likeness" /></div></div>}
            {scenes.length > 0 && <div className={`${panel} p-5`}><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-slate-400">Story preview</p><div className="max-h-80 space-y-4 overflow-auto pr-1">{scenes.map((scene, index) => <div key={index} className="border-l-2 border-sky-400/40 pl-3"><p className="line-clamp-2 text-xs leading-5 text-slate-300">{storyParts[index] || scene.text}</p>{scene.image_url && <img src={scene.image_url} alt="" className="mt-2 h-20 w-16 rounded-md object-cover" />}</div>)}</div></div>}
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 border-t border-sky-100/10 bg-[#07111b]/95 px-4 py-3 md:bottom-0 shadow-[0_-12px_40px_rgba(0,0,0,.3)] backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div className="hidden text-sm text-slate-400 sm:block">{isWorking ? `Creating ${batchPosition} of ${batchTotal}…` : step === "Scenes" ? `${scenes.length} scenes · review before generating` : step === "Images" ? `${readyImages} of ${scenes.length} frames ready` : step === "Motion" ? `${readyClips} of ${readyImages} clips ready` : "Your dream, one step closer to film"}</div><div className="flex w-full gap-2 sm:w-auto"><Button variant="outline" disabled={isWorking || step === "Story"} onClick={() => setStep(STUDIO_STEPS[Math.max(0, STUDIO_STEPS.indexOf(step) - 1)])} className="border-white/10 bg-white/[.04] text-slate-200">Back</Button>{step === "Story" ? <Button onClick={buildPlan} disabled={isWorking} className="flex-1 gap-2 sm:flex-none">{busy === "planning" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles size={16} />}{scenes.length ? "Review scenes" : "Find my scenes"}</Button> : step === "Scenes" ? <Button onClick={() => setStep("Images")} disabled={!scenes.length || isWorking} className="flex-1 gap-2 sm:flex-none">Choose image style <ArrowRight size={16} /></Button> : step === "Images" ? <Button onClick={() => missingImages.length ? askBatch("images", missingImages) : setStep("Motion")} disabled={isWorking || !scenes.length} className="flex-1 gap-2 sm:flex-none">{busy === "images" ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles size={16} />}{missingImages.length ? `Generate ${missingImages.length} image${missingImages.length === 1 ? "" : "s"}` : "Continue to motion"}</Button> : step === "Motion" ? <Button onClick={() => selectedClipIndices.length ? askBatch("motion", selectedClipIndices) : setStep("Film")} disabled={isWorking || !readyImages} className="flex-1 gap-2 sm:flex-none">{busy === "motion" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play size={16} />}{selectedClipIndices.length ? `Animate ${selectedClipIndices.length} scene${selectedClipIndices.length === 1 ? "" : "s"}` : "Review film"}</Button> : step === "Film" ? <Button onClick={() => readyClips ? exportCurrentFilm() : setStep("Share")} disabled={isWorking || (!readyClips && !dream.video_url)} className="flex-1 gap-2 sm:flex-none">{isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film size={16} />}{readyClips ? dream.video_url ? "Export scene film" : "Export film" : "Continue to share"}</Button> : <Button onClick={() => navigate(`/dream/${dream.id}`)} className="flex-1 gap-2 sm:flex-none">Open dream <ArrowRight size={16} /></Button>}</div></div></div>

      <Dialog open={!!batch} onOpenChange={(open) => !open && setBatch(null)}><DialogContent className="max-w-md border border-sky-200/15 bg-[#0c1b2c] text-white"><DialogTitle className="text-xl">{batch === "images" ? "Create your scene images" : "Animate your scenes"}</DialogTitle><p className="text-sm leading-6 text-slate-300">{batch === "images" ? `${batchIndices.length} scene${batchIndices.length === 1 ? "" : "s"} will be generated, using up to ${batchIndices.length} image credit${batchIndices.length === 1 ? "" : "s"}. Each finished image is saved immediately.` : `${batchIndices.length} ready image${batchIndices.length === 1 ? "" : "s"} will become short video clips. Motion generation requires a Mystic subscription. Finished clips are saved scene by scene.`}</p><div className="flex justify-end gap-2 pt-3"><Button variant="outline" onClick={() => setBatch(null)} className="border-white/15">Cancel</Button><Button onClick={() => batch === "images" ? runImages(batchIndices) : runMotion(batchIndices)}>{batch === "images" ? "Generate images" : isMystic ? "Animate scenes" : "See subscription"}</Button></div></DialogContent></Dialog>
      <Dialog open={!!previewScene} onOpenChange={(open) => !open && setPreviewScene(null)}><DialogContent className="flex h-[92dvh] max-h-[92dvh] w-[96vw] max-w-none flex-col items-center justify-center border border-sky-100/10 bg-[#030812] p-4 pt-12 text-white sm:w-[90vw]"><DialogTitle className="sr-only">Scene preview</DialogTitle>{previewScene?.video_url && step === "Motion" ? <video src={previewScene.video_url} poster={previewScene.image_url} controls playsInline autoPlay className="max-h-[calc(92dvh-5rem)] max-w-full rounded-xl object-contain" /> : previewScene?.image_url ? <img src={previewScene.image_url} alt={`Scene ${previewScene.section} enlarged`} className="max-h-[calc(92dvh-5rem)] max-w-full rounded-xl object-contain" /> : null}<span className="text-xs uppercase tracking-[.2em] text-slate-400">Scene {previewScene?.section}</span></DialogContent></Dialog>
    </div>
  );
};

const StageHeading = ({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) => <div className="pb-1"><p className="text-xs font-bold uppercase tracking-[.25em] text-sky-300">{eyebrow}</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p></div>;
const Counter = ({ value, label }: { value: number; label: string }) => <div className="rounded-xl bg-white/[.04] px-2 py-3"><p className="text-xl font-semibold text-white">{value}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p></div>;
const EmptyStage = ({ image, title, text }: { image: string; title: string; text: string }) => <div className={`${panel} overflow-hidden`}><img src={image} alt="" className="h-56 w-full object-cover opacity-70" /><div className="p-6"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">{text}</p></div></div>;

function MediaCard({ scene, index, kind, isActive, disabled, selected, onToggle, onPreview, onRetry, onSelectVariant, onDirection }: {
  scene: StudioScene; index: number; kind: "image" | "motion"; isActive: boolean; disabled: boolean; selected?: boolean; onToggle?: () => void;
  onPreview: () => void; onRetry: () => void; onSelectVariant: (url: string) => void; onDirection: (value: string) => void;
}) {
  const ready = kind === "image" ? !!scene.image_url : isCurrentClip(scene);
  const error = kind === "image" ? scene.image_error : scene.clip_error;
  const variants = kind === "image" ? scene.image_variants || [] : (scene.clip_variants || []).map((clip) => clip.url);
  const direction = kind === "image" ? scene.brief || scene.text : scene.motion_prompt || "";
  return <div className={`${panel} overflow-hidden`}><div className="relative aspect-[3/4] overflow-hidden bg-[radial-gradient(circle_at_30%_25%,#244869,#091725_70%)]">{kind === "motion" && ready ? <video src={scene.video_url} poster={scene.image_url} controls playsInline className="h-full w-full object-cover" /> : scene.image_url ? <button type="button" onClick={onPreview} className="h-full w-full cursor-zoom-in"><img src={scene.image_url} alt={`Scene ${index + 1}`} className="h-full w-full object-cover" /><Maximize2 className="absolute right-3 top-3 h-7 w-7 rounded-full bg-black/50 p-1.5" /></button> : <div className="flex h-full flex-col items-center justify-center gap-3 text-sky-200/60"><ImageIcon size={44} strokeWidth={1.3} /><span className="text-xs uppercase tracking-[.2em]">Frame {index + 1}</span></div>}{isActive && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07111b]/75"><Loader2 className="h-8 w-8 animate-spin text-sky-300" /><p className="mt-3 text-sm">{kind === "image" ? "Painting this moment…" : "Animating this frame…"}</p></div>}{ready && <span className="absolute left-3 top-3 rounded-full border border-emerald-300/30 bg-[#07111b]/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">Ready</span>}</div><div className="space-y-3 p-4"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-300">Scene {index + 1}</p><span className="text-[11px] text-slate-400">{kind === "image" ? `${variants.length} version${variants.length === 1 ? "" : "s"}` : scene.video_url ? "5 sec clip" : "Awaiting motion"}</span></div>{kind === "motion" && !!scene.image_url && !ready && <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-sky-300/[.06] p-2 text-xs text-sky-200"><input type="checkbox" checked={!!selected} onChange={onToggle} disabled={disabled} className="accent-sky-400" /> Include in next animation batch</label>}<p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-300">{scene.text}</p>{kind === "motion" && scene.video_url && !isCurrentClip(scene) && <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-2 text-xs text-amber-200">This clip came from an earlier image. Reanimate to include this frame in the film.</p>}{error && <p className="rounded-lg border border-red-300/20 bg-red-500/10 p-2 text-xs text-red-200">{error}</p>}<details className="text-xs"><summary className="cursor-pointer text-sky-300">Edit {kind === "image" ? "visual" : "motion"} direction</summary><Textarea key={direction} defaultValue={direction} onBlur={(event) => { const value = event.target.value.trim(); if (value !== direction) onDirection(value); }} rows={3} className="mt-2 border-white/10 bg-[#071421] text-slate-100" /></details>{variants.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1">{variants.map((url, variantIndex) => <button key={url} type="button" onClick={() => onSelectVariant(url)} disabled={disabled} className={`shrink-0 rounded-lg border px-2 py-1 text-[11px] ${url === (kind === "image" ? scene.image_url : scene.video_url) ? "border-sky-300 text-sky-200" : "border-white/10 text-slate-400"}`}>Version {variantIndex + 1}</button>)}</div>}<Button variant="outline" onClick={onRetry} disabled={disabled || (kind === "motion" && !scene.image_url)} className="w-full gap-2 border-sky-300/20 bg-sky-400/5 text-sky-200 hover:bg-sky-400/10"><RefreshCw size={14} /> {ready ? `Try another ${kind === "image" ? "image" : "clip"}` : error ? "Retry this scene" : kind === "image" ? "Generate this image" : "Animate this scene"}</Button></div></div>;
}

export default DreamStudio;
