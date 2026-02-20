
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { DreamTag } from "@/types/dream";
import { Heart } from "lucide-react";
import FlagButton from "@/components/moderation/FlagButton";
import { AudioPlayer } from "./AudioPlayer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

// Split text into pages at sentence boundaries
function splitTextIntoPages(text: string, maxChars = 500): string[] {
  if (text.length <= maxChars) return [text];

  const sentences = text.split(/(?<=[.!?]\s)|(?<=\n)/);
  const pages: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxChars && current.length > 0) {
      pages.push(current.trimEnd());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) pages.push(current.trimEnd());
  return pages.length ? pages : [text];
}

// Dot indicators
function PaginationDots({ count, active }: { count: number; active: number }) {
  if (count <= 1) return null;
  return (
    <div className="flex justify-center gap-1.5 pt-2">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`inline-block rounded-full transition-colors ${
            i === active
              ? 'bg-primary w-2 h-2'
              : 'bg-muted-foreground/30 w-1.5 h-1.5'
          }`}
        />
      ))}
    </div>
  );
}

// Paginated text block
function PaginatedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const pages = splitTextIntoPages(text);
  const [api, setApi] = useState<CarouselApi>();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActive(api.selectedScrollSnap());
    api.on('select', onSelect);
    return () => { api.off('select', onSelect); };
  }, [api]);

  if (pages.length === 1) {
    return <div className={className}>{text}</div>;
  }

  return (
    <div>
      <Carousel opts={{ watchDrag: true }} setApi={setApi}>
        <CarouselContent>
          {pages.map((page, i) => (
            <CarouselItem key={i}>
              <div className={`${className} max-h-[200px] overflow-hidden`}>
                {page}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <PaginationDots count={pages.length} active={active} />
    </div>
  );
}

interface DreamDetailContentProps {
  content: string;
  formattedDate: string;
  dreamTags: DreamTag[];
  generatedImage?: string;
  analysis?: string;
  showFlagButton?: boolean;
  dreamId?: string;
  contentOwnerId?: string;
  onLike?: () => void;
  currentUser?: any;
  audioUrl?: string;
}

const DreamDetailContent = ({
  content,
  formattedDate,
  dreamTags,
  generatedImage,
  analysis,
  showFlagButton,
  dreamId,
  contentOwnerId,
  onLike,
  currentUser,
  audioUrl
}: DreamDetailContentProps) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const lastTapRef = useRef<number>(0);

  const handleImageDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      e.stopPropagation();
      if (currentUser && onLike) {
        onLike();
        setIsLikeAnimating(true);
        setTimeout(() => setIsLikeAnimating(false), 600);
      }
    }
    lastTapRef.current = now;
  };

  return (
    <div className="space-y-4 mt-2">
      {showFlagButton && dreamId && contentOwnerId && (
        <div className="flex justify-end">
          <FlagButton contentType="dream" contentId={dreamId} contentOwnerId={contentOwnerId} size="sm" />
        </div>
      )}

      {/* Paginated Content */}
      <PaginatedText text={content} className="text-sm whitespace-pre-wrap" />

      {/* Tags */}
      {dreamTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-4">
          {dreamTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color + "40", color: tag.color }}
              className="text-xs font-normal border"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Dream Image */}
      {generatedImage && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Dream Visualization</h3>
          <div
            className="relative cursor-pointer select-none"
            onMouseDown={handleImageDoubleTap}
            onTouchStart={handleImageDoubleTap}
          >
            <img src={generatedImage} alt="Dream visualization" className="rounded-md w-full h-auto" />
            {isLikeAnimating && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart className="h-16 w-16 text-red-500 fill-red-500" style={{ animation: 'heartPulse 0.6s ease-out' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio */}
      {audioUrl && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Audio Recording</h3>
          <AudioPlayer audioUrl={audioUrl} title="Dream Recording" compact />
        </div>
      )}

      {/* Paginated Analysis */}
      {analysis && (
        <div className="mt-4 p-3 bg-muted/40 rounded-md">
          <h3 className="text-sm font-medium mb-1">Dream Analysis</h3>
          <PaginatedText text={analysis} className="text-sm text-muted-foreground" />
        </div>
      )}

      <style>{`
        @keyframes heartPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default DreamDetailContent;
