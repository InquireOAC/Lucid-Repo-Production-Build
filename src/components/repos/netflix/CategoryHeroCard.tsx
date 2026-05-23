import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Check, VolumeX, Moon } from "lucide-react";
import { DreamEntry } from "@/types/dream";
import { useInViewAutoplay } from "@/hooks/useInViewAutoplay";

interface Props {
  dream: DreamEntry;
  inList: boolean;
  onToggleList: (id: string) => void;
}

const SLIDE_MS = 3500;

const CategoryHeroCard: React.FC<Props> = ({ dream, inList, onToggleList }) => {
  const navigate = useNavigate();
  const { ref, inView } = useInViewAutoplay<HTMLDivElement>(0.5);

  const videoUrl = dream.video_url;
  const images = useMemo(() => {
    const list: string[] = [];
    const sections = (dream.section_images || []) as Array<{ image_url?: string }>;
    sections.forEach((s) => s.image_url && list.push(s.image_url));
    const primary = dream.generatedImage || dream.image_url;
    if (primary && !list.includes(primary)) list.unshift(primary);
    return list;
  }, [dream]);

  const hasVideo = !!videoUrl;
  const hasSlideshow = !hasVideo && images.length > 1;
  const hasSingle = !hasVideo && !hasSlideshow && images.length === 1;

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (!hasSlideshow || !inView) return;
    const id = window.setInterval(() => setSlide((i) => (i + 1) % images.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [hasSlideshow, inView, images.length]);

  const open = () => {
    const from = window.location.pathname + window.location.search;
    navigate(`/lucid-repo/${dream.id}?from=${encodeURIComponent(from)}`);
  };

  const description = dream.content?.trim().slice(0, 180) || "";

  return (
    <article ref={ref} className="mb-8 stable-card">
      <div
        className="relative w-full aspect-[4/5] overflow-hidden rounded-lg bg-muted cursor-pointer"
        onClick={open}
      >
        {hasVideo ? (
          <video
            key={videoUrl}
            src={videoUrl}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay={inView}
            preload="none"
          />
        ) : hasSlideshow ? (
          images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                i === slide ? "opacity-100" : "opacity-0"
              }`}
              style={i === slide ? { animation: "kenburns 8s ease-out forwards" } : undefined}
            />
          ))
        ) : hasSingle ? (
          <img src={images[0]} alt={dream.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Moon className="h-16 w-16 text-foreground/40" />
          </div>
        )}

        {hasVideo && (
          <div className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-background/60 flex items-center justify-center">
            <VolumeX className="h-3.5 w-3.5 text-foreground" />
          </div>
        )}
      </div>

      <div className="px-1 pt-3">
        <h2 className="text-3xl font-black uppercase tracking-tight text-foreground leading-none mb-3">
          {dream.title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground leading-snug mb-4 line-clamp-3">
            {description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={open}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-md bg-foreground text-background font-bold hover:opacity-90 transition-opacity"
          >
            <Play className="h-5 w-5 fill-current" />
            Read
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleList(dream.id); }}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-md bg-muted text-foreground font-semibold hover:bg-muted/70 transition-colors"
          >
            {inList ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            My List
          </button>
        </div>
      </div>
    </article>
  );
};

export default CategoryHeroCard;