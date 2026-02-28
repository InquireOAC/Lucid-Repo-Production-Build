import React, { useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";
import { shareDream } from "@/utils/shareUtils";

// Define a ref type that exposes the share function
export interface DreamShareCardRef {
  shareDream: () => Promise<boolean>;
}

interface DreamShareCardProps {
  dream: DreamEntry;
  onShareStart?: () => void;
  onShareComplete?: (success: boolean) => void;
}

/* ── colour tokens matching auth page cosmic blue palette ── */
const C = {
  bg: "#060B18",
  primary: "#3B82F6",
  primaryGlow: "rgba(56,130,246,0.25)",
  accent: "#2563EB",
  text: "#E2E8F0",
  muted: "#64748B",
  surfaceBorder: "rgba(56,130,246,0.12)",
  surface: "rgba(56,130,246,0.06)",
} as const;

const DreamShareCard = forwardRef<DreamShareCardRef, DreamShareCardProps>(({
  dream,
  onShareStart,
  onShareComplete
}, ref) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    console.log("DreamShareCard rendering with dream:", dream);
    console.log("DreamShareCard image URL:", dream.image_url || dream.generatedImage);
  }, [dream]);
  
  useImperativeHandle(ref, () => ({
    shareDream: async () => {
      if (!shareCardRef.current) return false;
      
      if (onShareStart) onShareStart();
      
      if (imgRef.current && dreamImageUrl && !imgRef.current.complete) {
        console.log("Image not loaded yet, waiting...");
        await new Promise<void>((resolve) => {
          const img = imgRef.current;
          if (!img) { resolve(); return; }
          const onLoad = () => { console.log("Image loaded successfully"); resolve(); };
          const onError = () => { console.log("Image failed to load"); resolve(); };
          img.addEventListener('load', onLoad, { once: true });
          img.addEventListener('error', onError, { once: true });
          if (img.complete) { console.log("Image was already loaded"); resolve(); }
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

  const formattedDate = dream.date 
    ? format(new Date(dream.date), "MMMM d, yyyy")
    : "Unknown Date";

  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text || "";
    return text.substring(0, maxLength) + "...";
  };
  
  const dreamContent = truncateText(dream.content || "No dream content recorded.", 280);
  const dreamImageUrl = dream.image_url || dream.generatedImage || "";
  const truncatedAnalysis = truncateText(dream.analysis || "", 140);
  
  console.log("Dream image in share card:", dreamImageUrl);

  return (
    <div 
      className="fixed left-[-9999px] top-[-9999px] opacity-0 pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: -100 }}
    >
      <div 
        ref={shareCardRef}
        id="dream-share-card" 
        className="w-[1080px] h-[1920px] overflow-hidden"
        style={{
          padding: '80px 80px', 
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          background: `linear-gradient(165deg, ${C.bg} 0%, #0C1629 40%, #111B33 100%)`,
        }}
      >
        {/* Tech grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage: `linear-gradient(rgba(56,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,130,246,0.5) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            pointerEvents: 'none',
          }}
        />
        {/* Top radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '500px',
            background: `radial-gradient(ellipse at center, ${C.primaryGlow} 0%, transparent 70%)`,
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />
        {/* Bottom accent glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            right: '-50px',
            width: '400px',
            height: '400px',
            background: `radial-gradient(ellipse at center, rgba(37,99,235,0.12) 0%, transparent 70%)`,
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        {/* App Name */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '60px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 700,
            color: C.text,
            letterSpacing: '-0.02em',
          }}>
            Lucid Repo
          </h1>
        </div>
        
        {/* Title & Date */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '60px',
            fontWeight: 700,
            lineHeight: 1.1,
            color: '#fff',
            textAlign: 'left',
            letterSpacing: '-0.02em',
          }}>
            {dream.title || "Untitled Dream"}
          </h2>
          <p style={{
            fontSize: '22px',
            color: C.muted,
            marginTop: '12px',
            textAlign: 'left',
          }}>
            {formattedDate}
          </p>
        </div>
        
        {/* Dream Story — glass surface */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          marginBottom: '50px',
          padding: '36px 32px',
          borderRadius: '20px',
          background: C.surface,
          border: `1px solid ${C.surfaceBorder}`,
        }}>
          <p style={{
            fontSize: '30px',
            lineHeight: 1.5,
            color: C.text,
            textAlign: 'left',
          }}>
            {dreamContent}
          </p>
        </div>
        
        {/* Dream Analysis */}
        {truncatedAnalysis && (
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '50px' }}>
            <div style={{
              borderLeft: `3px solid ${C.primary}`,
              paddingLeft: '24px',
            }}>
              <p style={{
                fontSize: '26px',
                fontStyle: 'italic',
                color: 'rgba(226,232,240,0.8)',
                textAlign: 'left',
                lineHeight: 1.5,
              }}>
                {truncatedAnalysis}
              </p>
            </div>
          </div>
        )}
        
        {/* Dream Visualization */}
        {dreamImageUrl && (
          <div style={{ position: 'relative', zIndex: 1, marginBottom: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              overflow: 'hidden',
              borderRadius: '20px',
              border: `1px solid ${C.surfaceBorder}`,
              boxShadow: `0 8px 40px rgba(56,130,246,0.15)`,
            }}>
              <img 
                ref={imgRef}
                src={dreamImageUrl}
                alt="Dream Visualization"
                style={{ 
                  borderRadius: '20px',
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  backgroundColor: C.bg,
                }}
                crossOrigin="anonymous"
                onLoad={() => console.log("Image loaded in ShareCard")}
                onError={(e) => console.error("Image failed to load in ShareCard:", e)}
              />
            </div>
          </div>
        )}
        
        {/* Footer with logo */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '5px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '150px',
            pointerEvents: 'none',
            background: 'none',
          }}
        >
          <img
            src="/lovable-uploads/e94fd126-8216-43a0-a62d-cf081a8c036f.png"
            alt="Lucid Repo Logo and App Store Badge"
            style={{
              width: '825px',
              maxWidth: '90%',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
});

DreamShareCard.displayName = "DreamShareCard";
export default DreamShareCard;
