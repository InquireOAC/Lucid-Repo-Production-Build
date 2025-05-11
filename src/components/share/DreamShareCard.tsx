
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
  
  // Ensure we have the proper image from either camelCase or snake_case field
  const dreamImage = dream.generatedImage || dream.image_url;

  // Handle share with simplified approach focused on reliability
  const handleShare = async () => {
    if (!shareCardRef.current) {
      toast.error("Unable to generate share image");
      return;
    }
    
    try {
      setIsSharing(true);
      toast.loading("Creating shareable image...", {
        id: "share-toast",
        duration: 10000 // longer duration since we'll dismiss manually
      });
      
      // Generate the image blob with no race condition
      const blob = await elementToPngBlob(shareCardRef.current);
      
      // Check if blob was created
      if (!blob) {
        throw new Error("Failed to generate image");
      }
      
      // Download the image
      const fileName = `dream-${Date.now()}.png`;
      downloadImage(blob, fileName);
      
      // Success message
      toast.dismiss("share-toast");
      toast.success("Dream image downloaded successfully!");
    } catch (error) {
      console.error("Share error:", error);
      toast.dismiss("share-toast");
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
      
      {/* Hidden Share Card (positioned off-screen) - SIMPLIFIED VERSION */}
      <div 
        className="fixed left-[-9999px] top-[-9999px] overflow-hidden"
        aria-hidden="true"
      >
        <div 
          ref={shareCardRef}
          id="dream-share-card" 
          className="w-[600px] h-[900px] p-8 flex flex-col"
          style={{
            fontFamily: "'basis-grotesque-pro', sans-serif",
            color: '#fff',
            background: 'linear-gradient(135deg, rgba(99, 73, 166, 1) 0%, rgba(33, 48, 113, 1) 100%)',
          }}
        >
          {/* App Name at the top */}
          <div className="mb-8 flex items-center justify-center">
            <h1 className="text-6xl font-bold text-white">Lucid Repo</h1>
          </div>
          
          {/* Dream Title */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold leading-tight text-white">{dream.title || "Untitled Dream"}</h2>
            <p className="text-xl text-dream-lavender">{formattedDate}</p>
          </div>
          
          {/* Dream Content - simplified */}
          <div className="mb-6 bg-black/20 p-4 rounded-lg">
            <p className="text-lg">
              {dream.content && dream.content.length > 150 
                ? `${dream.content.slice(0, 150)}...` 
                : dream.content || "No dream content recorded."}
            </p>
          </div>
          
          {/* Dream Image with simplified rendering */}
          {dreamImage && (
            <div className="mb-6 rounded-lg overflow-hidden" style={{ maxHeight: '300px' }}>
              <img 
                src={dreamImage}
                alt="Dream Visualization"
                className="w-full h-[300px] object-cover"
                crossOrigin="anonymous"
              />
            </div>
          )}
          
          {/* Fallback for no image */}
          {!dreamImage && (
            <div className="mb-6 rounded-lg overflow-hidden" style={{ height: '300px' }}>
              <div className="h-[300px] bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <div className="text-2xl font-medium text-white">Dream Visualization</div>
              </div>
            </div>
          )}
          
          {/* App Footer */}
          <div className="mt-auto flex items-center justify-center">
            <div className="text-xl py-2 px-4 bg-white/20 rounded-full text-white">
              Download the app
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DreamShareCard;
