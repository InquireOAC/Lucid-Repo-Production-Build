import React, { useRef, useCallback } from "react";
import { shareOrSaveImage } from "@/utils/shareOrSaveImage";
import { toast } from "sonner";

export const suppressNativeStyle: React.CSSProperties = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  userSelect: 'none',
};

export function useLongPressSave(imageUrl: string | undefined | null, filename?: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!imageUrl) return;
      firedRef.current = false;
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      timerRef.current = setTimeout(async () => {
        firedRef.current = true;
        try {
          await shareOrSaveImage(imageUrl, filename || "dream-image.png");
        } catch {
          toast.error("Failed to save image");
        }
      }, 500);
    },
    [imageUrl, filename]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartPos.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartPos.current.x;
      const dy = touch.clientY - touchStartPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        clear();
      }
    },
    [clear]
  );

  const onTouchEnd = useCallback(() => {
    clear();
  }, [clear]);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!imageUrl) return;
      e.preventDefault();
      shareOrSaveImage(imageUrl, filename || "dream-image.png").catch(() =>
        toast.error("Failed to save image")
      );
    },
    [imageUrl, filename]
  );

  return { onTouchStart, onTouchMove, onTouchEnd, onContextMenu, firedRef };
}
