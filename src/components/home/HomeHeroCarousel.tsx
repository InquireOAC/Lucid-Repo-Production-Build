import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { Play, ChevronRight, Moon, Megaphone, Trophy, Bell, Zap } from "lucide-react";
import { DreamEntry } from "@/types/dream";
import { Challenge } from "@/hooks/useChallenges";
import { Announcement } from "@/hooks/useAnnouncements";
import { cn } from "@/lib/utils";

// ─── types ───────────────────────────────────────────────────────────────────

type Slide =
  | { type: "dream"; dream: DreamEntry }
  | { type: "challenge"; challenge: Challenge }
  | { type: "announcement"; announcement: Announcement };

interface Props {
  heroDream: DreamEntry | null;
  challenges: Challenge[];
  announcements: Announcement[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const AUTO_MS = 5000;
const SWIPE_THRESHOLD = 40;

const pickPoster = (d: DreamEntry): string | undefined => {
  if (d.generatedImage) return d.generatedImage;
  if (d.image_url) return d.image_url;
  return d.section_images?.find((s) => s.image_url)?.image_url;
};

const ANNOUNCE_ICON: Record<string, React.ElementType> = {
  announcement: Megaphone,
  celebration: Trophy,
  reminder: Bell,
  poll: Zap,
};

const ANNOUNCE_GRADIENT: Record<string, string> = {
  announcement: "from-blue-950 via-indigo-900 to-violet-900",
  celebration: "from-amber-950 via-orange-900 to-yellow-800",
  reminder: "from-purple-950 via-violet-900 to-indigo-900",
  poll: "from-teal-950 via-cyan-900 to-sky-900",
};

const ANNOUNCE_ACCENT: Record<string, string> = {
  announcement: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  celebration: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  reminder: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  poll: "bg-teal-500/20 text-teal-300 border-teal-500/30",
};

// ─── slide renderers ──────────────────────────────────────────────────────────

const DreamSlide: React.FC<{ dream: DreamEntry; onNavigate: (url: string) => void }> = ({
  dream,
  onNavigate,
}) => {
  const imageUrl = pickPoster(dream);
  const hasVideo = !!dream.video_url;
  const tag = dream.mood || dream.tags?.[0] || (dream.lucid ? "Lucid" : "Dream");
  const ago = (() => {
    try {
      return formatDistanceToNow(new Date(dream.created_at || dream.date), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  return (
    <>
      {hasVideo ? (
        <video
          key={dream.video_url}
          src={dream.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          muted loop playsInline autoPlay preload="metadata"
          poster={imageUrl}
        />
      ) : imageUrl ? (
        <img src={imageUrl} alt={dream.title} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
          <Moon className="h-20 w-20 text-white/30" />
        </div>
      )}

      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-10 px-5 z-10">
        <div className="flex items-center gap-2 mb-2 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wider text-[9px]">
            {tag}
          </span>
          {ago && <span className="text-white/60">{ago}</span>}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2 mb-3 drop-shadow-md">
          {dream.title || "Untitled dream"}
        </h1>
        <div className="flex items-center gap-2">
          {hasVideo && (
            <button
              type="button"
              onMouseUp={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onNavigate(`/journal/edit/${dream.id}?play=1`); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
            >
              <Play className="h-4 w-4 fill-current" />
              Watch
            </button>
          )}
          <button
            type="button"
            onMouseUp={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onNavigate(`/journal/edit/${dream.id}`); }}
            className={cn(
              "flex items-center gap-1 px-4 py-2 rounded-full font-semibold text-sm transition-colors",
              hasVideo
                ? "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
                : "bg-white text-black hover:bg-white/90",
            )}
          >
            Open <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
};

const ChallengeSlide: React.FC<{ challenge: Challenge; onNavigate: (url: string) => void }> = ({
  challenge,
  onNavigate,
}) => {
  const dateRange = (() => {
    try {
      return `${format(new Date(challenge.start_date), "MMM d")} – ${format(new Date(challenge.end_date), "MMM d, yyyy")}`;
    } catch {
      return "";
    }
  })();

  return (
    <>
      {challenge.banner_image_url ? (
        <img
          src={challenge.banner_image_url}
          alt={challenge.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-900">
          <div className="absolute -top-20 -right-10 w-80 h-80 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>
      )}

      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-10 px-5 z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded border bg-violet-500/20 text-violet-300 border-violet-500/30 text-[9px] font-semibold uppercase tracking-wider">
            <Zap className="h-2.5 w-2.5" /> Challenge
          </span>
          {dateRange && <span className="text-white/60 text-[11px]">{dateRange}</span>}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2 mb-2 drop-shadow-md">
          {challenge.title}
        </h1>
        {challenge.description && (
          <p className="text-sm text-white/70 line-clamp-2 mb-3">{challenge.description}</p>
        )}
        {challenge.required_tag && (
          <button
            type="button"
            onMouseUp={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onNavigate("/lucid-repo"); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm font-semibold text-sm transition-colors"
          >
            Tag {challenge.required_tag} to enter <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </>
  );
};

const AnnouncementSlide: React.FC<{ announcement: Announcement }> = ({ announcement }) => {
  const Icon = ANNOUNCE_ICON[announcement.type] || Megaphone;
  const gradient = ANNOUNCE_GRADIENT[announcement.type] || ANNOUNCE_GRADIENT.announcement;
  const accent = ANNOUNCE_ACCENT[announcement.type] || ANNOUNCE_ACCENT.announcement;

  return (
    <>
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)}>
        <div className="absolute -top-20 -right-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />

      <div className="absolute inset-x-0 bottom-10 px-5 z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wider", accent)}>
            <Icon className="h-2.5 w-2.5" />
            {announcement.type}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2 mb-2 drop-shadow-md">
          {announcement.title}
        </h1>
        {announcement.content && (
          <p className="text-sm text-white/75 line-clamp-3 mb-3">{announcement.content}</p>
        )}
        {announcement.link_url && (
          <a
            href={announcement.link_url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm font-semibold text-sm transition-colors"
          >
            Learn More <ChevronRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </>
  );
};

// ─── main carousel ────────────────────────────────────────────────────────────

const HomeHeroCarousel: React.FC<Props> = ({ heroDream, challenges, announcements }) => {
  const navigate = useNavigate();

  const slides: Slide[] = useMemo(() => {
    const s: Slide[] = [];
    if (heroDream) s.push({ type: "dream", dream: heroDream });

    const now = new Date();
    for (const c of challenges) {
      if (c.status !== "active") continue;
      if (new Date(c.end_date) < now) continue;
      s.push({ type: "challenge", challenge: c });
    }

    for (const a of announcements.filter((x) => x.type !== "poll").slice(0, 3)) {
      s.push({ type: "announcement", announcement: a });
    }

    return s;
  }, [heroDream, challenges, announcements]);

  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const safeIndex = slides.length > 0 ? Math.min(index, slides.length - 1) : 0;

  const goto = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length);
  const next = () => goto(safeIndex + 1);
  const prev = () => goto(safeIndex - 1);

  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (slides.length > 1) {
      autoRef.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_MS);
    }
  };

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [slides.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = false;
    if (autoRef.current) clearInterval(autoRef.current);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) { delta < 0 ? next() : prev(); }
    touchStartX.current = null;
    resetAuto();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    isDragging.current = false;
    if (autoRef.current) clearInterval(autoRef.current);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (touchStartX.current !== null && Math.abs(e.clientX - touchStartX.current) > 5) {
      isDragging.current = true;
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) { delta < 0 ? next() : prev(); }
    touchStartX.current = null;
    resetAuto();
  };

  if (slides.length === 0) return null;

  const slide = slides[safeIndex];

  return (
    <div
      className="relative -mx-4 sm:-mx-6 md:mx-0 mb-4 md:rounded-2xl overflow-hidden stable-card select-none cursor-grab active:cursor-grabbing"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div className="relative aspect-[3/4] md:aspect-[21/9]">
        {slide.type === "dream" && (
          <DreamSlide
            dream={slide.dream}
            onNavigate={(url) => { if (!isDragging.current) navigate(url); }}
          />
        )}
        {slide.type === "challenge" && (
          <ChallengeSlide
            challenge={slide.challenge}
            onNavigate={(url) => { if (!isDragging.current) navigate(url); }}
          />
        )}
        {slide.type === "announcement" && (
          <AnnouncementSlide announcement={slide.announcement} />
        )}
      </div>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-20 pointer-events-none">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => { e.stopPropagation(); goto(i); resetAuto(); }}
              className={cn(
                "rounded-full transition-all duration-300 pointer-events-auto",
                i === safeIndex
                  ? "w-5 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60",
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeHeroCarousel;
