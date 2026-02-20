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

  if (imageStyle === 'abstract') {
    return `${prompt}.

ABSTRACT ART REQUIREMENTS:
- Bold abstract composition with geometric and organic forms
- Kandinsky/Rothko influence: saturated color fields with strong compositional tension
- Non-representational shapes that evoke emotion through color and form
- Textured mixed-media feel: layered paint, collage elements, visible artistic process
- High contrast between color blocks with deliberate compositional balance
- Raw, expressive energy — bold strokes, drips, splatters where appropriate`;
  }

  if (imageStyle === 'impressionist') {
    return `${prompt}.

IMPRESSIONIST PAINTING REQUIREMENTS:
- Monet/Renoir style: broken color dabs applied with visible, confident brushstrokes
- En plein air natural light: warm golden-hour glow or soft diffused daylight
- Chromatic shadow theory: shadows rendered in purple, blue, and complementary hues — never black
- Thick visible brushstrokes with impasto texture, paint ridges catching light
- Diffused, soft edges on all forms — no hard outlines
- Shimmering, luminous atmosphere that captures a fleeting moment in time`;
  }

  if (imageStyle === 'fantasy') {
    return `${prompt}.

EPIC FANTASY ART REQUIREMENTS:
- Epic fantasy illustration with rich, painterly detail and magical atmosphere
- Golden-hour rim lighting with dramatic volumetric god-rays and atmospheric haze
- Ornate, intricate details on armor, architecture, flora — every surface tells a story
- Magical particle effects: floating embers, glowing runes, ethereal wisps of energy
- Deep atmospheric perspective with layered depth: foreground detail fading to misty backgrounds
- Color palette: rich jewel tones (deep emeralds, royal purples, burnished golds) with luminous accents`;
  }

  if (imageStyle === 'minimalist') {
    return `${prompt}.

MINIMALIST DESIGN REQUIREMENTS:
- Japanese-inspired minimalism with vast, intentional negative space
- Strictly limited palette: 2-3 colors maximum, carefully chosen for harmony
- Single focal element with absolute clarity — remove everything non-essential
- Clean geometric forms with precise, deliberate edges
- Zen-like tranquility and meditative stillness in the composition
- Every element must justify its presence — if in doubt, remove it`;
  }

  if (imageStyle === 'vintage') {
    return `${prompt}.

VINTAGE PHOTOGRAPHY REQUIREMENTS:
- 1970s analog film aesthetic: Kodak Portra 400 / Ektachrome color science
- Visible film grain throughout with natural dithering and noise patterns
- Slight light leaks: warm amber/magenta bleeding in from frame edges
- Warm, muted tones with slightly desaturated colors and lifted blacks
- Soft vignette darkening corners naturally
- Period-accurate lens characteristics: soft focus falloff, subtle barrel distortion, warm flare`;
  }

  if (imageStyle === 'cyberpunk') {
    return `${prompt}.

CYBERPUNK DIGITAL ART REQUIREMENTS:
- Neon-drenched cyberpunk cityscape aesthetic: Blade Runner meets Ghost in the Shell
- Holographic HUD overlays, floating kanji/data streams, translucent UI elements
- Rain-slick reflections on every surface: wet asphalt mirroring neon signs
- Volumetric fog with neon light scatter: pink, cyan, and electric blue atmospheric haze
- Materials: brushed chrome, carbon fiber, scarred leather, glowing circuit traces
- Deep contrast: pitch-black shadows punctuated by intense neon highlights`;
  }

  if (imageStyle === 'watercolor') {
    return `${prompt}.

WATERCOLOR PAINTING REQUIREMENTS:
- Traditional watercolor on cold-press paper with visible paper grain texture
- Pigment granulation in washes: natural mineral pigment settling patterns
- Wet-on-wet bleeding edges where colors organically merge and feather
- Transparent layered glazes building depth — light comes through the paint, not from it
- Unpainted white paper highlights: leave the brightest areas as raw paper
- Delicate color transitions with soft, flowing edges and occasional controlled drips`;
  }

  if (imageStyle === 'oil_painting') {
    return `${prompt}.

OIL PAINTING REQUIREMENTS:
- Museum-quality oil painting with thick impasto brushstrokes and visible canvas weave
- Rembrandt-style chiaroscuro: dramatic light-to-dark contrast with a single dominant light source
- Glazed, luminous skin tones built through multiple transparent paint layers
- Visible palette knife marks and brushwork texture catching sidelight
- Rich, saturated pigments: cadmium reds, ultramarine blues, yellow ochre, raw umber
- Classical composition with golden ratio proportions and considered focal depth`;
  }

  if (imageStyle === 'digital_art') {
    return `${prompt}.

DIGITAL ART REQUIREMENTS:
- AAA concept art quality: polished, professional, ArtStation-trending caliber
- Clean vector-sharp edges with smooth color gradients and anti-aliased forms
- Volumetric lighting with visible light shafts, rim lights, and subsurface scattering on skin
- 4K render quality: crisp details at every scale, no artifacts or noise
- Vibrant, saturated color palette with complementary color theory applied
- Cinematic composition with dramatic camera angles and intentional depth of field`;
  }

  if (imageStyle === 'sketch') {
    return `${prompt}.

PENCIL SKETCH REQUIREMENTS:
- Professional graphite sketch with varied pencil pressure ranging from 2H (light) to 6B (dark)
- Cross-hatching and parallel hatching for shadow depth and tonal gradation
- Visible paper tooth texture: rough drawing paper grain showing through lighter strokes
- Smudged soft gradients in shadow areas using blending stumps
- Raw construction lines and gesture marks left visible for artistic authenticity
- High contrast between stark white highlights and deep graphite blacks`;
  }

  if (imageStyle && !['surreal'].includes(imageStyle)) {
    // Fallback for any unknown style
    return `${prompt}. Render in ${imageStyle} style with high detail and professional quality`;
  }
  
  // Default: surreal
  return `${prompt}.

SURREAL DREAMSCAPE REQUIREMENTS:
- Salvador Dalí meets Magritte: melting forms, impossible geometry, paradoxical spaces
- Hyper-detailed textures on surreal objects: photorealistic rendering of impossible things
- Chromatic, otherworldly lighting: bioluminescent glows, prismatic light refractions
- Fantastical atmosphere with floating elements, scale distortion, and dream logic
- Vivid, saturated colors with unexpected color combinations that feel emotionally resonant
- Cinematic composition with deep perspective drawing the eye into impossible vanishing points`;
};
