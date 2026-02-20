import { dreamContainsCharacters } from "./characterDetectionUtils";

/**
 * Build personalized prompt with visual fingerprint + full cinematic integration
 */
export const buildPersonalizedPrompt = (basePrompt: string, aiContext: any, imageStyle?: string): string => {
  let personalizedPrompt = basePrompt;

  if (aiContext) {
    const hasFingerprint = !!aiContext.visual_fingerprint;
    const hasPhoto = !!aiContext.photo_url;

    if (hasPhoto && hasFingerprint) {
      personalizedPrompt = `${basePrompt}.

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

    } else if (hasPhoto) {
      personalizedPrompt = `${basePrompt}.

CHARACTER IDENTITY REFERENCE: The provided reference image shows the DREAMER — the protagonist and central character of this scene. Replicate their exact facial features, hair, skin tone, and body proportions precisely.${aiContext.clothing_style ? ` They wear ${aiContext.clothing_style} style clothing adapted to the dream world.` : ''}

UNIFIED WORLD RENDERING: Render the character as a native inhabitant of this dream environment. Same lighting, same atmospheric effects, same physics — one unified composition, never composited.`;

    } else if (aiContext.clothing_style) {
      personalizedPrompt = `${basePrompt}. Featuring a person wearing ${aiContext.clothing_style} style clothing, rendered as a unified part of the scene environment.`;
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
 * Add selected image style to the prompt with full cinematic composition directives
 */
const addImageStyleToPrompt = (prompt: string, imageStyle?: string): string => {
  if (imageStyle === 'realistic') {
    return `${prompt}.

PHOTOREALISM — CINEMATIC REQUIREMENTS:
- Medium: Photorealistic digital photograph indistinguishable from a real film still
- Camera: ARRI Alexa or RED Digital Cinema camera, 50-85mm prime lens, f/2.8 natural depth of field
- Composition Directive: Classic cinematic frame — rule of thirds, motivated foreground element, character in midground, deep background with atmospheric perspective
- Shot Type: Medium or medium-wide establishing shot with the character as the clear visual anchor
- Lighting: Single motivated key light with soft fill and subtle rim separation. Natural shadow falloff. Correct inverse-square law. Color temperature unified across the full frame.
- Skin: Visible pores, subsurface scattering, micro-wrinkles, authentic skin imperfections — zero airbrushing
- Materials: Thread-level fabric weave, authentic leather grain, physically-based metal reflections
- Atmosphere: Subtle lens characteristics — natural chromatic aberration edges, cinema color science, motivated lens flare
- Exposure: One stop under for cinematic drama. Lifted blacks, rich shadow detail.
- NO painterly, artistic, or stylized effects — pure photographic realism`;
  }
  
  if (imageStyle === 'hyper_realism') {
    return `${prompt}.

EXTREME HYPERREALISM — CINEMATIC REQUIREMENTS:
- Medium: Extreme hyperrealistic image indistinguishable from high-end commercial photography
- Camera: Phase One 150MP medium format, 85mm f/1.4, tack sharp at center, gentle natural falloff at edges
- Composition Directive: Tight medium shot or medium close-up. Character occupies the golden-ratio focal point. Strong foreground-background depth separation.
- Shot Type: Hero portrait or environmental portrait — character dominant, world visible and rich behind them
- Lighting: Studio-quality three-point lighting from motivated world sources. Physically accurate shadow geometry and penumbra.
- Skin: Individual pores, subsurface blood-flow scattering, micro-hairs, natural oil sheen. Iris fibers visible. Cornea wet-surface reflection showing environment.
- Materials: Thread-level fabric detail, leather pore texture, specular accuracy on every surface type
- Atmosphere: Dust motes in light beams, correct aerial perspective, atmospheric depth haze
- Post: Cinema-grade color science, whisper of natural film grain, gentle vignette`;
  }

  if (imageStyle === 'abstract') {
    return `${prompt}.

ABSTRACT ART — CINEMATIC COMPOSITION:
- Medium: Large-format abstract painting — acrylic, oil, and mixed media on canvas
- Composition Directive: Dynamic diagonal composition. Primary color field occupies the upper-left golden-ratio zone. Secondary tension in the lower-right. Strong visual flow from edge to center.
- Shot equivalent: The composition reads as a dramatic wide shot — vast color fields create environmental scale
- Style: Kandinsky meets Rothko — emotional color fields with geometric and organic form tension
- Color Story: 2-3 bold saturated primaries with one unexpected accent. High contrast between color blocks.
- Texture: Layered impasto, visible artistic process — palette knife ridges, brush drag marks, collage elements
- Character representation: Abstracted into form and color — recognizable as human presence through gestural suggestion, not literal rendering
- Energy: Raw, expressive, emotionally resonant — the painting captures the feeling of the dream, not a photograph of it`;
  }

  if (imageStyle === 'impressionist') {
    return `${prompt}.

IMPRESSIONIST PAINTING — CINEMATIC COMPOSITION:
- Medium: En plein air oil painting on primed linen — Monet-Renoir school, late 19th century
- Composition Directive: S-curve or Z-path composition drawing the eye from foreground foliage through midground figure to luminous background. Classic impressionist depth structure.
- Shot equivalent: Wide establishing shot with the figure in the golden-ratio midground — the character is part of the landscape, not separate from it
- Light: Golden-hour or soft cloudy-day natural light. Warm key, cool chromatic shadows. Backlit rim that dissolves the figure into the atmosphere.
- Brushwork: Confident broken-color dabs with visible impasto texture. Thick paint ridges catching sidelight. No hard outlines — all edges are color-meetings.
- Shadow theory: Shadows rendered in purple, blue, and complementary hues — never raw black or grey
- Atmosphere: Shimmering, luminous, fleeting — the image captures one irreplaceable moment of natural light
- Character integration: The figure's brushwork matches the environment exactly — same stroke size, same paint thickness, same softness of edge`;
  }

  if (imageStyle === 'fantasy') {
    return `${prompt}.

EPIC FANTASY ART — CINEMATIC COMPOSITION:
- Medium: Epic fantasy illustration — AAA concept art quality, ArtStation-caliber, painterly digital
- Composition Directive: HERO SHOT — low camera angle (15-25° below eye-level) looking slightly up at the character. Character silhouetted against a luminous sky or dramatic background. Rule of thirds with character on vertical third line.
- Shot Type: Rising-angle medium shot. Character dominates the lower-center frame. Environment sweeps dramatically upward and outward behind them.
- Lighting: Three-point cinematic setup — warm volumetric god-rays as key light, cool atmospheric fill, intense golden rim light separating character from background
- Atmosphere: Layered depth — detailed foreground flora/stone, character in crisp midground, background fades through 3-4 atmospheric layers into mist
- Details: Ornate, intricate surfaces on armor, architecture, flora. Magical particle effects — glowing embers, ethereal wisps, floating runes.
- Color palette: Rich jewel tones (deep emerald, royal sapphire, burnished gold) with one luminous accent color on the character
- Character integration: Character is LIT by the same god-rays and atmospheric light as the environment. Rim light comes from the same source as the background glow.`;
  }

  if (imageStyle === 'minimalist') {
    return `${prompt}.

MINIMALIST DESIGN — CINEMATIC COMPOSITION:
- Medium: Japanese-influenced minimalist digital illustration or fine art print
- Composition Directive: Extreme negative space composition. The subject occupies maximum 15% of the frame area. Placed precisely on a golden-ratio intersection point. Vast intentional emptiness surrounds them.
- Shot equivalent: Ultra-wide establishing shot where the environment's scale dwarfs and contextualizes the character
- Color: 2-3 hues maximum. One dominant field (60%), one secondary (30%), one precise accent (10%). Each color chosen for maximum emotional resonance.
- Forms: Single clear focal element with absolute clarity. Clean geometric shapes. Precise, deliberate edges. No decoration without purpose.
- Atmosphere: Zen stillness. Meditative silence. The emptiness IS the composition — it creates meaning through absence.
- Character integration: Figure rendered as a clean simplified silhouette or minimal form — same graphic language as the environment, never photorealistic against a flat background
- The image should feel like a single breath held in perfect stillness`;
  }

  if (imageStyle === 'vintage') {
    return `${prompt}.

VINTAGE PHOTOGRAPHY — CINEMATIC COMPOSITION:
- Medium: 1970s analog 35mm or medium format film photograph
- Film stock: Kodak Portra 400 or Ektachrome — warm color science, lifted blacks, soft shadow rolloff
- Composition Directive: Classic photojournalism or editorial framing — off-center subject, environmental storytelling context, authentic human moment captured mid-action or mid-expression
- Shot Type: Environmental portrait — character clearly part of their world, not posed against it
- Camera characteristics: Slight barrel distortion from period lens, soft focus falloff at frame edges, natural vignette, subtle focus breathing
- Color: Warm muted tones with slightly desaturated palette. Amber/cream highlights, shadowed areas with slight color shift toward magenta or cyan.
- Film artifacts: Visible grain throughout (natural dithering), subtle light leaks (warm amber at one edge), occasional minor chromatic aberration
- Character integration: Lit by the existing light of the environment — window light, lamplight, daylight. No studio flash. Natural, motivated illumination only.`;
  }

  if (imageStyle === 'cyberpunk') {
    return `${prompt}.

CYBERPUNK DIGITAL ART — CINEMATIC COMPOSITION:
- Medium: High-fidelity cyberpunk concept art — Blade Runner 2049 meets Ghost in the Shell aesthetic
- Composition Directive: LOW-ANGLE DUTCH TILT — camera positioned below eye-level (20-30° tilt), angled slightly upward. Character looms in the frame. Creates psychological tension and urban menace.
- Shot Type: Low-angle medium or medium-wide shot. Character in sharp foreground, neon cityscape layers receding behind them in sharp vertical lines.
- Lighting: Neon environment IS the lighting rig. Pink-magenta, electric cyan, and acid-green neon signs as the motivating key lights. Each neon source casts a distinct colored shadow. Character rim-lit by the closest neon panel.
- Rain: Wet-slick surfaces on every horizontal plane. Rain-beaded character surfaces. Neon signs reflected in puddles and wet asphalt.
- Atmosphere: Volumetric neon-scatter fog — colored light bleeding through rain and smoke. Holographic HUD data-streams as environmental elements. Kanji and data floating in mid-air.
- Materials: Carbon fiber, scarred leather, brushed chrome, glowing circuit-trace patterns
- Color: Pitch-black shadows punctuated by intense neon highlights. Deep contrast ratio. Character details emerge from darkness.
- Character integration: The neon light physically wraps around the character — rim lights, reflected color pools on wet surfaces beneath them`;
  }

  if (imageStyle === 'watercolor') {
    return `${prompt}.

WATERCOLOR PAINTING — CINEMATIC COMPOSITION:
- Medium: Traditional watercolor on 300gsm cold-press cotton rag paper — professional studio quality
- Composition Directive: Atmospheric perspective composition. Foreground in richest pigment and detail, midground figure rendered with controlled precision, background dissolves into luminous wet washes. Classic watercolorist's depth structure.
- Shot equivalent: Wide medium shot — character clearly present in the midground, environment breathes around them
- Technique: Wet-on-wet for atmospheric backgrounds, wet-on-dry for character and foreground detail. Controlled blooms where deliberate. Granulation in mineral pigment washes.
- Light: The paper IS the light source — white paper reserved for the brightest highlights. Paint applied in transparent glazes, building depth. Light comes THROUGH the paint, not from it.
- Color bleeding: Organic color transitions where washes meet — deliberate feathering and soft edge merging
- Paper texture: Cold-press tooth visible in lighter wash areas. Natural pigment settling patterns. Occasional controlled drips at lower edges.
- Character integration: Figure painted with same watercolor language as the environment — same paper texture, same edge softness, same pigment granulation. The character is born from the same washes as the world.`;
  }

  if (imageStyle === 'oil_painting') {
    return `${prompt}.

OIL PAINTING — CINEMATIC COMPOSITION:
- Medium: Large-format museum-quality oil painting on primed linen canvas
- Composition Directive: Classical master composition — rule of thirds with strong diagonal light structure. Primary focal point (character) placed on intersection of thirds. Supporting environmental elements frame and direct the eye inward. Deep perspective recession.
- Shot equivalent: Medium to medium-wide — character in the golden-ratio primary zone, rich environmental context surrounding them
- Lighting: Rembrandt chiaroscuro — single dominant light source creating dramatic light-to-dark contrast across 70% of the frame. Rich shadow fill. Luminous light areas with detailed shadow that retains full tonal information.
- Paint application: Thick impasto in light areas (palette knife marks visible). Thinner, more fluid glazes in shadow. Visible canvas weave in the darkest areas. Brushwork direction follows form.
- Pigments: Old Master palette — cadmium red, ultramarine, yellow ochre, raw umber, titanium white, ivory black. Rich, saturated, historically authentic.
- Character integration: Figure and environment painted in identical medium, technique, and light. No difference in impasto thickness or brushwork between character and background at same distance. Unified optical space.`;
  }

  if (imageStyle === 'digital_art') {
    return `${prompt}.

DIGITAL ART — CINEMATIC COMPOSITION:
- Medium: Professional concept art at AAA video game or film production quality — ArtStation trending caliber
- Composition Directive: Cinematic widescreen composition (implied 2.39:1 anamorphic ratio). Character placed on primary golden-ratio vertical. Strong foreground element creates depth. Background layers recede through 3+ atmospheric depth planes.
- Shot Type: Medium or medium-wide cinematic establishing shot — character as clear protagonist, world as immersive context
- Camera: Low-angle with subtle perspective distortion — character gains heroic presence. Environment appears to expand upward and outward.
- Lighting: Volumetric three-point cinematic setup — warm key light from one motivated world source, cool atmospheric fill from opposite, intense rim light separating character from background. Visible light shafts and god rays where appropriate.
- Technical: 4K render quality. Clean anti-aliased edges. Smooth gradient transitions. Subsurface scattering on skin. Physically-based material responses.
- Color: Vibrant saturated palette with intentional complementary color tension. One hero accent color on the character that appears nowhere else in the scene.
- Character integration: Character rendered at the same fidelity, lighting language, and artistic style as every other element in the frame. No difference in render quality between figure and environment.`;
  }

  if (imageStyle === 'sketch') {
    return `${prompt}.

PENCIL SKETCH — CINEMATIC COMPOSITION:
- Medium: Professional graphite sketch on smooth bristol or hot-press paper — master draftsman quality
- Composition Directive: Classic academic drawing composition — strong light-dark value structure creates depth. Character is the lightest, most detailed element. Background rendered in progressively looser, lighter strokes to create atmospheric recession.
- Shot equivalent: Medium shot with clear depth — foreground objects in darkest, heaviest mark-making; character in midground with precise rendering; background in light gestural lines
- Mark-making: Variable pencil pressure across the full range — 2H for light atmospheric background tones, HB for midtones, 4B-6B for deepest shadows and character emphasis. Cross-hatching and parallel hatching for shadow modeling.
- Texture: Paper tooth visible through lighter strokes. Smudged gradients in broad shadow areas using blending stump. Erased highlights in key areas.
- Line quality: Confident primary contour lines. Secondary construction marks left visible for authenticity. Gesture lines indicate movement and form.
- Character integration: Figure drawn with same mark-making language as environment — no stylistic difference between the rendering of the character and the surrounding world. Sketch is ONE unified drawing, not a figure placed on a background.`;
  }

  // Default: surreal (and fallback for unknown styles)
  return `${prompt}.

SURREAL DREAMSCAPE — CINEMATIC COMPOSITION:
- Medium: Hyper-detailed surrealist digital painting — Salvador Dalí meets Magritte, executed with photorealistic precision on impossible subjects
- Composition Directive: IMPOSSIBLE PERSPECTIVE composition — rule of thirds violated deliberately to create dream logic. Multiple vanishing points that shouldn't coexist. Horizon lines that bend, split, or recede in paradoxical directions. Character placed at the impossible intersection.
- Shot Type: Wide establishing shot that reveals the full impossible architecture of the dream world. Camera angle feels simultaneously intimate and vertiginous.
- Visual paradox: Objects rendered with photorealistic detail while existing in physically impossible configurations. Scale distortion — familiar objects at wrong sizes. Gravity suggestions contradicted by floating elements.
- Lighting: Otherworldly light sources that defy physics — bioluminescent glow from impossible directions, prismatic light refractions without a source, shadows that point toward their objects instead of away
- Atmosphere: Layered impossible depth — foreground crisp and hyper-detailed, midground where the character exists with full clarity, background dissolving into chromatic abstraction
- Color story: Vivid, saturated, emotionally destabilizing — color combinations that feel simultaneously wrong and deeply resonant. Colors that don't exist in the real world.
- Character integration: The character is AS IMPOSSIBLE as the environment — rendered with the same hyper-realistic technique applied to the same dream-logic physics. They belong in this world because they ARE this world.`;
};
