import { dreamContainsCharacters } from "./characterDetectionUtils";

/**
 * Build personalized prompt with visual fingerprint + cinematic integration
 */
export const buildPersonalizedPrompt = (basePrompt: string, aiContext: any, imageStyle?: string): string => {
  let personalizedPrompt = basePrompt;

  if (aiContext) {
    const hasFingerprint = !!aiContext.visual_fingerprint;
    const hasPhoto = !!aiContext.photo_url;

    if (hasPhoto && hasFingerprint) {
      // Full cinematic integration with visual fingerprint
      personalizedPrompt = `${basePrompt}.

CHARACTER IDENTITY MATCHING (HIGHEST PRIORITY):
- FACE: Exact same facial structure, eye shape, nose, lips, jawline as reference
- SKIN: Precise tone, texture, markings matching reference exactly
- HAIR: Exact color, texture, style, length as reference
- BODY: Same build, proportions as reference

VISUAL FINGERPRINT OF THE DREAMER:
${aiContext.visual_fingerprint}

${aiContext.clothing_style ? `CLOTHING: The character wears ${aiContext.clothing_style} style clothing.` : ''}

CHARACTER-ENVIRONMENT INTEGRATION (MANDATORY):
1. FIRST: Generate the complete dream environment as a full 3D space with depth, atmosphere, and lighting
2. THEN: Place the camera within this space at the appropriate angle
3. FINALLY: Render the character STANDING INSIDE this 3D space — NOT pasted on top

INTEGRATION CHECKLIST:
- Lighting: Character lit by the SAME light sources as the environment (sun, moon, fire, neon, etc.)
- Atmosphere: Any haze, fog, particles, or volumetric effects affect BOTH the character AND the scene equally
- Grounding: Feet interact with the ground surface naturally — cast realistic shadows that match environment lighting direction
- Depth: Character has correct atmospheric perspective (slight haze at distance, sharp detail up close)
- Single pass: Generate character + environment together in one unified composition — NEVER composite separately

FAILURE INDICATORS (avoid these):
- Cut-out edges around the character
- Mismatched lighting direction between character and background
- Character appears "floating" above the ground
- Different color temperature on character vs environment
- Sharp character edges against soft/blurry background`;

    } else if (hasPhoto) {
      // Photo but no fingerprint yet — basic reference
      personalizedPrompt = `${basePrompt}. The reference image provided shows the main character of this dream — compose this character naturally as the dreamer and protagonist of the scene, maintaining their exact appearance and likeness.${aiContext.clothing_style ? ` The character wears ${aiContext.clothing_style} style clothing.` : ''}`;

    } else if (aiContext.clothing_style) {
      personalizedPrompt = `${basePrompt}. Featuring a person wearing ${aiContext.clothing_style} style clothing`;
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
    return `${prompt}.

PHOTOREALISM REQUIREMENTS:
- Render as a photorealistic photograph: ultra high resolution, 8K detail
- Camera: Shot on cinema camera (ARRI Alexa or RED) with prime lens (50mm-85mm), natural shallow depth of field, subtle bokeh
- Skin: Visible pores, subsurface scattering, micro-wrinkles, natural skin imperfections — NO airbrushing or smoothing
- Lighting: Motivated light sources with natural falloff, soft shadow edges, correct color temperature
- Materials: Authentic fabric weave, leather grain, metal reflections — every material must look physically correct
- Atmosphere: Natural lens flare, subtle chromatic aberration, film-like color grading
- NO painterly, artistic, or stylized effects whatsoever — pure photographic realism`;
  }
  
  if (imageStyle === 'hyper_realism') {
    return `${prompt}.

EXTREME HYPERREALISM REQUIREMENTS:
- Render as an extreme hyperrealistic photograph indistinguishable from reality
- Camera: Professional DSLR with 85mm f/1.4 prime lens, perfect exposure, razor-sharp detail at 8K
- Skin: Individual pores visible, subsurface scattering showing blood flow beneath skin, micro-wrinkles, tiny hairs, natural oil sheen
- Eyes: Visible iris fibers, catchlights reflecting environment, wet surface reflection on cornea
- Lighting: Studio-quality motivated sources, physically accurate shadow falloff, correct inverse-square law behavior
- Materials: Thread-level fabric detail, leather pore texture, accurate specular highlights on every surface
- Environment: Atmospheric depth, dust motes in light beams, correct aerial perspective
- Post-processing: Cinema-grade color science, subtle film grain, natural vignetting`;
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
