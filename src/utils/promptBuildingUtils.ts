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

CHARACTER IDENTITY MATCHING (HIGHEST PRIORITY — OVERRIDE ALL DEFAULTS):
- FACE: Exact same facial structure, eye shape, nose, lips, jawline, brow ridge as reference photo
- SKIN: Precise tone, texture, markings, subsurface scattering matching reference exactly
- HAIR: Exact color, texture, style, length, parting as reference
- BODY: Same build, proportions, posture as reference

VISUAL FINGERPRINT OF THE DREAMER:
${aiContext.visual_fingerprint}

${aiContext.clothing_style ? `CLOTHING: The character wears ${aiContext.clothing_style} style clothing, adapted to the dream world's aesthetic.` : ''}

UNIFIED WORLD RENDERING (MANDATORY — NO EXCEPTIONS):
The character is NOT a visitor to this scene — they are a NATIVE INHABITANT born from the same dream physics as the environment.

INTEGRATION LAWS:
1. ENVIRONMENT FIRST: Mentally construct the complete 3D dream environment with all its light sources, atmosphere, and physics
2. CHARACTER PLACEMENT: Place the character at their marked position WITHIN this pre-built 3D space
3. UNIFIED PASS: Render the entire frame — character AND environment — in one single generative pass. NEVER composite separately.

PHYSICS CONTRACT:
- Light: Character is illuminated by the IDENTICAL light sources as the surrounding environment (same direction, same color temperature, same intensity falloff)
- Shadow: Character casts contact shadows on surfaces. Environment elements cast shadows ON the character. All shadows point the same direction.
- Atmosphere: Fog, haze, particles, rain, smoke, magical energy — these volumetric effects pass THROUGH and AROUND the character identically to how they affect the environment
- Perspective: Character sits at the correct atmospheric depth — same aerial haze, same focus falloff as objects at equivalent distance
- Ground contact: Feet press into surfaces naturally. Correct displacement, weight, and shadow underfoot.

ANTI-COMPOSITE CHECKLIST (scan for these failure modes and AVOID them):
✗ Cut-out or halo edges around the character
✗ Character lit from different direction than the environment  
✗ Character color temperature doesn't match scene (e.g., warm character in cool moonlit scene)
✗ Character appears "floating" without ground contact shadow
✗ Sharp character detail against soft/blurry environment at same depth
✗ Character looks photographed separately and placed into scene`;
  }

  if (hasPhoto) {
    return `${basePrompt}.

CHARACTER IDENTITY REFERENCE: The provided reference image shows the DREAMER — the protagonist and central character of this scene. Replicate their exact facial features, hair, skin tone, and body proportions precisely.${aiContext.clothing_style ? ` They wear ${aiContext.clothing_style} style clothing adapted to the dream world.` : ''}

UNIFIED WORLD RENDERING: Render the character as a native inhabitant of this dream environment. Same lighting, same atmospheric effects, same physics — one unified composition, never composited.`;
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
