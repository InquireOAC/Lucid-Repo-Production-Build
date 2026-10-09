export interface MatchableCharacter {
  id: string;
  name?: string | null;
  photo_url?: string | null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Pick the side characters whose names appear in the given text.
 * Word-boundary, case-insensitive match. Characters without a usable
 * `photo_url` are dropped because there is no visual reference to attach.
 */
export function pickCharactersForText<T extends MatchableCharacter>(
  characters: T[] | null | undefined,
  text: string | null | undefined,
): T[] {
  if (!characters?.length || !text) return [];
  const matches: T[] = [];
  for (const c of characters) {
    if (!c.name || !c.photo_url) continue;
    const pattern = new RegExp(`\\b${escapeRegex(c.name)}\\b`, "i");
    if (pattern.test(text)) matches.push(c);
  }
  return matches;
}

/**
 * Like pickCharactersForText but keeps placeholder characters (no photo).
 * Used by UI surfaces that want to show ALL referenced characters in a
 * scene, including ones the user hasn't generated visuals for yet.
 */
export function pickCharactersForTextIncludingPlaceholders<T extends MatchableCharacter>(
  characters: T[] | null | undefined,
  text: string | null | undefined,
): T[] {
  if (!characters?.length || !text) return [];
  const matches: T[] = [];
  for (const c of characters) {
    if (!c.name) continue;
    const pattern = new RegExp(`\\b${escapeRegex(c.name)}\\b`, "i");
    if (pattern.test(text)) matches.push(c);
  }
  return matches;
}
