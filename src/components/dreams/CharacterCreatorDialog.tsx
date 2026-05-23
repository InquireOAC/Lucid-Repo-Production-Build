// Side-character avatar creator. Opened from the Side Characters section of
// a dream. Wraps the same generate-dream-image pipeline that AIContextDialog
// uses but is scoped to a single dream_characters row at a time and never
// writes to ai_context (that's reserved for the user's own protagonist).
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Wand2, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

import styleDigitalArt from "@/assets/styles/digital_art.jpg";
import styleSurreal from "@/assets/styles/surreal.jpg";
import styleFantasy from "@/assets/styles/fantasy.jpg";
import styleCyberpunk from "@/assets/styles/cyberpunk.jpg";
import styleRealistic from "@/assets/styles/realistic.jpg";
import styleWatercolor from "@/assets/styles/watercolor.jpg";
import styleSketch from "@/assets/styles/sketch.jpg";
import styleOilPainting from "@/assets/styles/oil_painting.jpg";

const styleOptions = [
  { value: "digital_art", label: "Digital Art", thumb: styleDigitalArt },
  { value: "surreal", label: "Surreal", thumb: styleSurreal },
  { value: "fantasy", label: "Fantasy", thumb: styleFantasy },
  { value: "cyberpunk", label: "Cyberpunk", thumb: styleCyberpunk },
  { value: "realistic", label: "Realistic", thumb: styleRealistic },
  { value: "watercolor", label: "Watercolor", thumb: styleWatercolor },
  { value: "sketch", label: "Sketch", thumb: styleSketch },
  { value: "oil_painting", label: "Oil Painting", thumb: styleOilPainting },
];

const stylePrompts: Record<string, string> = {
  realistic:
    "Generate an ultra-realistic photographic portrait matching the supplied face reference exactly. Natural lighting, accurate skin texture, true-to-life eye reflections, simple softly-blurred backdrop. 8K headshot quality.",
  digital_art:
    "Create a polished AAA concept-art portrait of the supplied face reference. Clean edges, volumetric rim lighting, vibrant colors. Match likeness and features exactly.",
  surreal:
    "Create a surreal Dalí-meets-Magritte portrait of the supplied face reference. Dreamlike forms around them, chromatic lighting, deep perspective. Preserve exact likeness.",
  fantasy:
    "Create an epic fantasy portrait of the supplied face reference. Painterly detail, golden-hour rim lighting, magical particle effects, jewel-tone palette. Preserve exact likeness.",
  cyberpunk:
    "Create a cyberpunk portrait of the supplied face reference. Neon Blade Runner aesthetic, holographic accents, rain-slick reflections, pink/cyan neon. Preserve exact likeness.",
  watercolor:
    "Create a traditional watercolor portrait of the supplied face reference on cold-press paper. Wet-on-wet bleeds, transparent glazes, paper grain. Preserve likeness and features.",
  sketch:
    "Create a professional graphite sketch portrait of the supplied face reference. Cross-hatching, varied pencil pressure, visible paper tooth. Preserve likeness.",
  oil_painting:
    "Create a museum-quality oil painting portrait of the supplied face reference. Impasto brushstrokes, Rembrandt chiaroscuro, glazed luminous skin. Preserve likeness.",
};

interface CharacterCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing dream_characters row to edit, or `null` to create a new one */
  characterId: string | null;
  /** Prefilled name when opening a placeholder for the first time */
  initialName?: string;
  /** Fires after a successful save with the updated row id */
  onSaved?: (characterId: string) => void;
}

