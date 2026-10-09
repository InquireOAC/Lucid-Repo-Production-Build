import React from "react";
import { format } from "date-fns";
import { DreamEntry } from "@/types/dream";

interface DreamBookCoverProps {
  authorName: string;
  dreams: DreamEntry[];
  compact?: boolean;
}

const DreamBookCover = ({ authorName, dreams, compact }: DreamBookCoverProps) => {
  const dreamCount = dreams.length;
  let dateRange = "";
  if (dreamCount > 0) {
    const sorted = [...dreams].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    try {
      const earliest = format(new Date(sorted[0].date), "MMM yyyy");
      const latest = format(new Date(sorted[sorted.length - 1].date), "MMM yyyy");
      dateRange = earliest === latest ? earliest : `${earliest} — ${latest}`;
    } catch {}
  }

  if (compact) {
    return (
      <div className="text-center py-8 border-b border-border/50">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Dream Journal</h1>
        <p className="text-muted-foreground text-sm">{authorName}</p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          {dreamCount} dream{dreamCount !== 1 ? "s" : ""} {dateRange && `· ${dateRange}`}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-card via-card to-accent/10 rounded-lg border border-border/30 p-8 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="absolute top-6 left-6 right-6 bottom-6 border border-primary/10 rounded-md pointer-events-none" />

      <div className="relative z-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">Volume I</p>
        <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4 leading-tight">
          Dream Journal
        </h1>
        <div className="w-16 h-px bg-primary/40 mx-auto mb-4" />
        <p className="text-lg font-serif italic text-muted-foreground mb-6">{authorName}</p>
        <p className="text-xs text-muted-foreground/50">
          {dreamCount} dream{dreamCount !== 1 ? "s" : ""}
          {dateRange && ` · ${dateRange}`}
        </p>
      </div>
    </div>
  );
};

export default DreamBookCover;
