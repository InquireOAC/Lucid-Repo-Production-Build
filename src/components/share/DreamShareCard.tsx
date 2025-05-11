
import React, { useRef, forwardRef, useImperativeHandle } from "react";
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
  
  // Expose the shareDream method via ref
  useImperativeHandle(ref, () => ({
    shareDream: async () => {
      if (!shareCardRef.current) return false;
      
      if (onShareStart) onShareStart();
      
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
  
  // Get the dream image - use generatedImage, image_url, or imageUrl properties
  const dreamImageUrl = dream.generatedImage || dream.image_url || "";
  
  // Truncate analysis to shorter length
  const truncatedAnalysis = truncateText(dream.analysis || "", 140);

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
          position: 'relative'
        }}
      >
        {/* App Name at the top - 48px bold white centered */}
        <div className="flex items-center justify-center mb-[60px]">
          <h1 className="text-[48px] font-bold text-white tracking-tight">
            Lucid Repo
          </h1>
        </div>
        
        {/* Title & Date - title 64px bold, date 24px at 50% opacity */}
        <div className="mb-[60px]">
          <h2 className="text-[64px] font-bold leading-tight text-white text-left">
            {dream.title || "Untitled Dream"}
          </h2>
          <p className="text-[24px] text-white/50 mt-2 text-left">
            {formattedDate}
          </p>
        </div>
        
        {/* Dream Story - 32px in semi-transparent container, height adjusts to fit content */}
        <div className="mb-[60px] bg-white/20 p-8 rounded-2xl">
          <p className="text-[32px] leading-normal text-white text-left">
            {dreamContent}
          </p>
        </div>
        
        {/* Dream Analysis - if it exists, height adjusts to fit content */}
        {truncatedAnalysis && (
          <div className="mb-[60px]">
            <div className="border-l-[2px] border-purple-300 pl-[20px]">
              <p className="text-[28px] italic text-white/90 text-left">
                {truncatedAnalysis}
              </p>
            </div>
          </div>
        )}
        
        {/* Dream Visualization - full width with rounded corners */}
        {dream.generatedImage && (
          <div className="mb-[60px] flex items-center justify-center">
            <div className="w-full overflow-hidden rounded-[24px] shadow-lg relative">
              <img 
                src={dream.generatedImage}
                alt="Dream Visualization"
                className="w-full object-cover dream-image-container"
                style={{ 
                  borderRadius: '24px',
                  boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.3)'
                }}
                crossOrigin="anonymous"
              />
            </div>
          </div>
        )}
        
        {/* Footer with CTA - 120px tall purple bar */}
        <div 
          className="mt-auto bg-[#9F8FD9] h-[120px] mx-[-80px] flex items-center justify-between px-[40px]" 
          style={{ 
            marginBottom: '-80px',
            boxSizing: 'content-box'
          }}
        >
          {/* Left: App Icon */}
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/75f9ca02-53e1-46b7-9296-dc40e6ad23fe.png" 
              alt="Lucid Repo Logo" 
              className="w-[125px] h-[125px]" 
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
          
          {/* Center: Download Text */}
          <div className="flex-1 flex justify-center">
           <div className="text-[64px] font-bold text-white">
             Download Lucid Repo
          </div>
        </div>
          
          {/* Right: QR Code */}
          <div className="flex items-center justify-center">
            <QrCode size={72} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
});

DreamShareCard.displayName = "DreamShareCard";
export default DreamShareCard;
