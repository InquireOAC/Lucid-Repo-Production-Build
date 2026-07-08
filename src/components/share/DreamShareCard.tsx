import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { DreamEntry } from "@/types/dream";
import { shareDream } from "@/utils/shareUtils";

export interface DreamShareCardRef {
  shareDream: () => Promise<boolean>;
}

interface DreamShareCardProps {
  dream: DreamEntry;
  onShareStart?: () => void;
  onShareComplete?: (success: boolean) => void;
}

const DreamShareCard = forwardRef<DreamShareCardRef, DreamShareCardProps>(({
  dream,
  onShareStart,
  onShareComplete
}, ref) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useImperativeHandle(ref, () => ({
    shareDream: async () => {
      if (!shareCardRef.current) return false;
      if (onShareStart) onShareStart();

      if (imgRef.current && dreamImageUrl && !imgRef.current.complete) {
        await new Promise<void>((resolve) => {
          const img = imgRef.current;
          if (!img) { resolve(); return; }
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
          if (img.complete) resolve();
        });
      }

      const success = await shareDream(
        shareCardRef.current,
        dream.title || "My Dream",
        `Check out my dream from Lucid Repo: ${dream.title}`
      );
      if (onShareComplete) onShareComplete(success);
      return success;
    }
  }));

  const dreamImageUrl = dream.image_url || dream.generatedImage || "";
  const formattedDate = dream.date
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dream.date))
    : "";
  const excerpt = (dream.content || "").length > 150
    ? (dream.content || "").substring(0, 150) + "..."
    : (dream.content || "");

  return (
    <div
      className="fixed left-[-9999px] top-[-9999px] opacity-0 pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: -100 }}
    >
      <div
        ref={shareCardRef}
        id="dream-share-card"
        style={{
          width: '1080px',
          height: '1920px',
          position: 'relative',
          overflow: 'hidden',
          background: '#060B18',
        }}
      >
        {/* Full-bleed dream image or fallback */}
        {dreamImageUrl ? (
          <img
            ref={imgRef}
            src={dreamImageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          /* Cosmic fallback */
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(165deg, #060B18 0%, #0C1629 40%, #111B33 100%)',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.06,
              backgroundImage: 'radial-gradient(1.5px 1.5px at 15% 25%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 75% 15%, rgba(255,255,255,0.4) 0%, transparent 100%), radial-gradient(2px 2px at 50% 55%, rgba(96,165,250,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 85% 70%, rgba(255,255,255,0.3) 0%, transparent 100%), radial-gradient(1.5px 1.5px at 30% 80%, rgba(139,92,246,0.5) 0%, transparent 100%)',
            }} />
            <div style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              height: '600px',
              background: 'radial-gradient(ellipse at center, rgba(56,130,246,0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }} />
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '65%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.92) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Frosted glass text panel */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 72px 80px 72px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          minHeight: '45%',
        }}>
          {/* Label */}
          <div style={{
            fontSize: '20px',
            letterSpacing: '6px',
            textTransform: 'uppercase' as const,
            color: 'rgba(96,165,250,0.7)',
            fontFamily: 'monospace',
            marginBottom: '24px',
          }}>
            ✦ DREAM JOURNAL ✦
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '64px',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
          }}>
            {dream.title || "Untitled Dream"}
          </h2>

          {/* Date */}
          <p style={{
            fontSize: '24px',
            color: 'rgba(226,232,240,0.5)',
            marginBottom: '36px',
            fontFamily: 'monospace',
            letterSpacing: '1px',
          }}>
            {formattedDate}
          </p>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, rgba(96,165,250,0.5), rgba(139,92,246,0.3), transparent)',
            marginBottom: '32px',
          }} />

          {/* Excerpt */}
          <p style={{
            fontSize: '32px',
            lineHeight: 1.6,
            color: 'rgba(226,232,240,0.8)',
            marginBottom: '48px',
          }}>
            {excerpt}
          </p>

          {/* Logo / branding */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src="/lovable-uploads/e94fd126-8216-43a0-a62d-cf081a8c036f.png"
              alt="Lucid Repo"
              style={{ width: '700px', height: 'auto', objectFit: 'contain', display: 'block' }}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

DreamShareCard.displayName = "DreamShareCard";
export default DreamShareCard;
