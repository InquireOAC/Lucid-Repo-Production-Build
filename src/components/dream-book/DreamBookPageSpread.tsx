import React from "react";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";
import { Moon, Sparkles, Film } from "lucide-react";

interface SceneData {
  section: number;
  text: string;
  image_url?: string;
  video_url?: string;
}

interface DreamBookPageSpreadProps {
  dream: DreamEntry;
  mode: "book" | "reader";
  scene?: SceneData;
  isTitlePage?: boolean;
}

const MediaElement = ({ imageUrl, videoUrl, alt, className }: { imageUrl?: string; videoUrl?: string; alt: string; className?: string }) => {
  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className={className || "w-full h-full object-cover"}
      />
    );
  }
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className || "w-full h-full object-cover"}
        loading="lazy"
      />
    );
  }
  return null;
};

const DreamBookPageSpread = ({ dream, mode, scene, isTitlePage }: DreamBookPageSpreadProps) => {
  const heroImage = dream.generatedImage || dream.image_url;
  const heroVideo = dream.video_url;
  let dateStr = "";
  try {
    dateStr = format(new Date(dream.date), "MMMM d, yyyy");
  } catch {
    dateStr = dream.date;
  }

  // --- READER MODE ---
  if (mode === "reader") {
    // Scene spread in reader mode
    if (scene) {
      return (
        <article className="border-b border-border/30 pb-6 mb-6 last:border-0 ml-4">
          {(scene.video_url || scene.image_url) && (
            <div className="w-full rounded-lg overflow-hidden mb-4 bg-muted/20">
              <MediaElement imageUrl={scene.image_url} videoUrl={scene.video_url} alt={`Scene ${scene.section}`} className="w-full h-auto object-contain" />
            </div>
          )}
          <p className="text-xs font-semibold text-primary/60 mb-1">Scene {scene.section}</p>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{scene.text}</p>
        </article>
      );
    }

    // Title page in reader mode (for multi-scene dreams)
    if (isTitlePage) {
      const validScenes = (dream.section_images || []).filter((s: SceneData) => s.text || s.image_url || s.video_url);
      return (
        <article className="border-b border-border/30 pb-6 mb-4 last:border-0 overflow-hidden">
          {(heroVideo || heroImage) && (
            <div className="w-full aspect-[9/16] overflow-hidden">
              <MediaElement imageUrl={heroImage} videoUrl={heroVideo} alt={dream.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="text-center px-4 pt-4 pb-2">
            <h3 className="text-xl font-bold font-serif text-foreground drop-shadow-lg mb-2" style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.3)' }}>
              {dream.title}
            </h3>

            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-12 bg-primary/30" />
              <Sparkles className="w-3 h-3 text-primary/50" />
              <div className="h-px w-12 bg-primary/30" />
            </div>

            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              {dateStr}{dream.mood && ` · ${dream.mood}`}
            </p>

            <div className="flex items-center justify-center gap-3 mb-3">
              {dream.lucid && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-primary" style={{ textShadow: '0 0 8px hsl(var(--primary) / 0.4)' }}>
                  <Sparkles className="w-3 h-3" /> Lucid
                </span>
              )}
              {validScenes.length > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                  <Film className="w-3 h-3" /> {validScenes.length} scenes
                </span>
              )}
            </div>

            {dream.tags && dream.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {dream.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary/80">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      );
    }

    // Standard single-spread dream in reader mode (no scenes)
    return (
      <article className="border-b border-border/30 pb-8 mb-8 last:border-0">
        {(heroVideo || heroImage) && (
          <div className="w-full aspect-[16/10] rounded-lg overflow-hidden mb-5 bg-muted/20">
            <MediaElement imageUrl={heroImage} videoUrl={heroVideo} alt={dream.title} />
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
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-accent/50 text-accent-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line mb-4">{dream.content}</p>
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

  // --- BOOK MODE ---

  // Scene spread in book mode
  if (scene) {
    return (
      <div className="w-full h-full flex">
        <div className="w-1/2 h-full bg-card/30 flex items-center justify-center overflow-hidden">
          {(scene.video_url || scene.image_url) ? (
            <MediaElement imageUrl={scene.image_url} videoUrl={scene.video_url} alt={`Scene ${scene.section}`} />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <Moon className="w-10 h-10 text-primary/20 mb-3" />
              <p className="text-sm font-serif italic text-muted-foreground/40">Scene {scene.section}</p>
            </div>
          )}
        </div>
        <div className="w-1/2 h-full p-5 overflow-y-auto bg-card/10 flex flex-col">
          <p className="text-[10px] font-semibold text-primary/50 mb-1">Scene {scene.section}</p>
          <h3 className="text-sm font-bold font-serif text-foreground mb-2 leading-tight">{dream.title}</h3>
          <div className="w-full h-px bg-border/30 mb-2" />
          <p className="text-xs text-foreground/80 leading-relaxed flex-1 whitespace-pre-line">{scene.text}</p>
        </div>
      </div>
    );
  }

  // Title page in book mode (for multi-scene dreams)
  if (isTitlePage) {
    const validScenes = (dream.section_images || []).filter((s: SceneData) => s.text || s.image_url || s.video_url);
    return (
      <div className="w-full h-full relative overflow-hidden">
        {/* Full-bleed hero media */}
        {(heroVideo || heroImage) ? (
          <>
            <MediaElement
              imageUrl={heroImage}
              videoUrl={heroVideo}
              alt={dream.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Bottom gradient for text legibility */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.08) 0%, hsl(var(--background)) 70%)' }}>
            <Moon className="w-14 h-14 text-primary/15" />
          </div>
        )}

        {/* Overlaid title and metadata */}
        <div className="absolute bottom-0 left-0 right-0 text-center px-4 pb-4 pt-8">
          <h2 className="text-base font-bold font-serif text-white drop-shadow-lg leading-tight mb-1" style={{ textShadow: '0 0 16px hsl(var(--primary) / 0.4)' }}>
            {dream.title}
          </h2>

          <div className="flex items-center justify-center gap-1.5 my-1.5">
            <div className="h-px w-8 bg-white/30" />
            <Sparkles className="w-2.5 h-2.5 text-primary/60" />
            <div className="h-px w-8 bg-white/30" />
          </div>

          <p className="text-[9px] uppercase tracking-widest text-white/70">
            {dateStr}{dream.mood && ` · ${dream.mood}`}
          </p>

          <div className="flex items-center justify-center gap-2 mt-1">
            {dream.lucid && (
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-primary" style={{ textShadow: '0 0 6px hsl(var(--primary) / 0.4)' }}>
                <Sparkles className="w-2.5 h-2.5" /> Lucid
              </span>
            )}
            {validScenes.length > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-white/50">
                <Film className="w-2.5 h-2.5" /> {validScenes.length} scenes
              </span>
            )}
          </div>

          {dream.tags && dream.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-1.5">
              {dream.tags.slice(0, 4).map((t) => (
                <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/70">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard single dream spread in book mode (no scenes)
  return (
    <div className="w-full h-full flex">
      <div className="w-1/2 h-full bg-card/30 flex items-center justify-center overflow-hidden">
        {(heroVideo || heroImage) ? (
          <MediaElement imageUrl={heroImage} videoUrl={heroVideo} alt={dream.title} />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <Moon className="w-10 h-10 text-primary/20 mb-3" />
            <p className="text-sm font-serif italic text-muted-foreground/40 max-w-[80%]">{dream.title}</p>
          </div>
        )}
      </div>
      <div className="w-1/2 h-full p-5 overflow-y-auto bg-card/10 flex flex-col">
        <h3 className="text-base font-bold font-serif text-foreground mb-1 leading-tight">{dream.title}</h3>
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
