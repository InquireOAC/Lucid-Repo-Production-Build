
import React, { useRef, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";
import { elementToPngBlob, downloadImage } from "@/utils/shareUtils";
import { toast } from "sonner";

interface DreamShareCardProps {
  dream: DreamEntry;
  onComplete: () => void;
}

const DreamShareCard: React.FC<DreamShareCardProps> = ({ dream, onComplete }) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const generateShareImage = async () => {
      if (!shareCardRef.current) {
        toast.error("Unable to generate share image");
        onComplete();
        return;
      }
      
      const toastId = toast.loading("Creating shareable image...");
      
      try {
        // Allow time for images to load and render properly
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate the image blob
        const blob = await elementToPngBlob(shareCardRef.current);
        
        // Dismiss loading toast
        toast.dismiss(toastId);
        
        // Check if blob was created
        if (!blob) {
          throw new Error("Failed to generate image");
        }
        
        // Download the image
        const fileName = `dream-${Date.now()}.png`;
        downloadImage(blob, fileName);
        
        // Success message
        toast.success("Dream image downloaded successfully!");
      } catch (error) {
        console.error("Share error:", error);
        toast.error("Failed to share dream. Please try again.");
      } finally {
        // Always call onComplete to reset parent component state
        onComplete();
      }
    };

    // Start the process automatically when component mounts
    generateShareImage();
  }, [onComplete]);

  const formattedDate = dream.date 
    ? format(new Date(dream.date), "MMMM d, yyyy")
    : "Unknown Date";

  // Extract dream content and limit length
  const dreamContent = dream.content || "No dream content recorded.";
  const truncatedContent = dreamContent.length > 280 
    ? `${dreamContent.slice(0, 280)}...` 
    : dreamContent;

  // Extract dream analysis and limit length
  const dreamAnalysis = dream.analysis || "";
  const truncatedAnalysis = dreamAnalysis.length > 120
    ? `${dreamAnalysis.slice(0, 120)}...`
    : dreamAnalysis;

  return (
    // Using fixed positioning to keep it hidden
    <div 
      className="fixed left-[-9999px] top-[-9999px] overflow-hidden"
      aria-hidden="true"
    >
      <div 
        ref={shareCardRef}
        id="dream-share-card" 
        className="w-[1080px] h-[1920px] p-12 flex flex-col"
      >
        {/* App Logo/Name at the top */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-64 h-10 mb-3 bg-gradient-to-r from-purple-500 to-blue-400 rounded-lg"></div>
          <h2 className="text-3xl font-bold tracking-wide text-white mb-2">LUCID REPO</h2>
          <div className="w-32 h-1 bg-white/40 mt-2"></div>
        </div>
        
        {/* Date of the Dream */}
        <div className="mt-12 mb-3 text-white/80">
          <p className="text-2xl font-light">{formattedDate}</p>
        </div>
        
        {/* Dream Title */}
        <div className="mb-16">
          <h1 className="text-7xl font-bold leading-tight text-white">
            {dream.title || "Untitled Dream"}
          </h1>
        </div>
        
        {/* Dream Story Snippet */}
        <div className="mb-16 py-8 px-4 rounded-lg text-2xl bg-white/10 text-white">
          <p className="leading-relaxed">
            {truncatedContent}
          </p>
        </div>
        
        {/* Dream Analysis Section */}
        {dreamAnalysis && (
          <div className="mb-16">
            <h3 className="text-3xl font-light mb-4 text-white/90">Dream Analysis</h3>
            <div className="border-l-4 border-white/30 pl-6">
              <p className="text-xl leading-relaxed text-white/80 italic">
                {truncatedAnalysis}
              </p>
            </div>
          </div>
        )}
        
        {/* Dream Image */}
        {dream.generatedImage && (
          <div className="flex-1 flex flex-col items-center justify-center my-12">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center text-white text-3xl bg-gradient-to-br from-purple-600/50 to-blue-500/50">
                Dream Visualization
              </div>
              <img 
                src={dream.generatedImage}
                alt="Dream Visualization"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.log("Image failed to load");
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        )}
        
        {/* App Call to Action at the bottom */}
        <div className="mt-auto flex items-center justify-center py-8">
          <div className="text-center py-4 px-8 bg-white/15 backdrop-blur-sm rounded-xl text-white font-medium shadow-lg border border-white/20">
            Download the app to explore your dreams
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamShareCard;
