
import React, { useRef, useState } from "react";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";
import { elementToPngBlob } from "@/utils/shareUtils";
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

  // Handle share with direct download
  const handleShare = async () => {
    if (!shareCardRef.current) {
      toast.error("Unable to generate share image");
      return;
    }
    
    try {
      setIsSharing(true);
      
      // Generate the image blob
      const blob = await elementToPngBlob(shareCardRef.current);
      
      if (!blob) {
        toast.error("Failed to generate share image");
        setIsSharing(false);
        return;
      }
      
      // Always download the image directly for reliable behavior
      downloadImageDirectly(blob, `${dream.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-dream.png`);
      toast.success("Dream image downloaded");
      setIsSharing(false);
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share dream");
      setIsSharing(false);
    }
  };

  // Direct download function
  const downloadImageDirectly = (blob: Blob, fileName: string): void => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedDate = dream.date 
    ? format(new Date(dream.date), "MMMM d, yyyy")
    : "Unknown Date";

  return (
    <>
      {/* Visible Share Button */}
      <Button 
        onClick={handleShare}
        variant="outline" 
        className="flex items-center gap-2 text-dream-lavender border-dream-lavender hover:bg-dream-lavender/10"
        disabled={isSharing}
      >
        <Share size={18} />
        <span>{isSharing ? "Sharing..." : "Share"}</span>
      </Button>
      
      {/* Hidden Share Card (positioned off-screen) */}
      <div 
        className="fixed left-[-9999px] top-[-9999px] overflow-hidden"
        aria-hidden="true"
      >
        <div 
          ref={shareCardRef}
          id="dream-share-card" 
          className="w-[1080px] h-[1920px] p-16 flex flex-col"
          style={{
            fontFamily: "'basis-grotesque-pro', sans-serif",
            color: '#fff',
            background: 'linear-gradient(135deg, rgba(99, 73, 166, 1) 0%, rgba(33, 48, 113, 1) 100%)',
          }}
        >
          {/* App Name at the top with improved size and alignment */}
          <div className="mb-16 mt-8 flex flex-col items-center justify-center">
            <h1 className="text-9xl font-bold text-white text-center">Lucid Repo</h1>
            <div className="h-3 w-64 bg-dream-lavender rounded-full mt-6"></div>
          </div>
          
          {/* Dream Title - Large and Bold */}
          <div className="mb-16">
            <h2 className="text-8xl font-bold leading-tight text-white mb-6">{dream.title || "Untitled Dream"}</h2>
            <p className="text-4xl text-dream-lavender">{formattedDate}</p>
          </div>
          
          {/* Dream Content - Better typography and background */}
          <div className="mb-20 bg-black/20 backdrop-blur-sm rounded-xl p-10">
            <p className="text-3xl leading-relaxed">
              {dream.content && dream.content.length > 300 
                ? `${dream.content.slice(0, 300)}...` 
                : dream.content || "No dream content recorded."}
            </p>
          </div>
          
          {/* Analysis Section */}
          {dream.analysis && (
            <div className="mb-20">
              <div className="text-3xl mb-4 font-medium text-dream-lavender">Dream Analysis</div>
              <div className="flex mb-6">
                <div className="w-1 bg-dream-lavender mr-4 self-stretch"></div>
                <blockquote className="text-2xl italic text-white/90">
                  {dream.analysis.length > 150 
                    ? `${dream.analysis.slice(0, 150)}...` 
                    : dream.analysis}
                </blockquote>
              </div>
            </div>
          )}
          
          {/* Dream Image with simplified rendering */}
          {dreamImage && (
            <div className="mb-24 rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: '600px' }}>
              <img 
                src={dreamImage}
                alt={dream.title || "Dream Visualization"}
                className="w-full h-[600px] object-cover"
                crossOrigin="anonymous"
              />
            </div>
          )}
          
          {/* Fallback for no image */}
          {!dreamImage && (
            <div className="mb-24 rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: '600px' }}>
              <div className="h-[600px] bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <div className="text-4xl font-medium text-white">Dream Visualization</div>
              </div>
            </div>
          )}
          
          {/* App Footer with improved styling */}
          <div className="mt-auto flex items-center justify-between">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-16 w-64 rounded-md"></div>
            <div className="text-4xl py-6 px-12 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 shadow-lg">
              Download the app
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DreamShareCard;
