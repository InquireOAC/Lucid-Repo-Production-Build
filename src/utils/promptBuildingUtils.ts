import { dreamContainsCharacters } from "./characterDetectionUtils";

/**
 * Build personalized prompt based on user's AI context and selected style
 */
export const buildPersonalizedPrompt = (basePrompt: string, aiContext: any, imageStyle?: string): string => {
  let personalizedPrompt = basePrompt;

  if (aiContext) {
    const appearanceDetails = [];

    if (aiContext.clothing_style) {
      appearanceDetails.push(`wearing ${aiContext.clothing_style} style clothing`);
    }

    // If user has a reference photo, inject explicit character-compositing instructions
    if (aiContext.photo_url) {
      personalizedPrompt = `${basePrompt}. The reference image provided shows the main character of this dream — compose this character naturally as the dreamer and protagonist of the scene, maintaining their exact appearance and likeness`;
    } else if (appearanceDetails.length > 0) {
      const personDescription = `featuring a person with ${appearanceDetails.join(', ')}`;
      personalizedPrompt = `${basePrompt}. ${personDescription}`;
    }
  }

  return addImageStyleToPrompt(personalizedPrompt, imageStyle);
};

/**
 * Clean prompt for non-personalized generation while preserving natural characters
 */
export const cleanPromptForNonPersonalized = (prompt: string, dreamContent: string, imageStyle?: string): string => {
  const hasCharacters = dreamContainsCharacters(dreamContent);
  
  let cleanedPrompt = prompt;
  
  if (!hasCharacters) {
    cleanedPrompt = prompt
      .replace(/\bi\s+am\s+/gi, 'the scene shows ')
      .replace(/\bi\s+see\s+/gi, 'there are ')
      .replace(/\bmy\s+/gi, 'the ')
      .replace(/\bme\s+/gi, 'the environment ')
      .replace(/\bmyself\s+/gi, 'the scene ')
      .replace(/\bwith\s+me\b/gi, 'in the scene')
      .replace(/\bbeside\s+me\b/gi, 'in the scene')
      .replace(/\bnear\s+me\b/gi, 'in the area')
      .replace(/\baround\s+me\b/gi, 'throughout the scene');

    cleanedPrompt += '. Focus on the environment and scenery without any people or characters in the image';
  } else {
    cleanedPrompt = prompt
      .replace(/\bi\s+am\s+/gi, 'there is ')
      .replace(/\bi\s+see\s+/gi, 'the scene shows ')
      .replace(/\bmy\s+/gi, 'the ')
      .replace(/\bme\s+/gi, 'a person ')
      .replace(/\bmyself\s+/gi, 'a person ');
  }

  return addImageStyleToPrompt(cleanedPrompt, imageStyle);
};

/**
 * Add selected image style to the prompt
 */
const addImageStyleToPrompt = (prompt: string, imageStyle?: string): string => {
  if (imageStyle === 'realistic') {
    return `${prompt}. Render as a photorealistic photograph: ultra high resolution, shot on DSLR camera, 8K detail, natural cinematic lighting, sharp focus, no painterly or artistic effects, hyperrealistic`;
  }
  
  if (imageStyle === 'hyper_realism') {
    return `${prompt}. Render as an extreme hyperrealistic photograph: 8K ultra-high resolution, shot on a professional DSLR with 85mm prime lens, perfect exposure, razor-sharp detail, photographic realism indistinguishable from a real photograph, studio-quality natural lighting`;
  }

  if (imageStyle && imageStyle !== 'surreal') {
    const styleMap: { [key: string]: string } = {
      abstract: 'abstract art with bold shapes and non-representational forms',
      impressionist: 'impressionist painting with visible brushstrokes and soft light',
      fantasy: 'epic fantasy art with rich detail and magical atmosphere',
      minimalist: 'minimalist design with clean lines and limited palette',
      vintage: 'vintage photography with film grain and muted tones',
      cyberpunk: 'cyberpunk digital art with neon lights and futuristic dystopia',
      watercolor: 'delicate watercolor painting with transparent washes',
      oil_painting: 'classical oil painting with rich impasto texture',
      digital_art: 'polished digital art with vibrant colors',
      sketch: 'detailed pencil sketch with expressive linework',
    };
    
    const styleDescription = styleMap[imageStyle] || imageStyle;
    return `${prompt}. Render in ${styleDescription} style`;
  }
  
  // Default: surreal
  return `${prompt}. Render in surreal dreamlike artistic style with vivid colors and fantastical atmosphere`;
};
