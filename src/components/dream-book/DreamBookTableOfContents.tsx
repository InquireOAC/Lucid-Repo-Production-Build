import React from "react";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";

interface DreamBookTableOfContentsProps {
  dreams: DreamEntry[];
  onSelectDream?: (index: number) => void;
}

const DreamBookTableOfContents = ({ dreams, onSelectDream }: DreamBookTableOfContentsProps) => {
  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
      <h2 className="text-xl font-bold font-serif text-foreground mb-1">Contents</h2>
      <div className="w-10 h-px bg-primary/30 mb-4" />

      <div className="space-y-1.5 flex-1">
        {dreams.map((dream, i) => {
          let dateStr = "";
          try {
            dateStr = format(new Date(dream.date), "MMM d");
          } catch {}

          return (
            <button
              key={dream.id}
              onClick={() => onSelectDream?.(i)}
              className="w-full flex items-baseline gap-2 text-left group hover:bg-primary/5 rounded px-2 py-1.5 transition-colors"
            >
              <span className="text-xs text-muted-foreground/50 font-mono w-5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-foreground group-hover:text-primary transition-colors truncate flex-1">
                {dream.title}
              </span>
              <span className="text-xs text-muted-foreground/40 shrink-0">{dateStr}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DreamBookTableOfContents;
