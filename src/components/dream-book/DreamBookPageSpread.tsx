import React from "react";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";
import { Moon, Sparkles } from "lucide-react";

interface DreamBookPageSpreadProps {
  dream: DreamEntry;
  mode: "book" | "reader";
}

const DreamBookPageSpread = ({ dream, mode }: DreamBookPageSpreadProps) => {
  const imageUrl = dream.generatedImage || dream.image_url;
  let dateStr = "";
  try {
    dateStr = format(new Date(dream.date), "MMMM d, yyyy");
  } catch {
    dateStr = dream.date;
  }

  if (mode === "reader") {
    return (
      <article className="border-b border-border/30 pb-8 mb-8 last:border-0">
        {imageUrl && (
          <div className="w-full aspect-[16/10] rounded-lg overflow-hidden mb-5 bg-muted/20">
            <img
              src={imageUrl}
              alt={dream.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <h3 className="text-xl font-bold font-serif text-foreground mb-1">{dream.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span>{dateStr}</span>
          {dream.mood && <span>· {dream.mood}</span>}
          {dream.lucid && (
            <span className="flex items-center gap-0.5 text-primary">
              <Sparkles className="w-3 h-3" /> Lucid
            </span>
          )}
        </div>

        {dream.tags && dream.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {dream.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-accent/50 text-accent-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line mb-4">
          {dream.content}
        </p>

        {dream.analysis && (
          <div className="bg-card/60 border border-border/30 rounded-lg p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Moon className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Dream Analysis</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{dream.analysis}</p>
          </div>
        )}
      </article>
    );
  }

  // Book mode: split view — image left, text right
  return (
    <div className="w-full h-full flex">
      {/* Left page: image */}
      <div className="w-1/2 h-full bg-card/30 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={dream.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <Moon className="w-10 h-10 text-primary/20 mb-3" />
            <p className="text-sm font-serif italic text-muted-foreground/40 max-w-[80%]">
              {dream.title}
            </p>
          </div>
        )}
      </div>

      {/* Right page: text */}
      <div className="w-1/2 h-full p-5 overflow-y-auto bg-card/10 flex flex-col">
        <h3 className="text-base font-bold font-serif text-foreground mb-1 leading-tight">
          {dream.title}
        </h3>
        <p className="text-[10px] text-muted-foreground mb-2">
          {dateStr}
          {dream.mood && ` · ${dream.mood}`}
          {dream.lucid && " · ✦ Lucid"}
        </p>

        {dream.tags && dream.tags.length > 0 && (
          <p className="text-[10px] text-accent-foreground/60 italic mb-2">
            {dream.tags.map((t) => `#${t}`).join("  ")}
          </p>
        )}

        <div className="w-full h-px bg-border/30 mb-2" />

        <p className="text-xs text-foreground/80 leading-relaxed flex-1 whitespace-pre-line">
          {dream.content?.slice(0, 600)}
          {dream.content && dream.content.length > 600 && "..."}
        </p>

        {dream.analysis && (
          <div className="mt-2 pt-2 border-t border-border/20">
            <p className="text-[10px] font-semibold text-primary mb-1">Analysis</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {dream.analysis.slice(0, 200)}
              {dream.analysis.length > 200 && "..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamBookPageSpread;
