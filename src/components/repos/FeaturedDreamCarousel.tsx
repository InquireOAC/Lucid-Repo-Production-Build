import React, { useRef, useState, useCallback, useEffect } from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import FeaturedDream from "./FeaturedDream";

interface FeaturedDreamCarouselProps {
  dreams: DreamEntry[];
  tags: DreamTag[];
  onLike: (dreamId: string) => void;
  onOpenDream: (dream: DreamEntry) => void;
  onUserClick: (username: string | undefined) => void;
  currentUser?: any;
}

const FeaturedDreamCarousel: React.FC<FeaturedDreamCarouselProps> = ({
  dreams,
  tags,
  onLike,
  onOpenDream,
  onUserClick,
  currentUser,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(idx);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (dreams.length === 0) return null;

  return (
    <div className="mb-6">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4"
        style={{ scrollbarWidth: "none" }}
      >
        {dreams.map((dream) => (
          <div key={dream.id} className="w-full flex-shrink-0 snap-start">
            <FeaturedDream
              dream={dream}
              tags={tags}
              onLike={onLike}
              onOpenDream={onOpenDream}
              onUserClick={onUserClick}
              currentUser={currentUser}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {dreams.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {dreams.map((_, i) => (
            <button
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              }`}
              onClick={() => {
                scrollRef.current?.scrollTo({
                  left: i * (scrollRef.current?.clientWidth ?? 0),
                  behavior: "smooth",
                });
              }}
              aria-label={`Go to featured dream ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedDreamCarousel;
