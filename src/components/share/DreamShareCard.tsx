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

  return (
    // Using fixed positioning to keep it hidden
    <div 
      className="fixed left-[-9999px] top-[-9999px] overflow-hidden"
      aria-hidden="true"
    >
      <div 
        ref={shareCardRef}
        id="dream-share-card" 
        className="w-[400px] h-[500px] p-6 flex flex-col"
        style={{
          fontFamily: "'basis-grotesque-pro', sans-serif",
          color: '#fff',
          background: 'linear-gradient(135deg, rgba(99, 73, 166, 1) 0%, rgba(33, 48, 113, 1) 100%)',
        }}
      >
        {/* App Name at the top */}
        <div className="mb-4 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">Lucid Repo</h1>
        </div>
        
        {/* Dream Title */}
        <div className="mb-3">
          <h2 className="text-2xl font-bold leading-tight text-white">{dream.title || "Untitled Dream"}</h2>
          <p className="text-lg text-dream-lavender">{formattedDate}</p>
        </div>
        
        {/* Dream Content */}
        <div className="mb-4 bg-black/20 p-3 rounded-lg">
          <p className="text-base">
            {dream.content && dream.content.length > 100 
              ? `${dream.content.slice(0, 100)}...` 
              : dream.content || "No dream content recorded."}
          </p>
        </div>
        
        {/* Dream Image */}
        <div className="mb-4 rounded-lg overflow-hidden h-[200px] flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500">
          {dream.generatedImage ? (
            <img 
              src={dream.generatedImage}
              alt="Dream Visualization"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onError={(e) => {
                // Handle image load error by showing placeholder background instead
                console.log("Image failed to load");
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="text-2xl font-medium text-white">Dream Visualization</div>
          )}
        </div>
        
        {/* App Footer */}
        <div className="mt-auto flex items-center justify-center">
          <div className="text-lg py-2 px-4 bg-white/20 rounded-full text-white">
            Download the app
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreamShareCard;
