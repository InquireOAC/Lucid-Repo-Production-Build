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
        className="w-[1080px] h-[1080px] p-10 flex flex-col"
      >
        {/* App Name at the top, centered */}
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl font-bold tracking-wide text-white mb-2">LUCID REPO</h2>
          <div className="w-24 h-1 bg-white/40"></div>
        </div>
        
        {/* Date of the Dream */}
        <div className="mb-6 text-center">
          <p className="text-xl opacity-90 uppercase tracking-wider">{formattedDate}</p>
        </div>
        
        {/* Dream Title */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold leading-tight text-white">
            {dream.title || "Untitled Dream"}
          </h1>
        </div>
        
        {/* Dream Story Snippet */}
        <div className="mb-8 p-6 rounded-lg text-lg bg-white/10 backdrop-blur-sm">
          <p className="leading-relaxed italic">
            "{truncatedContent}"
          </p>
        </div>
        
        {/* Dream Analysis Section */}
        {dreamAnalysis && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3 opacity-90 text-center">ANALYSIS</h3>
            <div className="p-5 bg-purple-800/20 rounded-lg">
              <p className="text-base leading-relaxed text-center">
                {truncatedAnalysis}
              </p>
            </div>
          </div>
        )}
        
        {/* Dream Image */}
        {dream.generatedImage && (
          <div className="flex-1 flex flex-col items-center justify-center mb-8">
            <img 
              src={dream.generatedImage}
              alt="Dream Visualization"
              className="max-h-[350px] rounded-lg shadow-xl"
              crossOrigin="anonymous"
              onError={(e) => {
                console.log("Image failed to load");
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
        
        {/* App Call to Action at the bottom */}
        <div className="mt-auto flex items-center justify-center">
          <div className="text-center py-3 px-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full text-white font-medium shadow-lg">
            Download the app to explore your dreams
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamShareCard;
