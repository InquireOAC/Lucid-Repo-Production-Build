import React from "react";
import { BookOpen, Sparkles, Heart, MessageCircle, Lightbulb, Brain } from "lucide-react";

const SECTION_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  "Core Narrative": { icon: BookOpen, color: "text-blue-400" },
  "Symbols & Archetypes": { icon: Sparkles, color: "text-purple-400" },
  "Emotional Undercurrents": { icon: Heart, color: "text-rose-400" },
  "Message": { icon: MessageCircle, color: "text-amber-400" },
  "Invitation": { icon: Lightbulb, color: "text-emerald-400" },
};

const FALLBACK_ICON = Brain;
const FALLBACK_COLOR = "text-muted-foreground";

export interface ParsedSection {
  title: string;
  body: string;
}

/**
 * Parse an analysis string formatted with **Bold Header** markers into sections.
 * Degrades gracefully — if no markers found, returns the full text as one block.
 */
export function parseAnalysisSections(text: string): ParsedSection[] {
  if (!text?.trim()) return [];

  // Match **Title** (with optional trailing colon or whitespace)
  const headerRegex = /\*\*([^*]+)\*\*/g;
  const parts: ParsedSection[] = [];
  let lastIndex = 0;
  let lastTitle = "";
  let match: RegExpExecArray | null;

  while ((match = headerRegex.exec(text)) !== null) {
    if (lastTitle) {
      const body = text.slice(lastIndex, match.index).trim();
      if (body) parts.push({ title: lastTitle, body });
    } else if (match.index > 0) {
      // Text before first header
      const pre = text.slice(0, match.index).trim();
      if (pre) parts.push({ title: "", body: pre });
    }
    lastTitle = match[1].trim();
    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last header
  if (lastTitle) {
    const body = text.slice(lastIndex).trim();
    if (body) parts.push({ title: lastTitle, body });
  }

  // Fallback: no headers found
  if (parts.length === 0) {
    return [{ title: "", body: text.trim() }];
  }

  return parts;
}

interface SectionCardProps {
  section: ParsedSection;
  index: number;
}

function SectionCard({ section, index }: SectionCardProps) {
  const config = section.title ? (SECTION_CONFIG[section.title] ?? { icon: FALLBACK_ICON, color: FALLBACK_COLOR }) : { icon: FALLBACK_ICON, color: FALLBACK_COLOR };
  const Icon = config.icon;

  return (
    <div
      className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 space-y-2"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {section.title && (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 flex-shrink-0 ${config.color}`} />
          <h4 className="text-sm font-semibold tracking-wide text-foreground">{section.title}</h4>
        </div>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {section.body}
      </p>
    </div>
  );
}

interface AnalysisSectionsProps {
  text: string;
  className?: string;
}

export function AnalysisSections({ text, className }: AnalysisSectionsProps) {
  const sections = parseAnalysisSections(text);

  if (!sections.length) return null;

  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      {sections.map((section, i) => (
        <SectionCard key={i} section={section} index={i} />
      ))}
    </div>
  );
}
