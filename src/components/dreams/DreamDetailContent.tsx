
import React, { useState, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { DreamTag } from "@/types/dream";
import { Heart } from "lucide-react";
import FlagButton from "@/components/moderation/FlagButton";
import { AudioPlayer } from "./AudioPlayer";

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

  // Handle double tap to like on image
  const handleImageDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      e.stopPropagation();
      if (currentUser && onLike) {
        onLike();
        setIsLikeAnimating(true);
        setTimeout(() => setIsLikeAnimating(false), 600);
      }
    }
    
    lastTapRef.current = now;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleImageDoubleTap(e);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleImageDoubleTap(e);
  };

  return (
    <div className="space-y-4 mt-2">
      {/* Flag Button */}
      {showFlagButton && dreamId && contentOwnerId && (
        <div className="flex justify-end">
          <FlagButton
            contentType="dream"
            contentId={dreamId}
            contentOwnerId={contentOwnerId}
            size="sm"
          />
        </div>
      )}
      
      {/* Content */}
      <div className="text-sm whitespace-pre-wrap">{content}</div>
      
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

      {/* Dream Image with double tap to like */}
      {generatedImage && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Dream Visualization</h3>
          <div 
            className="relative cursor-pointer select-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <img 
              src={generatedImage} 
              alt="Dream visualization" 
              className="rounded-md w-full h-auto"
            />
            
            {/* Like animation overlay */}
            {isLikeAnimating && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart 
                  className="h-16 w-16 text-red-500 fill-red-500 animate-pulse"
                  style={{ 
                    transform: 'scale(1.5)',
                    animation: 'heartPulse 0.6s ease-out'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio Recording */}
      {audioUrl && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Audio Recording</h3>
          <AudioPlayer 
            audioUrl={audioUrl} 
            title="Dream Recording"
            compact
          />
        </div>
      )}

      {/* Dream Analysis */}
      {analysis && (
        <div className="mt-4 p-3 bg-muted/40 rounded-md">
          <h3 className="text-sm font-medium mb-1">Dream Analysis</h3>
          <div className="text-sm text-muted-foreground">{analysis}</div>
        </div>
      )}

      <style>{`
        @keyframes heartPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DreamDetailContent;
