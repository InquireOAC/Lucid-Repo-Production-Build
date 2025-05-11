
import React, { useRef, useEffect } from "react";
import { DreamEntry } from "@/types/dream";
import { format } from "date-fns";
import { elementToPngBlob, shareContent } from "@/utils/shareUtils";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DreamShareCardProps {
  dream: DreamEntry;
}

const DreamShareCard: React.FC<DreamShareCardProps> = ({ dream }) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  
  // Preload custom fonts if needed
  useEffect(() => {
    // This ensures all assets are loaded before sharing
    document.fonts.ready.then(() => {
      console.log("All fonts loaded");
    });
  }, []);

  const handleShare = async () => {
    if (shareCardRef.current) {
      const blob = await elementToPngBlob(shareCardRef.current);
      await shareContent(
        blob,
        `${dream.title} - Dream Story`,
        "Check out my dream from Lucid Repo!"
      );
    }
  };

  const formattedDate = dream.date 
    ? format(new Date(dream.date), "MMMM d, yyyy")
    : "Unknown Date";

  return (
    <>
      {/* Visible Share Button */}
      <Button 
        onClick={handleShare}
        variant="ghost" 
        size="icon" 
        className="text-dream-lavender hover:bg-dream-lavender/10"
      >
        <Share size={16} />
      </Button>
      
      {/* Hidden Share Card (positioned off-screen) */}
      <div 
        className="fixed left-[-9999px] top-[-9999px] overflow-hidden"
        aria-hidden="true"
      >
        <div 
          ref={shareCardRef}
          id="dream-share-card" 
          className="w-[1080px] h-[1920px] bg-gradient-to-br from-dream-dark to-dream-midnight p-12 flex flex-col"
          style={{
            fontFamily: "'basis-grotesque-pro', sans-serif",
            color: "#fff",
          }}
        >
          {/* Dream Image */}
          {dream.generatedImage ? (
            <div className="mb-8 rounded-3xl overflow-hidden">
              <img 
                src={dream.generatedImage} 
                alt={dream.title}
                className="w-full object-cover"
                crossOrigin="anonymous"  // Important for html2canvas to work with external images
              />
            </div>
          ) : (
            <div className="mb-8 h-[640px] bg-dream-purple/20 rounded-3xl flex items-center justify-center">
              <div className="text-4xl font-medium text-dream-lavender">Lucid Repo</div>
            </div>
          )}
          
          {/* Dream Title and Date */}
          <div className="mb-8">
            <h1 className="text-7xl mb-4 font-bold gradient-text">{dream.title}</h1>
            <p className="text-3xl text-dream-lavender">{formattedDate}</p>
          </div>
          
          {/* Dream Content */}
          <div className="mb-8 text-4xl leading-relaxed">
            {dream.content.length > 300 
              ? `${dream.content.slice(0, 300)}...` 
              : dream.content
            }
          </div>
          
          {/* Analysis Section */}
          {dream.analysis && (
            <blockquote className="mb-auto border-l-8 border-dream-lavender pl-6 py-2 text-3xl italic text-dream-lavender/90">
              {dream.analysis.length > 150 
                ? `${dream.analysis.slice(0, 150)}...` 
                : dream.analysis
              }
            </blockquote>
          )}
          
          {/* App Footer */}
          <div className="mt-auto pt-8 flex items-center justify-between">
            <div className="text-4xl font-bold gradient-text">Lucid Repo</div>
            <div className="text-2xl text-dream-lavender/80">Download the app</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DreamShareCard;
