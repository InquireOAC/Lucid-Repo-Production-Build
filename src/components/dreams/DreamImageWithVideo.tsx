import React, { useState, useRef, useCallback } from 'react';
import { Heart, Video, Lock, Download } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  dreamContent?: string;
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
  dreamContent,
}: DreamImageWithVideoProps) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  const lastTapRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsPressing(false);
  }, []);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setIsPressing(true);
    longPressTimer.current = setTimeout(() => {
      setShowMobileMenu(true);
      setIsPressing(false);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      clearLongPress();
    }
  };

  const handleTouchEnd = () => {
    clearLongPress();
    handleDoubleTap({ stopPropagation: () => {} } as any);
  };

  // Desktop right-click fallback
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMobileMenu(true);
  };

  const handleSaveImage = () => {
    setShowMobileMenu(false);
    shareOrSaveImage(generatedImage, 'dream-visualization');
  };

  return (
    <>
      <div
        className="relative cursor-pointer select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        onClick={videoUrl ? togglePlayPause : undefined}
        style={{
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'pan-y',
          transform: isPressing ? 'scale(0.97)' : 'scale(1)',
          transition: 'transform 0.2s ease-out',
        }}
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
            className="rounded-md w-full h-auto pointer-events-none"
            draggable={false}
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

      {/* Mobile / desktop action drawer */}
      <Drawer open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Image Actions</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-1 px-4 pb-6">
            {isOwner && !videoUrl && (
              isSubscribed ? (
                <button
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted/50 transition-colors text-left"
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowVideoDialog(true);
                  }}
                >
                  <Video className="h-5 w-5 text-primary" />
                  <span className="font-medium">Generate Video</span>
                </button>
              ) : (
                <button
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground cursor-not-allowed text-left"
                  disabled
                >
                  <Lock className="h-5 w-5" />
                  <span className="font-medium">Generate Video (Subscribe)</span>
                </button>
              )
            )}
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted/50 transition-colors text-left"
              onClick={handleSaveImage}
            >
              <Download className="h-5 w-5 text-primary" />
              <span className="font-medium">Save Image</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {dreamId && (
        <GenerateVideoDialog
          open={showVideoDialog}
          onOpenChange={setShowVideoDialog}
          dreamId={dreamId}
          imageUrl={generatedImage}
          onVideoGenerated={onVideoGenerated}
          dreamContent={dreamContent}
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
