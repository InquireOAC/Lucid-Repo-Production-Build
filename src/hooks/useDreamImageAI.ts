
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDreamImageAI() {
  /**
   * Get user's AI context for personalized image generation
   */
  const getUserAIContext = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_context')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching AI context:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching AI context:', error);
      return null;
    }
  }, []);

  /**
   * Build personalized prompt based on user's AI context and selected style
   */
  const buildPersonalizedPrompt = useCallback((basePrompt: string, aiContext: any, imageStyle?: string) => {
    let personalizedPrompt = basePrompt;

    if (aiContext) {
      // Add appearance details if available
      const appearanceDetails = [];
      
      if (aiContext.hair_color) {
        appearanceDetails.push(`${aiContext.hair_color} hair`);
      }
      
      if (aiContext.hair_style) {
        appearanceDetails.push(`${aiContext.hair_style} hairstyle`);
      }
      
      if (aiContext.skin_tone) {
        appearanceDetails.push(`${aiContext.skin_tone} skin tone`);
      }
      
      if (aiContext.eye_color) {
        appearanceDetails.push(`${aiContext.eye_color} eyes`);
      }
      
      if (aiContext.height) {
        appearanceDetails.push(`${aiContext.height} build`);
      }

      if (aiContext.clothing_style) {
        appearanceDetails.push(`wearing ${aiContext.clothing_style} style clothing`);
      }

      // Add person description if we have appearance details
      if (appearanceDetails.length > 0) {
        const personDescription = `featuring a person with ${appearanceDetails.join(', ')}`;
        personalizedPrompt = `${basePrompt}. ${personDescription}`;
      }

      // Add age context if available
      if (aiContext.age_range) {
        const ageContext = aiContext.age_range === 'child' ? 'young child' :
                           aiContext.age_range === 'teen' ? 'teenager' :
                           aiContext.age_range === 'young_adult' ? 'young adult' :
                           aiContext.age_range === 'adult' ? 'adult' :
                           aiContext.age_range === 'middle_aged' ? 'middle-aged person' :
                           aiContext.age_range === 'elder' ? 'elderly person' : '';
        
        if (ageContext) {
          personalizedPrompt = personalizedPrompt.replace('person', ageContext);
        }
      }
    }

    // Add selected image style to the prompt
    if (imageStyle && imageStyle !== 'surreal') {
      const styleMap: { [key: string]: string } = {
        realistic: 'photorealistic',
        abstract: 'abstract art',
        impressionist: 'impressionist painting',
        fantasy: 'fantasy art',
        minimalist: 'minimalist',
        vintage: 'vintage photography',
        cyberpunk: 'cyberpunk',
        watercolor: 'watercolor painting',
        oil_painting: 'oil painting',
        digital_art: 'digital art',
        sketch: 'pencil sketch',
      };
      
      const styleDescription = styleMap[imageStyle] || imageStyle;
      personalizedPrompt += `. Render in ${styleDescription} artistic style`;
    } else if (!imageStyle || imageStyle === 'surreal') {
      personalizedPrompt += '. Render in surreal artistic style';
    }

    return personalizedPrompt;
  }, []);

  /**
   * Remove character references from prompt when AI context is disabled
   */
  const removeCharacterFromPrompt = useCallback((prompt: string, imageStyle?: string) => {
    // Remove common character-related phrases and replace with environment focus
    let cleanedPrompt = prompt
      .replace(/\bi\s+am\s+/gi, 'the scene shows ')
      .replace(/\bi\s+see\s+/gi, 'there are ')
      .replace(/\bmy\s+/gi, 'the ')
      .replace(/\bme\s+/gi, 'the environment ')
      .replace(/\bmyself\s+/gi, 'the scene ')
      .replace(/\bwith\s+me\b/gi, 'in the scene')
      .replace(/\bbeside\s+me\b/gi, 'in the scene')
      .replace(/\bnear\s+me\b/gi, 'in the area')
      .replace(/\baround\s+me\b/gi, 'throughout the scene');

    // Add emphasis on no people/characters
    cleanedPrompt += '. Focus on the environment and scenery without any people or characters in the image';

    // Add selected image style to the prompt
    if (imageStyle && imageStyle !== 'surreal') {
      const styleMap: { [key: string]: string } = {
        realistic: 'photorealistic',
        abstract: 'abstract art',
        impressionist: 'impressionist painting',
        fantasy: 'fantasy art',
        minimalist: 'minimalist',
        vintage: 'vintage photography',
        cyberpunk: 'cyberpunk',
        watercolor: 'watercolor painting',
        oil_painting: 'oil painting',
        digital_art: 'digital art',
        sketch: 'pencil sketch',
      };
      
      const styleDescription = styleMap[imageStyle] || imageStyle;
      cleanedPrompt += `. Render in ${styleDescription} artistic style`;
    } else {
      cleanedPrompt += '. Render in surreal artistic style';
    }

    return cleanedPrompt;
  }, []);

  /**
   * Analyze dream content and get an image prompt with optional AI context and style
   */
  const getImagePrompt = useCallback(async (dreamContent: string, userId?: string, useAIContext: boolean = true, imageStyle?: string) => {
    // First get the base prompt from the analyze-dream function
    const result = await supabase.functions.invoke("analyze-dream", {
      body: { dreamContent, task: "create_image_prompt" },
    });
    
    if (result.error) {
      throw new Error(result.error.message || "Failed to generate image prompt");
    }

    const basePrompt = result.data?.analysis || "";

    // If useAIContext is false, remove character references from the prompt
    if (!useAIContext) {
      return removeCharacterFromPrompt(basePrompt, imageStyle);
    }

    // If we have a user ID and should use AI context, try to get their AI context and personalize the prompt
    if (userId && useAIContext) {
      const aiContext = await getUserAIContext(userId);
      return buildPersonalizedPrompt(basePrompt, aiContext, imageStyle);
    }

    // If no AI context, just add style to base prompt
    return buildPersonalizedPrompt(basePrompt, null, imageStyle);
  }, [getUserAIContext, buildPersonalizedPrompt, removeCharacterFromPrompt]);

  /**
   * Generate a dream image from prompt via edge function
   */
  const generateDreamImageFromAI = useCallback(async (prompt: string) => {
    const body = { prompt };
    const result = await supabase.functions.invoke("generate-dream-image", { body });
    if (result.error || !result.data) {
      throw new Error(result.error?.message || "Failed to generate image");
    }
    return (
      result.data?.imageUrl ||
      result.data?.image_url ||
      result.data?.generatedImage ||
      ""
    );
  }, []);

  return { getImagePrompt, generateDreamImageFromAI, getUserAIContext, buildPersonalizedPrompt };
}
