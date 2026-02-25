import React, { useState, useRef } from 'react';
import { Heart, Video, Lock, Download, Share2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { GenerateVideoDialog } from "./GenerateVideoDialog";
import { shareOrSaveImage } from "@/utils/shareOrSaveImage";

interface DreamImageWithVideoProps {
  generatedImage: string;
  videoUrl?: string;
  dreamId?: string;
  isOwner?: boolean;
  isSubscribed?: boolean;
  onLike?: () => void;
  currentUser?: any;
  onVideoGenerated?: (videoUrl: string) => void;
}

const DreamImageWithVideo = ({
  generatedImage,
  videoUrl,
  dreamId,
  isOwner,
  isSubscribed,
  onLike,
  currentUser,
  onVideoGenerated,
}: DreamImageWithVideoProps) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const lastTapRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
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

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const handleSaveImage = () => {
    shareOrSaveImage(generatedImage, 'dream-visualization');
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="relative cursor-pointer select-none"
            onMouseDown={handleDoubleTap}
            onTouchStart={handleDoubleTap}
            onClick={videoUrl ? togglePlayPause : undefined}
          >
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                poster={generatedImage}
                autoPlay
                loop
                muted
                playsInline
                className="rounded-md w-full h-auto"
              />
            ) : (
              <img
                src={generatedImage}
                alt="Dream visualization"
                className="rounded-md w-full h-auto"
              />
            )}
            {isLikeAnimating && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Heart
                  className="h-16 w-16 text-destructive fill-destructive"
                  style={{ animation: 'heartPulse 0.6s ease-out' }}
                />
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {isOwner && !videoUrl && (
            <>
              {isSubscribed ? (
                <ContextMenuItem onClick={() => setShowVideoDialog(true)}>
                  <Video className="mr-2 h-4 w-4" />
                  Generate Video
                </ContextMenuItem>
              ) : (
                <ContextMenuItem disabled>
                  <Lock className="mr-2 h-4 w-4" />
                  Generate Video (Subscribe)
                </ContextMenuItem>
              )}
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem onClick={handleSaveImage}>
            <Download className="mr-2 h-4 w-4" />
            Save Image
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {dreamId && (
        <GenerateVideoDialog
          open={showVideoDialog}
          onOpenChange={setShowVideoDialog}
          dreamId={dreamId}
          imageUrl={generatedImage}
          onVideoGenerated={onVideoGenerated}
        />
      )}

      <style>{`
        @keyframes heartPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default DreamImageWithVideo;
