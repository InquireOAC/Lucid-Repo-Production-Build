
# Dream Analysis — Professional Insight Upgrade

## The Problem

The current analysis system prompt is a single flat sentence:

> "You are an expert dream analyst. Analyze the dream and provide meaningful insights about its potential psychological significance, symbolism, and what it might reveal about the dreamer's subconscious mind. Keep the analysis concise but insightful."

This produces generic, surface-level text that lacks depth, structure, or personalization. The output is also rendered in a plain `Textarea`, making it hard to read and not visually engaging.

## What the Upgrade Delivers

A structured, multi-layered professional dream interpretation — formatted in clearly labeled sections with emotional resonance, narrative insight, and actionable guidance. The UI will render this as a beautiful, readable card rather than a raw text box.

---

## Layer 1 — Analysis Prompt Rewrite (`analyze-dream` Edge Function)

Replace the generic one-liner system prompt with a full professional dream analyst framework covering five expert lenses:

| Section | What it covers |
|---|---|
| **Core Narrative** | The dream's central story arc and what emotional journey it maps |
| **Symbols & Archetypes** | Key symbols, their psychological meanings (Jungian/universal), and personal resonance |
| **Emotional Undercurrents** | The emotional tone and what unresolved feelings or needs it may surface |
| **Message / Communication** | What the subconscious might be trying to communicate — the "core message" |
| **Invitation** | A grounded, actionable reflection prompt or practice the dreamer can take into waking life |

The prompt instructs the model to:
- Write each section in warm, accessible language (not clinical jargon)
- Use second person ("Your dream suggests...") to feel personal
- Ground interpretations in widely recognized dream psychology traditions
- Always acknowledge that dream meaning is personal and context-specific
- Output a structured response using clear **section headers** so the UI can parse and render them beautifully

The model will be upgraded from `gpt-4o-mini` to `gpt-4o` for analysis tasks only (image prompt generation stays on mini), since deep qualitative reasoning benefits from the stronger model.

---

## Layer 2 — UI Redesign (`DreamAnalysis.tsx`)

Replace the raw `Textarea` with a structured, readable card layout:

- Parse the AI response into labeled sections using a simple header regex
- Render each section as a styled card block with an icon and title
- Use the app's existing `glass-card` and `gradient-text` aesthetic
- Add a collapsible "Full Analysis" expander for long content on mobile
- Keep the "Regenerate" button but style it more intentionally

Section icons for visual clarity:
- Core Narrative → `BookOpen`
- Symbols → `Sparkles`
- Emotional Undercurrents → `Heart`
- Message → `MessageCircle`
- Invitation → `Lightbulb`

---

## Layer 3 — Detail View Enhancement (`DreamDetailContent.tsx`)

The analysis display in the dream detail modal currently renders in a flat muted box with the `PaginatedText` component. Upgrade this to:

- Use the same structured section rendering as the form component
- Give the analysis section a more prominent visual treatment with the `Brain` icon as a header
- Remove the generic `bg-muted/40` box and replace with a subtle glass treatment consistent with the rest of the modal

---

## Files Changed

| File | Change |
|---|---|
| `supabase/functions/analyze-dream/index.ts` | Rewrite the `analyze_dream` system prompt with 5-section professional framework; upgrade to `gpt-4o` for analysis task |
| `src/components/DreamAnalysis.tsx` | Replace Textarea with structured section-based renderer; add section icons; improved loading state |
| `src/components/dreams/DreamDetailContent.tsx` | Upgrade the analysis display block to use the same structured renderer component |

A small shared utility component `AnalysisSections.tsx` will be created in `src/components/dreams/` to hold the section parsing and rendering logic, reused by both `DreamAnalysis.tsx` and `DreamDetailContent.tsx`.

---

## Example Output Structure

The AI will return text formatted like:

```
**Core Narrative**
Your dream takes you through a journey of...

**Symbols & Archetypes**
The water that fills the room represents...

**Emotional Undercurrents**
There is a pervading sense of anxiety beneath...

**Message**
Your subconscious may be signaling that...

**Invitation**
Before sleep tonight, consider writing about...
```

The UI parser splits on `**Section Title**` markers and renders each as a distinct visual block — so even if the model varies its exact formatting slightly, the component degrades gracefully to showing the full text.

---

## No Database Changes Required

The `analysis` field on `dream_entries` already stores a text string — the richer structured text from the new prompt will store fine in the same column. Existing analyses are preserved as-is.
