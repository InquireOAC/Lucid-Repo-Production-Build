import { dreamContainsCharacters } from "./characterDetectionUtils";

/**
 * Append character identity signal to a compiled cinematic scene prompt.
 * Identity only — composition / lighting / world rules come from the cinematic
 * compiler upstream, so we deliberately do NOT restate them here.
 */
export const buildPersonalizedPrompt = (basePrompt: string, aiContext: any, _imageStyle?: string): string => {
  if (!aiContext) return basePrompt;

  const hasFingerprint = !!aiContext.visual_fingerprint;
  const hasPhoto = !!aiContext.photo_url;
  const clothing = aiContext.clothing_style ? `Wearing ${aiContext.clothing_style} style clothing adapted to this dream world.` : null;

  if (hasPhoto && hasFingerprint) {
    return [
      basePrompt,
      'Character identity: match the supplied reference image exactly — facial structure, eye shape, nose, lips, jawline, skin tone and texture, hair color and style, build and proportions.',
      `Visual fingerprint of the dreamer: ${aiContext.visual_fingerprint}`,
      clothing,
      'Render the character as a native inhabitant of this scene with the same lighting, shadows and atmosphere as the environment.',
    ].filter(Boolean).join(' ');
  }

  if (hasPhoto) {
    return [
      basePrompt,
      'Character identity: match the supplied reference image exactly — face, hair, skin and body proportions.',
      clothing,
      'Render the character as a native inhabitant of this scene with the same lighting and atmosphere as the environment.',
    ].filter(Boolean).join(' ');
  }

  if (aiContext.clothing_style) {
    return `${basePrompt} ${clothing}`;
  }

  return basePrompt;
};

/**
 * Clean prompt for non-personalized generation while preserving natural characters.
 * Style composition is handled by the cinematic director, so no style appending here.
 */
export const cleanPromptForNonPersonalized = (prompt: string, dreamContent: string, _imageStyle?: string): string => {
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
