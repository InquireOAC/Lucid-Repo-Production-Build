
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Sparkles } from "lucide-react";
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
{ value: "oil_painting", label: "Oil Painting", thumb: styleOilPainting }];


interface AIContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AIContextData {
  name?: string;
  photo_url?: string;
  clothing_style?: string;
}

const AIContextDialog = ({
  open,
  onOpenChange
}: AIContextDialogProps) => {
  const { user } = useAuth();
  const [contextData, setContextData] = useState<AIContextData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [rawPhotoPreview, setRawPhotoPreview] = useState<string | null>(null);
  const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("digital_art");

  useEffect(() => {
    if (open && user) {
      loadAIContext();
    }
  }, [open, user]);

  const loadAIContext = async () => {
    try {
      const { data, error } = await supabase.
      from('ai_context').
      select('*').
      eq('user_id', user?.id).
      maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading AI context:', error);
        return;
      }

      if (data) {
        setContextData({
          name: data.name,
          photo_url: data.photo_url,
          clothing_style: data.clothing_style
        });
        setPhotoPreview(data.photo_url || null);
      }
    } catch (error) {
      console.error('Error loading AI context:', error);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be smaller than 5MB');
        return;
      }
      setPhotoFile(file);
      setRawPhotoPreview(URL.createObjectURL(file));
      setGeneratedAvatarUrl(null);
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `ai-context-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage.
      from('dream-images').
      upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.
      from('dream-images').
      getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const getAvatarStylePrompt = (style: string): string => {
    const avatarPrompts: Record<string, string> = {
      realistic: `Generate an ultra-realistic, photographic portrait of the person in this reference photo. This must look like a real DSLR photograph — not a painting, illustration, or digital art. Use natural studio lighting, shallow depth of field, accurate skin texture with pores and subtle imperfections, realistic hair strands, and true-to-life eye reflections. The background should be a simple, softly blurred studio backdrop. Capture their exact likeness, facial structure, skin tone, and features. 8K resolution, professional headshot quality.`,
      hyper_realism: `Generate an extreme hyperrealistic portrait of the person in this reference photo, indistinguishable from a professional DSLR photograph. 85mm f/1.4 prime lens, individual pores visible, subsurface scattering showing blood flow beneath skin, iris fiber detail, wet cornea reflections, studio-quality motivated lighting, cinema-grade color science, subtle film grain. Capture their exact likeness perfectly.`,
      digital_art: `Create a AAA concept-art quality portrait of the person in this reference photo. Polished, professional, ArtStation-trending caliber. Clean vector-sharp edges, volumetric rim lighting with subsurface scattering on skin, vibrant saturated colors. Capture their exact likeness and facial features in a cinematic digital art style suitable for a profile avatar.`,
      surreal: `Create a surreal dreamscape portrait of the person in this reference photo in a Salvador Dalí meets Magritte style. Melting forms, impossible geometry around them, hyper-detailed textures, chromatic otherworldly lighting with bioluminescent glows. Capture their exact likeness within a fantastical, vivid atmosphere with deep perspective.`,
      fantasy: `Create an epic fantasy portrait of the person in this reference photo. Rich painterly detail, golden-hour rim lighting with dramatic volumetric god-rays. Ornate details, magical particle effects (floating embers, ethereal wisps). Jewel-tone palette (deep emeralds, royal purples, burnished golds). Capture their exact likeness as a fantasy character.`,
      cyberpunk: `Create a cyberpunk portrait of the person in this reference photo. Neon-drenched Blade Runner aesthetic: holographic HUD overlays, rain-slick reflections, volumetric fog with pink/cyan neon scatter. Materials: brushed chrome accents, glowing circuit traces. Deep contrast with pitch-black shadows and intense neon highlights. Capture their exact likeness.`,
      watercolor: `Create a traditional watercolor portrait of the person in this reference photo on cold-press paper. Visible paper grain, pigment granulation, wet-on-wet bleeding edges where colors organically merge. Transparent layered glazes, unpainted white paper highlights for the brightest areas. Delicate flowing edges. Capture their exact likeness and features.`,
      sketch: `Create a professional graphite sketch portrait of the person in this reference photo. Varied pencil pressure (2H to 6B), cross-hatching for shadow depth, visible paper tooth texture. Smudged soft gradients in shadow areas, raw construction lines left visible for authenticity. High contrast between white highlights and deep graphite blacks. Capture their exact likeness.`,
      oil_painting: `Create a museum-quality oil painting portrait of the person in this reference photo. Thick impasto brushstrokes, visible canvas weave, Rembrandt-style chiaroscuro with dramatic single-source lighting. Glazed luminous skin tones, visible palette knife marks, rich saturated pigments. Classical golden-ratio composition. Capture their exact likeness.`,
      impressionist: `Create a Monet/Renoir-style impressionist portrait of the person in this reference photo. Broken color dabs with visible confident brushstrokes, en plein air golden-hour glow. Chromatic shadows in purple and blue hues — never black. Thick impasto texture, diffused soft edges, shimmering luminous atmosphere. Capture their likeness through impressionist technique.`,
      abstract: `Create a bold abstract portrait of the person in this reference photo. Kandinsky/Rothko influence: saturated color fields, geometric and organic forms, strong compositional tension. Textured mixed-media feel with layered paint and expressive energy. Capture recognizable elements of their likeness through abstract interpretation.`,
      minimalist: `Create a Japanese-inspired minimalist portrait of the person in this reference photo. Vast intentional negative space, strictly 2-3 colors maximum. Single focal element with clean geometric forms and zen-like tranquility. Every element must justify its presence. Capture their essential likeness with absolute economy of detail.`,
      vintage: `Create a 1970s analog film portrait of the person in this reference photo. Kodak Portra 400 color science, visible film grain, slight warm amber light leaks from frame edges. Muted desaturated tones with lifted blacks, soft vignette, period-accurate soft focus falloff and warm flare. Capture their exact likeness in vintage aesthetic.`,
    };
    return avatarPrompts[style] || avatarPrompts.digital_art;
  };

  const generateCharacterAvatar = async (rawPhotoUrl: string): Promise<string | null> => {
    try {
      const prompt = getAvatarStylePrompt(selectedStyle);

      const result = await supabase.functions.invoke("generate-dream-image", {
        body: { prompt, referenceImageUrl: rawPhotoUrl, imageStyle: selectedStyle }
      });

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
    if (!photoFile || !user) return;

    setIsGenerating(true);
    try {
      const rawPhotoUrl = await uploadPhoto(photoFile);
      if (!rawPhotoUrl) {
        toast.error('Failed to upload photo');
        return;
      }

      toast.info('Generating your character...');
      const avatarUrl = await generateCharacterAvatar(rawPhotoUrl);

      if (avatarUrl) {
        setGeneratedAvatarUrl(avatarUrl);
        setPhotoPreview(avatarUrl);
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

    if (photoFile && !generatedAvatarUrl) {
      toast.error('Please generate your character first before saving.');
      return;
    }

    setIsLoading(true);
    try {
      const photoUrl = generatedAvatarUrl || contextData.photo_url;

      const dataToSave = {
        name: contextData.name || null,
        photo_url: photoUrl || null,
        clothing_style: contextData.clothing_style || null,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.
      from('ai_context').
      upsert(dataToSave, { onConflict: 'user_id' });

      if (error) throw error;

      setContextData((prev) => ({ ...prev, photo_url: photoUrl }));
      setPhotoPreview(photoUrl || null);
      setPhotoFile(null);
      setRawPhotoPreview(null);
      setGeneratedAvatarUrl(null);
      toast.success('Dream Avatar saved successfully!');

      // Trigger visual fingerprint analysis if we have a photo
      if (photoUrl) {
        try {
          toast.info('Analyzing your photo for better likeness...');
          await supabase.functions.invoke('analyze-character-image', {
            body: { photoUrl }
          });
          toast.success('Photo analysis complete! Your dream images will now have better likeness.');
        } catch (fingerprintError) {
          console.error('Fingerprint analysis failed (non-blocking):', fingerprintError);
          // Non-blocking — avatar is already saved
        }
      }
    } catch (error: any) {
      console.error('Error saving Dream Avatar:', error);
      toast.error(`Failed to save Dream Avatar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const avatarDisplay = generatedAvatarUrl || photoPreview;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Your Dream Avatar</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload a reference photo so AI can generate dream images that look like you.
          </p>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto overflow-x-hidden flex-1 min-h-0 pr-1">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-muted bg-muted flex items-center justify-center">
              {isGenerating ?
              <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Generating...</span>
                </div> :
              avatarDisplay ?
              <img
                src={avatarDisplay}
                alt="Dream Avatar"
                className="w-full h-full object-cover" /> :


              <span className="text-muted-foreground text-xs text-center px-2">No avatar yet</span>
              }
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <Label>Reference Photo</Label>
            <div className="mt-2">
              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors">
                <div className="flex flex-col items-center">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {photoFile ? photoFile.name : 'Upload photo (max 5MB)'}
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload} />

              </label>
            </div>
            {rawPhotoPreview &&
            <div className="mt-3 flex items-center gap-3">
                <img
                src={rawPhotoPreview}
                alt="Reference photo"
                className="w-24 h-24 object-cover rounded-lg border border-muted" />

                <Button
                onClick={handleGenerateCharacter}
                disabled={isGenerating}
                variant="luminous"
                size="sm" className="text-secondary-foreground">

                  {isGenerating ?
                <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </> :

                <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {generatedAvatarUrl ? 'Regenerate' : 'Generate Character'}
                    </>
                }
                </Button>
              </div>
            }
          </div>

          {/* Visual Style Selector */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avatar Style</p>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              {avatarStyleOptions.map((style) =>
              <button
                key={style.value}
                onClick={() => setSelectedStyle(style.value)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5">

                  <div
                  className={cn(
                    "w-[72px] h-[72px] rounded-xl border-2 transition-all overflow-hidden",
                    selectedStyle === style.value ?
                    "border-primary ring-2 ring-primary/20" :
                    "border-border/50 hover:border-primary/30"
                  )}>

                    <img src={style.thumb} alt={style.label} className="w-full h-full object-cover" />
                  </div>
                  <span className={cn(
                  "text-[10px] leading-tight",
                  selectedStyle === style.value ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                    {style.label}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Name or Nickname</Label>
            <Input
              id="name"
              value={contextData.name || ''}
              onChange={(e) => setContextData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="How you'd like to be referred to" />

          </div>

          {/* Clothing Style */}
          <div>
            <Label htmlFor="clothing_style">Clothing Style</Label>
            <Input
              id="clothing_style"
              value={contextData.clothing_style || ''}
              onChange={(e) => setContextData((prev) => ({ ...prev, clothing_style: e.target.value }))}
              placeholder="e.g., casual, alternative, streetwear" />

          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || isGenerating}>
              {isLoading ?
              <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </> :
              'Save Avatar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

};

export default AIContextDialog;