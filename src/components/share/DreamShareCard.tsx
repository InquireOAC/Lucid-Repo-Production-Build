import React, { useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";
import { shareDream } from "@/utils/shareUtils";
import { QrCode } from "lucide-react";

// Define a ref type that exposes the share function
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
  
  // Log when the component renders with the current dream data
  useEffect(() => {
    console.log("DreamShareCard rendering with dream:", dream);
    console.log("DreamShareCard image URL:", dream.image_url || dream.generatedImage);
  }, [dream]);
  
  // Expose the shareDream method via ref
  useImperativeHandle(ref, () => ({
    shareDream: async () => {
      if (!shareCardRef.current) return false;
      
      if (onShareStart) onShareStart();
      
      // Ensure image has loaded before proceeding
      if (imgRef.current && dreamImageUrl && !imgRef.current.complete) {
        console.log("Image not loaded yet, waiting...");
        await new Promise<void>((resolve) => {
          const img = imgRef.current;
          if (!img) {
            resolve();
            return;
          }
          
          const onLoad = () => {
            console.log("Image loaded successfully");
            resolve();
          };
          
          const onError = () => {
            console.log("Image failed to load");
            resolve();
          };
          
          img.addEventListener('load', onLoad, { once: true });
          img.addEventListener('error', onError, { once: true });
          
          // If already complete, resolve immediately
          if (img.complete) {
            console.log("Image was already loaded");
            resolve();
          }
        });
      }
      
      // Process share card using the shareDream utility
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

  // Truncate dream content for display (limit to around 280 characters with ellipsis)
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text || "";
    return text.substring(0, maxLength) + "...";
  };
  
  // Extract dream content for display - truncated
  const dreamContent = truncateText(dream.content || "No dream content recorded.", 280);
  
  // Prioritize image_url (Supabase bucket) over generatedImage (temporary URL)
  const dreamImageUrl = dream.image_url || dream.generatedImage || "";
  
  // Truncate analysis to shorter length
  const truncatedAnalysis = truncateText(dream.analysis || "", 140);
  
  // Log the image URL for debugging
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
          background: 'linear-gradient(to bottom, #6344A5, #8976BF)'
        }}
      >
        {/* App Name at the top */}
        <div className="flex items-center justify-center mb-[60px]">
          <h1 className="text-[48px] font-bold text-white tracking-tight">
            Lucid Repo
          </h1>
        </div>
        
        {/* Title & Date */}
        <div className="mb-[60px]">
          <h2 className="text-[64px] font-bold leading-tight text-white text-left">
            {dream.title || "Untitled Dream"}
          </h2>
          <p className="text-[24px] text-white/50 mt-2 text-left">
            {formattedDate}
          </p>
        </div>
        
        {/* Dream Story */}
        <div className="mb-[60px] bg-white/20 p-8 rounded-2xl">
          <p className="text-[32px] leading-normal text-white text-left">
            {dreamContent}
          </p>
        </div>
        
        {/* Dream Analysis */}
        {truncatedAnalysis && (
          <div className="mb-[60px]">
            <div className="border-l-[2px] border-purple-300 pl-[20px]">
              <p className="text-[28px] italic text-white/90 text-left">
                {truncatedAnalysis}
              </p>
            </div>
          </div>
        )}
        
        {/* Dream Visualization */}
        {dreamImageUrl && (
          <div className="mb-[60px] flex items-center justify-center">
            <div className="w-half overflow-hidden rounded-[24px] shadow-lg relative bg-[#8976BF]">
              <img 
                ref={imgRef}
                src={dreamImageUrl}
                alt="Dream Visualization"
                className="w-half object-cover dream-image-container"
                style={{ 
                  borderRadius: '24px',
                  boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.3)',
                  maxHeight: '800px',
                  backgroundColor: '#8976BF'
                }}
                crossOrigin="anonymous"
                onLoad={() => console.log("Image loaded in ShareCard")}
                onError={(e) => console.error("Image failed to load in ShareCard:", e)}
              />
            </div>
          </div>
        )}
        
        {/* --- Footer with uploaded logo image - increased by 25px --- */}
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
            borderRadius: 0,
            boxShadow: 'none',
          }}
        >
          <img
            src="/lovable-uploads/e94fd126-8216-43a0-a62d-cf081a8c036f.png"
            alt="Lucid Repo Logo and App Store Badge"
            style={{
              width: '825px', // Increased from 800px by 25px
              maxWidth: '90%',
              height: 'auto',
              objectFit: 'contain',
              margin: 0,
              background: 'none',
              borderRadius: 0,
              boxShadow: 'none',
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
