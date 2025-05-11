
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
      
      // Start loading toast
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
        {/* App Name at the top */}
        <div className="mb-8 pt-4">
          <div className="w-16 h-1 bg-white/50 mb-12"></div>
          <h1 className="text-6xl font-bold leading-tight mb-1 text-white">
            {dream.title || "Untitled Dream"}
          </h1>
          <p className="text-xl text-white/80">{formattedDate}</p>
        </div>
        
        {/* Dream Content */}
        <div className="mb-8 bg-black/20 p-6 rounded-lg text-lg">
          <p className="leading-relaxed">
            {truncatedContent}
          </p>
        </div>
        
        {/* Dream Analysis Section */}
        {dreamAnalysis && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2 text-white/90">Dream Analysis</h2>
            <div className="pl-4 border-l-2 border-white/30 italic text-white/80">
              <p className="text-base leading-relaxed">
                {truncatedAnalysis}
              </p>
            </div>
          </div>
        )}
        
        {/* Dream Image */}
        {dream.generatedImage && (
          <div className="mb-8 rounded-lg overflow-hidden h-[200px] flex items-center justify-center">
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
