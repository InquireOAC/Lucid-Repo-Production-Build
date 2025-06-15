import { dreamContainsCharacters } from "./characterDetectionUtils";

/**
 * Build personalized prompt based on user's AI context and selected style
 */
export const buildPersonalizedPrompt = (basePrompt: string, aiContext: any, imageStyle?: string): string => {
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

  return addImageStyleToPrompt(personalizedPrompt, imageStyle);
};

/**
 * Clean prompt for non-personalized generation while preserving natural characters
 */
export const cleanPromptForNonPersonalized = (prompt: string, dreamContent: string, imageStyle?: string): string => {
  const hasCharacters = dreamContainsCharacters(dreamContent);
  
  let cleanedPrompt = prompt;
  
  if (!hasCharacters) {
    // Only remove character references if the dream doesn't naturally contain them
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

    // Add emphasis on environment focus when no characters are present
    cleanedPrompt += '. Focus on the environment and scenery without any people or characters in the image';
  } else {
    // If dream has characters, just replace personal pronouns but keep character references
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
    return `${prompt}. Render in ${styleDescription} artistic style`;
  } else if (!imageStyle || imageStyle === 'surreal') {
    return `${prompt}. Render in surreal artistic style`;
  }
  
  return prompt;
};
