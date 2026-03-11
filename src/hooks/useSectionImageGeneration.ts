import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DreamEntry } from "@/types/dream";
import { toast } from "sonner";
import { getUserAIContext } from "@/utils/aiContextUtils";

interface SectionImage {
  section: number;
  text: string;
  image_url?: string;
  prompt?: string;
}

interface CharacterData {
  referenceImageUrl?: string;
  outfitImageUrl?: string;
  accessoryImageUrl?: string;
}

export function useSectionImageGeneration(
  dream: DreamEntry,
  onUpdate: (updates: Partial<DreamEntry>) => void
) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSections, setTotalSections] = useState(0);

  const generateSectionImages = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(0);

    try {
      // Fetch character/avatar data for the dream owner
      let characterData: CharacterData = {};
      try {
        const aiContext = await getUserAIContext(dream.user_id);
        if (aiContext) {
          characterData = {
            referenceImageUrl: aiContext.photo_url || undefined,
            outfitImageUrl: aiContext.outfit_photo_url || undefined,
            accessoryImageUrl: aiContext.accessory_photo_url || undefined,
          };
        }
      } catch (err) {
        console.warn("Could not fetch AI context for section images:", err);
      }

      // Step 1: Split dream into sections
      const { data: splitData, error: splitError } = await supabase.functions.invoke(
        "split-dream-sections",
        { body: { content: dream.content } }
      );

      if (splitError || !splitData?.sections) {
        throw new Error(splitError?.message || "Failed to split dream into sections");
      }

      const sections: Array<{ section: number; text: string }> = splitData.sections;
      setTotalSections(sections.length);

      toast.info(`Splitting into ${sections.length} scenes. Generating images...`);

      // Step 2: For each section, generate a cinematic prompt then an image
      const sectionImages: SectionImage[] = [];

      for (let i = 0; i < sections.length; i++) {
        setProgress(i + 1);
        const sec = sections[i];

        try {
          // Generate cinematic prompt
          const { data: promptData, error: promptError } = await supabase.functions.invoke(
            "compose-cinematic-prompt",
            { body: { sceneBrief: `Dream Title: ${dream.title}\n\nScene: ${sec.text}` } }
          );

          if (promptError || !promptData?.cinematicPrompt) {
            console.error("Prompt generation failed for section", i + 1);
            sectionImages.push({ section: sec.section, text: sec.text });
            continue;
          }

          // Generate image — pass character data if available
          const { data: imgData, error: imgError } = await supabase.functions.invoke(
            "generate-dream-image",
            {
              body: {
                prompt: promptData.cinematicPrompt,
                dreamContent: sec.text,
                dreamId: dream.id,
                ...(characterData.referenceImageUrl && { referenceImageUrl: characterData.referenceImageUrl }),
                ...(characterData.outfitImageUrl && { outfitImageUrl: characterData.outfitImageUrl }),
                ...(characterData.accessoryImageUrl && { accessoryImageUrl: characterData.accessoryImageUrl }),
              },
            }
          );

          if (imgError || !imgData?.imageUrl) {
            console.error("Image generation failed for section", i + 1);
            sectionImages.push({
              section: sec.section,
              text: sec.text,
              prompt: promptData.cinematicPrompt,
            });
            continue;
          }

          sectionImages.push({
            section: sec.section,
            text: sec.text,
            image_url: imgData.imageUrl,
            prompt: promptData.cinematicPrompt,
          });
        } catch (err) {
          console.error(`Error generating section ${i + 1}:`, err);
          sectionImages.push({ section: sec.section, text: sec.text });
        }
      }

      // Step 3: Save to database
      const { error: updateError } = await supabase
        .from("dream_entries")
        .update({ section_images: sectionImages as any })
        .eq("id", dream.id);

      if (updateError) {
        throw new Error("Failed to save section images");
      }

      // Update local state
      onUpdate({ ...dream, section_images: sectionImages } as any);

      const successCount = sectionImages.filter(s => s.image_url).length;
      toast.success(`Generated ${successCount}/${sections.length} story images!`);
    } catch (error) {
      console.error("Section image generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate story images");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    progress,
    totalSections,
    generateSectionImages,
  };
}
