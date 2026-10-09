type StoryScene = { text?: string; story_text_exact?: boolean };

/**
 * Keep the saved dream as the source of truth. Generated scene briefs can
 * paraphrase or omit words, so their relative lengths only guide where an
 * illustration lands; they never replace the original story.
 */
export function splitStoryAroundScenes(content: string, scenes: StoryScene[]): string[] {
  const story = content.trim() || scenes.map((scene) => scene.text?.trim()).filter(Boolean).join("\n\n");
  if (scenes.length && scenes.every((scene) => scene.story_text_exact)) {
    const exact = scenes.map((scene) => scene.text?.trim() || "");
    if (exact.join(" ").replace(/\s+/g, " ") === story.replace(/\s+/g, " ")) return exact;
  }
  if (!story || scenes.length < 2) return [story];

  const breaks = new Set<number>();
  for (const match of story.matchAll(/[.!?]["”’']?(?=\s|$)/g)) {
    breaks.add((match.index ?? 0) + match[0].length);
  }
  for (const match of story.matchAll(/\n\s*\n/g)) {
    breaks.add((match.index ?? 0) + match[0].length);
  }
  // A dream written as one long sentence still needs readable image breaks.
  for (const match of story.matchAll(/\s+/g)) {
    breaks.add(match.index ?? 0);
  }

  const candidates = [...breaks].filter((position) => position > 0 && position < story.length).sort((a, b) => a - b);
  const weights = scenes.map((scene) => Math.max(1, scene.text?.length || 0));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const minGap = Math.min(40, Math.max(1, Math.floor(story.length / (scenes.length * 3))));
  const pieces: string[] = [];
  let previous = 0;
  let cumulativeWeight = 0;

  for (let index = 0; index < scenes.length - 1; index++) {
    cumulativeWeight += weights[index];
    const target = Math.round((cumulativeWeight / totalWeight) * story.length);
    const latest = story.length - minGap * (scenes.length - index - 1);
    const possible = candidates.filter((position) => position >= previous + minGap && position <= latest);
    if (!possible.length) break;
    const choice = possible.reduce((best, position) => {
      const sentenceBonus = /[.!?]["”’']?$/.test(story.slice(0, position)) ? story.length * 0.06 : 0;
      const score = Math.abs(position - target) - sentenceBonus;
      const bestBonus = /[.!?]["”’']?$/.test(story.slice(0, best)) ? story.length * 0.06 : 0;
      return score < Math.abs(best - target) - bestBonus ? position : best;
    });
    pieces.push(story.slice(previous, choice).trim());
    previous = choice;
  }

  pieces.push(story.slice(previous).trim());
  while (pieces.length < scenes.length) pieces.push("");
  return pieces;
}
