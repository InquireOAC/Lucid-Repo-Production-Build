import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Sparkles, Heart, MessageCircle, Lightbulb } from "lucide-react";

const SECTION_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  "Core Narrative": { icon: BookOpen, color: "text-blue-400" },
  "Symbols & Archetypes": { icon: Sparkles, color: "text-blue-400" },
  "Emotional Undercurrents": { icon: Heart, color: "text-rose-400" },
  "Message": { icon: MessageCircle, color: "text-amber-400" },
  "Invitation": { icon: Lightbulb, color: "text-emerald-400" },
};

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
  const config = section.title ? SECTION_CONFIG[section.title] : undefined;

  return (
    <div
      className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-3 space-y-1.5 h-full"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {section.title && (
        <div className="flex items-center gap-2">
          {config && (() => { const Icon = config.icon; return <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${config.color}`} />; })()}
          <h4 className="text-xs font-semibold tracking-wide text-foreground">{section.title}</h4>
        </div>
      )}
      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-6">
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      if (!children.length) return;
      const scrollLeft = el.scrollLeft;
      const gap = 12; // gap-3 = 12px
      let closest = 0;
      let minDist = Infinity;
      children.forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft - scrollLeft);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveIndex(closest);
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [sections.length]);

  if (!sections.length) return null;

  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none"
      >
        {sections.map((section, i) => (
          <div key={i} className="snap-start flex-shrink-0 w-[80vw] max-w-[300px]">
            <SectionCard section={section} index={i} />
          </div>
        ))}
      </div>
      {sections.length > 1 && (
        <div className="flex justify-center gap-1.5 pt-2">
          {sections.map((_, i) => (
            <span
              key={i}
              className={`inline-block rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? "bg-primary w-2 h-2"
                  : "bg-muted-foreground/30 w-1.5 h-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
