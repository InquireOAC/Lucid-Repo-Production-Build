
import React, { useRef, useState } from "react";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";
import { elementToPngBlob, downloadImage } from "@/utils/shareUtils";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DreamShareCardProps {
  dream: DreamEntry;
}

const DreamShareCard: React.FC<DreamShareCardProps> = ({ dream }) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  // Handle share with simplified approach
  const handleShare = async () => {
    if (!shareCardRef.current) {
      toast.error("Unable to generate share image");
      return;
    }
    
    // Start loading toast with specific ID for later dismissal
    const toastId = "share-toast";
    
    try {
      // Guard against multiple simultaneous share attempts
      if (isSharing) {
        return;
      }
      
      setIsSharing(true);
      toast.loading("Creating shareable image...", {
        id: toastId,
        duration: 6000
      });
      
      // Generate the image blob with no race condition
      const blob = await elementToPngBlob(shareCardRef.current);
      
      // Make sure the loading toast is dismissed
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
      toast.dismiss(toastId);
      toast.error("Failed to share dream. Please try again.");
    } finally {
      // Always reset sharing state
      setIsSharing(false);
    }
  };

  const formattedDate = dream.date 
    ? format(new Date(dream.date), "MMMM d, yyyy")
    : "Unknown Date";

  return (
    <>
      {/* Visible Share Button with better feedback */}
      <Button 
        onClick={handleShare}
        variant="outline" 
        className="flex items-center gap-2 text-dream-lavender border-dream-lavender hover:bg-dream-lavender/10"
        disabled={isSharing}
      >
        <Share size={18} />
        <span>{isSharing ? "Processing..." : "Share"}</span>
      </Button>
      
      {/* Share Card (positioned off-screen) */}
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
          <div className="mb-4 rounded-lg overflow-hidden h-[200px]">
            {dream.generatedImage ? (
              <img 
                src={dream.generatedImage}
                alt="Dream Visualization"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <div className="text-2xl font-medium text-white">Dream Visualization</div>
              </div>
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
    </>
  );
};

export default DreamShareCard;
