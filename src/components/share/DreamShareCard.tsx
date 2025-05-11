
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";
import { elementToPngBlob, shareDream } from "@/utils/shareUtils";
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

  // Extract dream content for display
  const dreamContent = dream.content || "No dream content recorded.";
  
  // Get the dream image
  const dreamImageUrl = dream.generatedImage || dream.image_url || null;
  // Only use placeholder if absolutely no image is available
  const placeholderImageUrl = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop";

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
        
        {/* Dream Story - 32px in semi-transparent container */}
        <div className="mb-[60px] bg-white/20 p-8 rounded-2xl">
          <p className="text-[32px] leading-normal text-white text-left dream-text-container">
            {dreamContent}
          </p>
        </div>
        
        {/* Dream Analysis - if it exists */}
        {dream.analysis && (
          <div className="mb-[60px]">
            <div className="border-l-[2px] border-purple-300 pl-[20px]">
              <p className="text-[28px] italic text-white/90 text-left dream-analysis-container">
                {dream.analysis}
              </p>
            </div>
          </div>
        )}
        
        {/* Dream Visualization - full width with rounded corners */}
        <div className="mb-[60px] flex items-center justify-center">
          <div className="w-full overflow-hidden rounded-[24px] shadow-inner relative">
            {dreamImageUrl ? (
              <img 
                src={dreamImageUrl}
                alt="Dream Visualization"
                className="w-full object-cover dream-image-container"
                style={{ maxHeight: '500px' }}
                crossOrigin="anonymous"
                onError={(e) => {
                  console.log("Dream image failed to load, using placeholder");
                  e.currentTarget.src = placeholderImageUrl;
                }}
              />
            ) : (
              <div className="w-full h-[400px] bg-gradient-to-br from-purple-600/60 to-blue-500/60 flex items-center justify-center">
                <span className="text-[32px] text-white font-medium">Dream Visualization</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with CTA - 120px tall purple bar */}
        <div className="mt-auto bg-[#9F8FD9] h-[120px] mx-[-80px] px-[80px] flex items-center justify-between">
          {/* Left: App Icon */}
          <div className="w-[32px] h-[32px] rounded-lg bg-white/90"></div>
          
          {/* Center: Download Text */}
          <div className="text-[28px] font-bold text-white">
            Download Lucid Repo
          </div>
          
          {/* Right: QR Code Placeholder */}
          <div className="flex items-center justify-center">
            <QrCode size={32} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
});

DreamShareCard.displayName = "DreamShareCard";
export default DreamShareCard;