export const CharacterCreatorDialog: React.FC<CharacterCreatorDialogProps> = ({
  open,
  onOpenChange,
  characterId,
  initialName,
  onSaved,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [style, setStyle] = useState("digital_art");
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null);

  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [outfitPreview, setOutfitPreview] = useState<string | null>(null);
  const [accessoryPreview, setAccessoryPreview] = useState<string | null>(null);

  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [accessoryFile, setAccessoryFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const faceInputRef = useRef<HTMLInputElement>(null);
  const outfitInputRef = useRef<HTMLInputElement>(null);
  const accessoryInputRef = useRef<HTMLInputElement>(null);

  // Reset / load when the dialog opens.
  useEffect(() => {
    if (!open) return;
    setFaceFile(null);
    setOutfitFile(null);
    setAccessoryFile(null);

    if (characterId) {
      (async () => {
        const { data } = await supabase
          .from("dream_characters")
          .select("name, photo_url, face_photo_url, outfit_photo_url, accessory_photo_url, avatar_style")
          .eq("id", characterId)
          .maybeSingle();
        if (data) {
          setName(data.name || initialName || "");
          setStyle(data.avatar_style || "digital_art");
          setGeneratedAvatarUrl(data.photo_url || null);
          setFacePreview(data.face_photo_url || null);
          setOutfitPreview(data.outfit_photo_url || null);
          setAccessoryPreview(data.accessory_photo_url || null);
        } else {
          setName(initialName || "");
          setStyle("digital_art");
          setGeneratedAvatarUrl(null);
          setFacePreview(null);
          setOutfitPreview(null);
          setAccessoryPreview(null);
        }
      })();
    } else {
      setName(initialName || "");
      setStyle("digital_art");
      setGeneratedAvatarUrl(null);
      setFacePreview(null);
      setOutfitPreview(null);
      setAccessoryPreview(null);
    }
  }, [open, characterId, initialName]);

  const handleFilePick =
    (setter: React.Dispatch<React.SetStateAction<File | null>>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setter(file);
      const reader = new FileReader();
      reader.onloadend = () => previewSetter(reader.result as string);
      reader.readAsDataURL(file);
    };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${ext}`;
    const path = `character-photos/${fileName}`;
    const { error } = await supabase.storage.from("dream-images").upload(path, file);
    if (error) {
      console.error("Photo upload failed:", error);
      return null;
    }
    const { data } = supabase.storage.from("dream-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleGenerate = async () => {
    if (!user) return;
    const haveFace = !!faceFile || !!facePreview;
    if (!haveFace) {
      toast.error("Upload a face photo first");
      return;
    }

    setIsGenerating(true);
    try {
      let faceUrl: string | null = facePreview;
      if (faceFile) faceUrl = await uploadPhoto(faceFile);
      if (!faceUrl) {
        toast.error("Face photo upload failed");
        return;
      }

      let outfitUrl: string | undefined = outfitPreview || undefined;
      if (outfitFile) outfitUrl = (await uploadPhoto(outfitFile)) || undefined;
      let accessoryUrl: string | undefined = accessoryPreview || undefined;
      if (accessoryFile) accessoryUrl = (await uploadPhoto(accessoryFile)) || undefined;

      const basePrompt = stylePrompts[style] || stylePrompts.digital_art;
      const extras: string[] = [];
      if (outfitUrl) extras.push("Dress the character in the EXACT outfit shown in the outfit reference.");
      if (accessoryUrl) extras.push("Include the EXACT accessories shown in the accessory reference.");
      const prompt = extras.length
        ? `${basePrompt} Generate a FULL-BODY portrait showing the character head to toe. ${extras.join(" ")}`
        : basePrompt;

      const body: Record<string, string> = {
        prompt,
        referenceImageUrl: faceUrl,
        imageStyle: style,
      };
      if (outfitUrl) body.outfitImageUrl = outfitUrl;
      if (accessoryUrl) body.accessoryImageUrl = accessoryUrl;

      toast.info("Generating character...");
      const result = await supabase.functions.invoke("generate-dream-image", { body });
      if (result.error || !result.data) {
        console.error("Character avatar generation failed:", result.error);
        toast.error("Character generation failed");
        return;
      }
      const url = result.data?.imageUrl || result.data?.image_url || null;
      if (!url) {
        toast.error("Renderer returned no image");
        return;
      }
      setGeneratedAvatarUrl(url);
      setFacePreview(faceUrl);
      if (outfitUrl) setOutfitPreview(outfitUrl);
      if (accessoryUrl) setAccessoryPreview(accessoryUrl);
      // Clear file state since we now have URLs.
      setFaceFile(null);
      setOutfitFile(null);
      setAccessoryFile(null);
      toast.success("Character generated");
    } catch (e: any) {
      console.error("Character generation error:", e);
      toast.error("Failed to generate character");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Give the character a name");
      return;
    }
    setIsLoading(true);
    try {
      let faceUrl: string | null = facePreview;
      let outfitUrl: string | null = outfitPreview;
      let accessoryUrl: string | null = accessoryPreview;

      if (faceFile) faceUrl = await uploadPhoto(faceFile);
      if (outfitFile) outfitUrl = await uploadPhoto(outfitFile);
      if (accessoryFile) accessoryUrl = await uploadPhoto(accessoryFile);

      const payload = {
        user_id: user.id,
        name: name.trim(),
        photo_url: generatedAvatarUrl,
        face_photo_url: faceUrl,
        outfit_photo_url: outfitUrl,
        accessory_photo_url: accessoryUrl,
        avatar_style: style,
        updated_at: new Date().toISOString(),
      };

      let savedId = characterId;
      if (characterId) {
        const { error } = await supabase
          .from("dream_characters")
          .update(payload)
          .eq("id", characterId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("dream_characters")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        savedId = data.id;
      }

      // Fire off fingerprint analysis without blocking the dialog close.
      if (generatedAvatarUrl && savedId) {
        supabase.functions
          .invoke("analyze-character-image", {
            body: { photoUrl: generatedAvatarUrl, target: "dream_character", characterId: savedId },
          })
          .catch((err) => console.error("Fingerprint analysis failed:", err));
      }

      toast.success(characterId ? "Character updated" : "Character created");
      if (savedId) onSaved?.(savedId);
      onOpenChange(false);
    } catch (e: any) {
      console.error("Character save failed:", e);
      toast.error(`Failed to save: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearGenerated = () => setGeneratedAvatarUrl(null);

  return (
    <Dialog open={open} onOpenChange={isLoading || isGenerating ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border border-white/10 bg-gradient-to-b from-[hsl(220,20%,12%)] to-[hsl(220,25%,8%)]">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="text-base font-semibold text-white">Character Creator</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-white/40">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah"
              disabled={isLoading || isGenerating}
              className="bg-white/[0.04] border-white/[0.08] text-white"
            />
          </div>

          {/* Generated avatar preview */}
          {generatedAvatarUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider text-white/40">Generated Avatar</Label>
                <button
                  type="button"
                  onClick={clearGenerated}
                  className="text-[10px] text-white/40 hover:text-white/70"
                >
                  Clear &amp; regenerate
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-[3/4] max-h-72 mx-auto">
                <img src={generatedAvatarUrl} alt={name} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Face upload */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-white/40">Face Photo (required)</Label>
            <button
              type="button"
              onClick={() => faceInputRef.current?.click()}
              disabled={isLoading || isGenerating}
              className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-colors py-4 flex items-center justify-center gap-2 text-sm text-white/60"
            >
              {facePreview ? (
                <div className="flex items-center gap-3">
                  <img src={facePreview} alt="face" className="w-10 h-10 rounded-full object-cover" />
                  <span className="text-white/80">Replace face photo</span>
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload face photo
                </>
              )}
            </button>
            <input
              ref={faceInputRef}
              type="file"
              accept="image/*"
              onChange={handleFilePick(setFaceFile, setFacePreview)}
              className="hidden"
            />
          </div>

          {/* Optional outfit */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-white/40">Outfit Reference (optional)</Label>
            <button
              type="button"
              onClick={() => outfitInputRef.current?.click()}
              disabled={isLoading || isGenerating}
              className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-colors py-3 flex items-center justify-center gap-2 text-xs text-white/50"
            >
              {outfitPreview ? (
                <div className="flex items-center gap-3">
                  <img src={outfitPreview} alt="outfit" className="w-8 h-8 rounded object-cover" />
                  <span className="text-white/70">Replace outfit</span>
                </div>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Upload outfit
                </>
              )}
            </button>
            <input
              ref={outfitInputRef}
              type="file"
              accept="image/*"
              onChange={handleFilePick(setOutfitFile, setOutfitPreview)}
              className="hidden"
            />
          </div>

          {/* Optional accessory */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-white/40">Accessory Reference (optional)</Label>
            <button
              type="button"
              onClick={() => accessoryInputRef.current?.click()}
              disabled={isLoading || isGenerating}
              className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-colors py-3 flex items-center justify-center gap-2 text-xs text-white/50"
            >
              {accessoryPreview ? (
                <div className="flex items-center gap-3">
                  <img src={accessoryPreview} alt="accessory" className="w-8 h-8 rounded object-cover" />
                  <span className="text-white/70">Replace accessory</span>
                </div>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Upload accessory
                </>
              )}
            </button>
            <input
              ref={accessoryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFilePick(setAccessoryFile, setAccessoryPreview)}
              className="hidden"
            />
          </div>

          {/* Style picker */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-white/40">Visual Style</Label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {styleOptions.map((s) => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  disabled={isLoading || isGenerating}
                  className="flex-shrink-0 flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      "w-[60px] h-[60px] rounded-lg overflow-hidden border-2 transition-all",
                      style === s.value ? "border-primary ring-2 ring-primary/20" : "border-white/10",
                    )}
                  >
                    <img src={s.thumb} alt={s.label} className="w-full h-full object-cover" />
                  </div>
                  <span className={cn("text-[10px]", style === s.value ? "text-primary" : "text-white/50")}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || isGenerating || !facePreview}
              variant="luminous"
              className="flex-1 gap-2"
            >
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
              ) : (
                <><Wand2 className="h-4 w-4" /> {generatedAvatarUrl ? "Regenerate" : "Generate"}</>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || isGenerating}
              className="flex-1"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterCreatorDialog;
