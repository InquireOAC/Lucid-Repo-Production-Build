
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

  // Handle share with improved error handling and timeout safety
  const handleShare = async () => {
    if (!shareCardRef.current) {
      toast.error("Unable to generate share image");
      return;
    }
    
    try {
      setIsSharing(true);
      toast.info("Preparing dream image...");
      
      // Add a safety timeout to prevent UI from being stuck
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Share operation timed out")), 15000); // Increased from 8000 to 15000ms
      });
      
      // Generate the image blob with timeout protection
      const blobPromise = elementToPngBlob(shareCardRef.current);
      
      // Race between the blob generation and timeout
      const blob = await Promise.race([blobPromise, timeoutPromise]) as Blob | null;
      
      if (!blob) {
        throw new Error("Failed to generate image");
      }
      
      // Download the image
      const fileName = `${dream.title?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'dream'}-${Date.now()}.png`;
      downloadImage(blob, fileName);
      toast.success("Dream image downloaded successfully!");
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share dream. Please try again.");
    } finally {
      // Always reset sharing state, even if there was an error
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
      
      {/* Hidden Share Card (positioned off-screen) */}
      <div 
        className="fixed left-[-9999px] top-[-9999px] overflow-hidden"
        aria-hidden="true"
      >
        <div 
          ref={shareCardRef}
          id="dream-share-card" 
          className="w-[800px] h-[1200px] p-12 flex flex-col"
          style={{
            fontFamily: "'basis-grotesque-pro', sans-serif",
            color: '#fff',
            background: 'linear-gradient(135deg, rgba(99, 73, 166, 1) 0%, rgba(33, 48, 113, 1) 100%)',
          }}
        >
          {/* App Name at the top with improved size and alignment */}
          <div className="mb-12 mt-6 flex flex-col items-center justify-center">
            <h1 className="text-7xl font-bold text-white text-center">Lucid Repo</h1>
            <div className="h-2 w-40 bg-dream-lavender rounded-full mt-4"></div>
          </div>
          
          {/* Dream Title - Large and Bold */}
          <div className="mb-8">
            <h2 className="text-5xl font-bold leading-tight text-white mb-4">{dream.title || "Untitled Dream"}</h2>
            <p className="text-3xl text-dream-lavender">{formattedDate}</p>
          </div>
          
          {/* Dream Content - Better typography and background */}
          <div className="mb-8 bg-black/20 backdrop-blur-sm rounded-xl p-6">
            <p className="text-2xl leading-relaxed">
              {dream.content && dream.content.length > 200 
                ? `${dream.content.slice(0, 200)}...` 
                : dream.content || "No dream content recorded."}
            </p>
          </div>
          
          {/* Analysis Section - only if present */}
          {dream.analysis && (
            <div className="mb-8">
              <div className="text-2xl mb-2 font-medium text-dream-lavender">Dream Analysis</div>
              <div className="flex mb-4">
                <div className="w-1 bg-dream-lavender mr-3 self-stretch"></div>
                <blockquote className="text-xl italic text-white/90">
                  {dream.analysis.length > 100 
                    ? `${dream.analysis.slice(0, 100)}...` 
                    : dream.analysis}
                </blockquote>
              </div>
            </div>
          )}
          
          {/* Dream Image with simplified rendering and size optimization */}
          {dreamImage && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-lg" style={{ minHeight: '400px' }}>
              <img 
                src={dreamImage}
                alt={dream.title || "Dream Visualization"}
                className="w-full h-[400px] object-cover"
                crossOrigin="anonymous"
                loading="eager"
              />
            </div>
          )}
          
          {/* Fallback for no image - simpler gradient */}
          {!dreamImage && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-lg" style={{ minHeight: '400px' }}>
              <div className="h-[400px] bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <div className="text-3xl font-medium text-white">Dream Visualization</div>
              </div>
            </div>
          )}
          
          {/* App Footer with improved styling */}
          <div className="mt-auto flex items-center justify-between">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-12 w-40 rounded-md"></div>
            <div className="text-2xl py-3 px-6 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 shadow-lg">
              Download the app
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DreamShareCard;
