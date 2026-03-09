
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Sparkles, X, ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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

const avatarStyleOptions = [
  { value: "digital_art", label: "Digital Art", thumb: styleDigitalArt },
  { value: "surreal", label: "Surreal", thumb: styleSurreal },
  { value: "fantasy", label: "Fantasy", thumb: styleFantasy },
  { value: "cyberpunk", label: "Cyberpunk", thumb: styleCyberpunk },
  { value: "realistic", label: "Realistic", thumb: styleRealistic },
  { value: "watercolor", label: "Watercolor", thumb: styleWatercolor },
  { value: "sketch", label: "Sketch", thumb: styleSketch },
  { value: "oil_painting", label: "Oil Painting", thumb: styleOilPainting },
];

interface AIContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DreamCharacter {
  id: string;
  user_id: string;
  name: string | null;
  photo_url: string | null;
  face_photo_url: string | null;
  outfit_photo_url: string | null;
  accessory_photo_url: string | null;
  avatar_style: string;
  visual_fingerprint: string | null;
  created_at: string;
  updated_at: string;
}

type Mode = "view" | "add" | "edit";

const AIContextDialog = ({ open, onOpenChange }: AIContextDialogProps) => {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<DreamCharacter[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("view");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Form state for add/edit
  const [formName, setFormName] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("digital_art");
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // File states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [rawPhotoPreview, setRawPhotoPreview] = useState<string | null>(null);
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [outfitPreview, setOutfitPreview] = useState<string | null>(null);
  const [accessoryFile, setAccessoryFile] = useState<File | null>(null);
  const [accessoryPreview, setAccessoryPreview] = useState<string | null>(null);

  // Editing character id
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  const selectedCharacter = characters[selectedIndex] || null;

  useEffect(() => {
    if (open && user) {
      fetchCharacters();
    }
  }, [open, user]);

  const fetchCharacters = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      let { data, error } = await supabase
        .from('dream_characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Migrate existing ai_context data if no dream_characters exist
      if (!data || data.length === 0) {
        const { data: aiCtx } = await supabase
          .from('ai_context')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (aiCtx?.photo_url) {
          await supabase.from('dream_characters').insert({
            user_id: user.id,
            name: aiCtx.name || null,
            photo_url: aiCtx.photo_url,
            face_photo_url: aiCtx.photo_url,
            outfit_photo_url: aiCtx.outfit_photo_url || null,
            accessory_photo_url: aiCtx.accessory_photo_url || null,
            avatar_style: 'digital_art',
            visual_fingerprint: aiCtx.visual_fingerprint || null,
          });
          // Re-fetch after migration
          const { data: refreshed } = await supabase
            .from('dream_characters')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
          data = refreshed;
        }
      }

      setCharacters(data || []);
      if ((data || []).length > 0 && selectedIndex >= (data || []).length) {
        setSelectedIndex(0);
      }

      // Auto-enter add mode when no characters exist
      if (!data || data.length === 0) {
        setMode("add");
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const resetFormState = () => {
    setFormName("");
    setSelectedStyle("digital_art");
    setGeneratedAvatarUrl(null);
    setPhotoFile(null);
    setRawPhotoPreview(null);
    setOutfitFile(null);
    setOutfitPreview(null);
    setAccessoryFile(null);
    setAccessoryPreview(null);
    setEditingCharacterId(null);
  };

  const handleAddMode = () => {
    resetFormState();
    setMode("add");
  };

  const handleEditMode = () => {
    if (!selectedCharacter) return;
    resetFormState();
    setFormName(selectedCharacter.name || "");
    setSelectedStyle(selectedCharacter.avatar_style || "digital_art");
    setEditingCharacterId(selectedCharacter.id);
    // Show existing reference photos as previews
    setRawPhotoPreview(selectedCharacter.face_photo_url);
    setOutfitPreview(selectedCharacter.outfit_photo_url);
    setAccessoryPreview(selectedCharacter.accessory_photo_url);
    setGeneratedAvatarUrl(selectedCharacter.photo_url);
    setMode("edit");
  };

  const handleCancelForm = () => {
    resetFormState();
    setMode("view");
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be smaller than 5MB');
        return;
      }
      setFile(file);
      setPreview(URL.createObjectURL(file));
      if (setFile === setPhotoFile) {
        setGeneratedAvatarUrl(null);
      }
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `ai-context-photos/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('dream-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('dream-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const getAvatarStylePrompt = (style: string): string => {
    const avatarPrompts: Record<string, string> = {
      realistic: `Generate an ultra-realistic, photographic portrait of the person in this reference photo. This must look like a real DSLR photograph — not a painting, illustration, or digital art. Use natural studio lighting, shallow depth of field, accurate skin texture with pores and subtle imperfections, realistic hair strands, and true-to-life eye reflections. The background should be a simple, softly blurred studio backdrop. Capture their exact likeness, facial structure, skin tone, and features. 8K resolution, professional headshot quality.`,
      digital_art: `Create a AAA concept-art quality portrait of the person in this reference photo. Polished, professional, ArtStation-trending caliber. Clean vector-sharp edges, volumetric rim lighting with subsurface scattering on skin, vibrant saturated colors. Capture their exact likeness and facial features in a cinematic digital art style suitable for a profile avatar.`,
      surreal: `Create a surreal dreamscape portrait of the person in this reference photo in a Salvador Dalí meets Magritte style. Melting forms, impossible geometry around them, hyper-detailed textures, chromatic otherworldly lighting with bioluminescent glows. Capture their exact likeness within a fantastical, vivid atmosphere with deep perspective.`,
      fantasy: `Create an epic fantasy portrait of the person in this reference photo. Rich painterly detail, golden-hour rim lighting with dramatic volumetric god-rays. Ornate details, magical particle effects (floating embers, ethereal wisps). Jewel-tone palette (deep emeralds, royal purples, burnished golds). Capture their exact likeness as a fantasy character.`,
      cyberpunk: `Create a cyberpunk portrait of the person in this reference photo. Neon-drenched Blade Runner aesthetic: holographic HUD overlays, rain-slick reflections, volumetric fog with pink/cyan neon scatter. Materials: brushed chrome accents, glowing circuit traces. Deep contrast with pitch-black shadows and intense neon highlights. Capture their exact likeness.`,
      watercolor: `Create a traditional watercolor portrait of the person in this reference photo on cold-press paper. Visible paper grain, pigment granulation, wet-on-wet bleeding edges where colors organically merge. Transparent layered glazes, unpainted white paper highlights for the brightest areas. Delicate flowing edges. Capture their exact likeness and features.`,
      sketch: `Create a professional graphite sketch portrait of the person in this reference photo. Varied pencil pressure (2H to 6B), cross-hatching for shadow depth, visible paper tooth texture. Smudged soft gradients in shadow areas, raw construction lines left visible for authenticity. High contrast between white highlights and deep graphite blacks. Capture their exact likeness.`,
      oil_painting: `Create a museum-quality oil painting portrait of the person in this reference photo. Thick impasto brushstrokes, visible canvas weave, Rembrandt-style chiaroscuro with dramatic single-source lighting. Glazed luminous skin tones, visible palette knife marks, rich saturated pigments. Classical golden-ratio composition. Capture their exact likeness.`,
    };
    return avatarPrompts[style] || avatarPrompts.digital_art;
  };

  const generateCharacterAvatar = async (rawPhotoUrl: string, outfitUrl?: string, accessoryUrl?: string): Promise<string | null> => {
    try {
      const hasOutfitOrAccessory = !!outfitUrl || !!accessoryUrl;
      let prompt = getAvatarStylePrompt(selectedStyle);
      if (hasOutfitOrAccessory) {
        prompt += ` Generate a FULL-BODY portrait showing the character from head to toe.`;
        if (outfitUrl) prompt += ` Dress the character in the EXACT outfit shown in the outfit reference image.`;
        if (accessoryUrl) prompt += ` Add the EXACT accessories shown in the accessory reference image.`;
      }
      const body: Record<string, string> = { prompt, referenceImageUrl: rawPhotoUrl, imageStyle: selectedStyle };
      if (outfitUrl) body.outfitImageUrl = outfitUrl;
      if (accessoryUrl) body.accessoryImageUrl = accessoryUrl;

      const result = await supabase.functions.invoke("generate-dream-image", { body });
      if (result.error || !result.data) {
        console.error("Avatar generation error:", result.error);
        return null;
      }
      return result.data?.imageUrl || result.data?.image_url || null;
    } catch (error) {
      console.error("Error generating character avatar:", error);
      return null;
    }
  };

  const handleGenerateCharacter = async () => {
    if (!user) return;

    // Need either a new file or an existing face photo (edit mode)
    const hasFaceSource = !!photoFile || (mode === "edit" && !!rawPhotoPreview && !photoFile);
    if (!hasFaceSource) {
      toast.error("Please upload a face photo first");
      return;
    }

    setIsGenerating(true);
    try {
      let rawPhotoUrl: string | null = null;
      if (photoFile) {
        rawPhotoUrl = await uploadPhoto(photoFile);
      } else if (mode === "edit" && rawPhotoPreview) {
        rawPhotoUrl = rawPhotoPreview; // use existing URL
      }
      if (!rawPhotoUrl) {
        toast.error('Failed to upload face photo');
        return;
      }

      let outfitUrl: string | undefined;
      let accessoryUrl: string | undefined;
      if (outfitFile) {
        outfitUrl = (await uploadPhoto(outfitFile)) || undefined;
      } else if (outfitPreview && !outfitFile) {
        outfitUrl = outfitPreview;
      }
      if (accessoryFile) {
        accessoryUrl = (await uploadPhoto(accessoryFile)) || undefined;
      } else if (accessoryPreview && !accessoryFile) {
        accessoryUrl = accessoryPreview;
      }

      toast.info('Generating your character...');
      const avatarUrl = await generateCharacterAvatar(rawPhotoUrl, outfitUrl, accessoryUrl);
      if (avatarUrl) {
        setGeneratedAvatarUrl(avatarUrl);
        toast.success('Character generated!');
      } else {
        toast.error('Character generation failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Error generating character:', error);
      toast.error('Failed to generate character');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const hasFaceSource = !!photoFile || (mode === "edit" && !!rawPhotoPreview);
    if (hasFaceSource && !generatedAvatarUrl) {
      toast.error('Please generate your character first before saving.');
      return;
    }

    setIsLoading(true);
    try {
      let facePhotoUrl = rawPhotoPreview;
      let outfitPhotoUrl = outfitPreview;
      let accessoryPhotoUrl = accessoryPreview;

      if (photoFile) {
        facePhotoUrl = await uploadPhoto(photoFile);
      }
      if (outfitFile) {
        outfitPhotoUrl = await uploadPhoto(outfitFile);
      }
      if (accessoryFile) {
        accessoryPhotoUrl = await uploadPhoto(accessoryFile);
      }

      if (mode === "add") {
        const { error } = await supabase.from('dream_characters').insert({
          user_id: user.id,
          name: formName || null,
          photo_url: generatedAvatarUrl || null,
          face_photo_url: facePhotoUrl || null,
          outfit_photo_url: outfitPhotoUrl || null,
          accessory_photo_url: accessoryPhotoUrl || null,
          avatar_style: selectedStyle,
        });
        if (error) throw error;
        toast.success('Character created!');
      } else if (mode === "edit" && editingCharacterId) {
        const { error } = await supabase.from('dream_characters').update({
          name: formName || null,
          photo_url: generatedAvatarUrl || selectedCharacter?.photo_url || null,
          face_photo_url: facePhotoUrl || null,
          outfit_photo_url: outfitPhotoUrl || null,
          accessory_photo_url: accessoryPhotoUrl || null,
          avatar_style: selectedStyle,
          updated_at: new Date().toISOString(),
        }).eq('id', editingCharacterId);
        if (error) throw error;
        toast.success('Character updated!');
      }

      // Sync to ai_context for backward compatibility
      const photoToSync = generatedAvatarUrl || selectedCharacter?.photo_url;
      if (photoToSync) {
        await supabase.from('ai_context').upsert({
          user_id: user.id,
          name: formName || null,
          photo_url: photoToSync,
          outfit_photo_url: outfitPhotoUrl || null,
          accessory_photo_url: accessoryPhotoUrl || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        // Analyze for fingerprint
        try {
          toast.info('Analyzing for better likeness...');
          await supabase.functions.invoke('analyze-character-image', { body: { photoUrl: photoToSync } });
          toast.success('Photo analysis complete!');
        } catch (err) {
          console.error('Fingerprint analysis failed:', err);
        }
      }

      await fetchCharacters();
      setMode("view");
      resetFormState();
      // Select the last character if we added
      if (mode === "add") {
        setSelectedIndex(characters.length); // will be the new one
      }
    } catch (error: any) {
      console.error('Error saving character:', error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCharacter || !user) return;
    try {
      const { error } = await supabase.from('dream_characters').delete().eq('id', selectedCharacter.id);
      if (error) throw error;
      toast.success('Character deleted');
      await fetchCharacters();
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    } catch (error: any) {
      toast.error('Failed to delete character');
    }
  };

  const PhotoUploadSection = ({
    label, description, required, file, preview, onFileChange, onClear,
  }: {
    label: string; description: string; required?: boolean;
    file: File | null; preview: string | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
  }) => {
    const displayUrl = preview;
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/30 p-3">
        {displayUrl ? (
          <div className="relative flex-shrink-0">
            <img src={displayUrl} alt={label} className="w-20 h-20 object-cover rounded-lg border border-border" />
            <button type="button" onClick={onClear} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label className="flex-shrink-0 flex items-center justify-center w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-colors">
            <Upload className="h-5 w-5 text-muted-foreground/60" />
            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
          </label>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{label} {required && <span className="text-destructive">*</span>}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    );
  };

  const avatarDisplayInForm = generatedAvatarUrl;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-xl">
            <Button variant="ghost" size="icon" onClick={() => { if (mode !== "view") { handleCancelForm(); } else { onOpenChange(false); } }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-semibold text-foreground">
              {mode === "add" ? "New Character" : mode === "edit" ? "Edit Character" : "Dream Avatars"}
            </h1>
            <div className="w-10" />
          </div>

          <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
            <div className="px-6 py-6 space-y-5">

              {mode === "view" && (
                <>
                  {/* Carousel */}
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Your characters for dream image generation.</p>
                    <div
                      ref={carouselRef}
                      className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {characters.map((char, idx) => (
                        <button
                          key={char.id}
                          onClick={() => setSelectedIndex(idx)}
                          className="flex-shrink-0 flex flex-col items-center gap-1.5"
                        >
                          <div
                            className={cn(
                              "w-16 h-16 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center bg-muted",
                              selectedIndex === idx
                                ? "border-primary ring-2 ring-primary/30 scale-105"
                                : "border-border/50 hover:border-primary/30"
                            )}
                          >
                            {char.photo_url ? (
                              <img src={char.photo_url} alt={char.name || "Character"} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-muted-foreground text-xs">Empty</span>
                            )}
                          </div>
                          <span className={cn(
                            "text-[11px] leading-tight max-w-[80px] truncate",
                            selectedIndex === idx ? "text-primary font-semibold" : "text-muted-foreground"
                          )}>
                            {char.name || "Unnamed"}
                          </span>
                        </button>
                      ))}

                      {/* Add button */}
                      <button onClick={handleAddMode} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors">
                          <Plus className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <span className="text-[11px] text-muted-foreground">Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Selected character detail */}
                  {selectedCharacter && (
                    <div className="space-y-4">
                      {/* Large preview */}
                      <div className="flex justify-center">
                        <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                          {selectedCharacter.photo_url ? (
                            <img src={selectedCharacter.photo_url} alt={selectedCharacter.name || "Character"} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-muted-foreground text-sm">No avatar</span>
                          )}
                        </div>
                      </div>

                      <div className="text-center">
                        <h2 className="text-lg font-semibold">{selectedCharacter.name || "Unnamed Character"}</h2>
                        <p className="text-xs text-muted-foreground capitalize">{selectedCharacter.avatar_style?.replace('_', ' ') || "Digital Art"} style</p>
                      </div>

                      {/* Reference photos row */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reference Photos</p>
                        <div className="flex gap-3">
                          {[
                            { label: "Face", url: selectedCharacter.face_photo_url },
                            { label: "Outfit", url: selectedCharacter.outfit_photo_url },
                            { label: "Accessory", url: selectedCharacter.accessory_photo_url },
                          ].map(({ label, url }) => (
                            <div key={label} className="flex flex-col items-center gap-1">
                              <div className="w-16 h-16 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center">
                                {url ? (
                                  <img src={url} alt={label} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] text-muted-foreground">None</span>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={handleEditMode}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Avatar
                        </Button>
                        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDelete}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                </>
              )}

              {/* Add / Edit form */}
              {(mode === "add" || mode === "edit") && (
                <div className="space-y-5">
                  {/* Avatar Preview */}
                  <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-muted bg-muted flex items-center justify-center">
                      {isGenerating ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="text-xs text-muted-foreground">Generating...</span>
                        </div>
                      ) : avatarDisplayInForm ? (
                        <img src={avatarDisplayInForm} alt="Character Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-muted-foreground text-xs text-center px-2">Upload a face photo & generate</span>
                      )}
                    </div>
                  </div>

                  {/* Reference Photos */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reference Photos</p>
                    <PhotoUploadSection
                      label="Face"
                      description="Required — used for likeness"
                      required
                      file={photoFile}
                      preview={rawPhotoPreview}
                      onFileChange={(e) => handleFileUpload(e, setPhotoFile, setRawPhotoPreview)}
                      onClear={() => { setPhotoFile(null); setRawPhotoPreview(null); setGeneratedAvatarUrl(null); }}
                    />
                    <PhotoUploadSection
                      label="Outfit"
                      description="Optional — clothing reference"
                      file={outfitFile}
                      preview={outfitPreview}
                      onFileChange={(e) => handleFileUpload(e, setOutfitFile, setOutfitPreview)}
                      onClear={() => { setOutfitFile(null); setOutfitPreview(null); }}
                    />
                    <PhotoUploadSection
                      label="Accessory"
                      description="Optional — jewelry, glasses, etc."
                      file={accessoryFile}
                      preview={accessoryPreview}
                      onFileChange={(e) => handleFileUpload(e, setAccessoryFile, setAccessoryPreview)}
                      onClear={() => { setAccessoryFile(null); setAccessoryPreview(null); }}
                    />

                    {/* Generate Button */}
                    {(rawPhotoPreview || photoFile) && (
                      <Button
                        onClick={handleGenerateCharacter}
                        disabled={isGenerating}
                        variant="luminous"
                        size="sm"
                        className="w-full text-secondary-foreground"
                      >
                        {isGenerating ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                        ) : (
                          <><Sparkles className="mr-2 h-4 w-4" />{generatedAvatarUrl ? 'Regenerate Character' : 'Generate Character'}</>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Style Selector */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avatar Style</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {avatarStyleOptions.map((style) => (
                        <button key={style.value} onClick={() => setSelectedStyle(style.value)} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                          <div className={cn(
                            "w-[72px] h-[72px] rounded-xl border-2 transition-all overflow-hidden",
                            selectedStyle === style.value ? "border-primary ring-2 ring-primary/20" : "border-border/50 hover:border-primary/30"
                          )}>
                            <img src={style.thumb} alt={style.label} className="w-full h-full object-cover" />
                          </div>
                          <span className={cn("text-[10px] leading-tight", selectedStyle === style.value ? "text-primary font-semibold" : "text-muted-foreground")}>
                            {style.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <Label htmlFor="charName">Character Name</Label>
                    <Input
                      id="charName"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Dream Self, Hero, etc."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-2 pb-24">
                    <Button variant="outline" onClick={handleCancelForm} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading || isGenerating}>
                      {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : mode === "add" ? "Save Character" : "Update Character"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIContextDialog;
