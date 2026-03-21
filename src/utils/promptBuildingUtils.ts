import { dreamContainsCharacters } from "./characterDetectionUtils";

/**
 * Build personalized prompt with visual fingerprint + character integration directives.
 * Style composition is now handled by the cinematic director thinking layer,
 * so this function only handles character identity and integration.
 */
export const buildPersonalizedPrompt = (basePrompt: string, aiContext: any, imageStyle?: string): string => {
  if (!aiContext) return basePrompt;

  const hasFingerprint = !!aiContext.visual_fingerprint;
  const hasPhoto = !!aiContext.photo_url;

  if (hasPhoto && hasFingerprint) {
    return `${basePrompt}.

CHARACTER IDENTITY MATCHING (HIGHEST PRIORITY):
- FACE: Exact same facial structure, eye shape, nose, lips, jawline as reference
- SKIN: Precise tone and texture matching reference exactly
- HAIR: Exact color, texture, style, length as reference
- BODY: Same build and proportions as reference

VISUAL FINGERPRINT OF THE DREAMER:
${aiContext.visual_fingerprint}

${aiContext.clothing_style ? `CLOTHING: The character wears ${aiContext.clothing_style} style clothing, adapted to the dream world's aesthetic.` : ''}

HERO COMPOSITION (MANDATORY):
The character is the STAR of this frame — the emotional center of a grand cinematic tableau.
- Place them at a compositionally POWERFUL position: rule of thirds power points, golden ratio, or dramatic center
- The environment must FRAME them: leading lines, architectural convergence, light shafts, all drawing the eye to their presence
- Scale contrast: they should feel both intimately human and significant against vast, awe-inspiring surroundings
- Their pose and body language must tell the story of THIS moment — heroic, contemplative, awestruck, or intimate

WORLD INTEGRATION:
The character is a NATIVE INHABITANT of this dream world. Same lighting, same atmosphere, same physics. They cast real shadows, are wrapped in the same volumetric effects, and exist at the correct atmospheric depth. One unified composition — never composited.`;
  }

  if (hasPhoto) {
    return `${basePrompt}.

CHARACTER IDENTITY REFERENCE: The provided reference image shows the DREAMER — the STAR and protagonist of this cinematic frame. Replicate their exact facial features, hair, skin tone, and body proportions precisely.${aiContext.clothing_style ? ` They wear ${aiContext.clothing_style} style clothing adapted to the dream world.` : ''}

HERO COMPOSITION: Compose them as the emotional anchor of a grand tableau — at a position of maximum visual power, framed by the environment's leading lines and light. The world exists to stage their moment.

WORLD INTEGRATION: Render as a native inhabitant of this dream world. Same spectacular lighting, same atmospheric effects, same physics — one unified composition, never composited.`;
  }

  if (aiContext.clothing_style) {
    return `${basePrompt}. Featuring a person wearing ${aiContext.clothing_style} style clothing, rendered as a unified part of the scene environment.`;
  }

  return basePrompt;
};

/**
 * Clean prompt for non-personalized generation while preserving natural characters.
 * Style composition is handled by the cinematic director, so no style appending here.
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

  return cleanedPrompt;
};
