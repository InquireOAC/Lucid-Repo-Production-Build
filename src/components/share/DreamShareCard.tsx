
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
        className="w-[500px] h-[860px] p-8 flex flex-col"
        style={{
          fontFamily: "'basis-grotesque-pro', sans-serif",
          color: '#fff',
          background: 'linear-gradient(145deg, rgba(96, 76, 170, 1) 0%, rgba(59, 49, 120, 1) 100%)',
        }}
      >
        {/* Centered Decorative Element */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-48 h-10 rounded-md bg-gradient-to-r from-purple-400 to-blue-400 mb-2"></div>
          <div className="w-24 h-1 bg-white/30"></div>
        </div>
        
        {/* Dream Title */}
        <div className="mt-4">
          <h1 className="text-6xl font-bold leading-tight mb-2 text-white">
            {dream.title || "Untitled Dream"}
          </h1>
          <p className="text-xl opacity-80">{formattedDate}</p>
        </div>
        
        {/* Dream Content */}
        <div className="mt-10 mb-8 p-6 rounded-lg text-lg bg-purple-800/20">
          <p className="leading-relaxed">
            {truncatedContent}
          </p>
        </div>
        
        {/* Dream Analysis Section */}
        {dreamAnalysis && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2 opacity-90">Dream Analysis</h2>
            <div className="pl-4 border-l-2 border-white/30 italic opacity-80">
              <p className="text-base leading-relaxed">
                {truncatedAnalysis}
              </p>
            </div>
          </div>
        )}
        
        {/* Dream Image */}
        {dream.generatedImage && (
          <div className="mt-auto mb-8 rounded-lg overflow-hidden">
            <div className="text-center mb-2 opacity-90 text-xl">Dream Visualization</div>
            <img 
              src={dream.generatedImage}
              alt="Dream Visualization"
              className="w-full h-full object-cover rounded-lg"
              crossOrigin="anonymous"
              onError={(e) => {
                console.log("Image failed to load");
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
        
        {/* App Footer */}
        <div className="mt-auto flex items-center justify-between">
          <div className="bg-purple-500/30 rounded-full py-2 px-5 text-white/90">
            Lucid Repo
          </div>
          <div className="text-base py-2 px-5 bg-white/20 rounded-full text-white">
            Download the app
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamShareCard;
