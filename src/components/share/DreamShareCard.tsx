
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

  // Ensure we have the proper image from either camelCase or snake_case field
  const dreamImage = dream.generatedImage || dream.image_url;
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
      >
        <Share size={18} />
        <span>Share</span>
      </Button>
      
      {/* Hidden Share Card (positioned off-screen) */}
      <div 
        className="fixed left-[-9999px] top-[-9999px] overflow-hidden"
        aria-hidden="true"
      >
        <div 
          ref={shareCardRef}
          id="dream-share-card" 
          className="w-[1080px] h-[1920px] bg-gradient-to-br from-dream-dark to-dream-midnight p-16 flex flex-col"
          style={{
            fontFamily: "'basis-grotesque-pro', sans-serif",
            color: "#fff",
          }}
        >
          {/* App Header */}
          <div className="mb-10">
            <div className="text-5xl font-bold gradient-text mb-2">Lucid Repo</div>
            <div className="h-1 w-32 bg-dream-lavender rounded"></div>
          </div>
          
          {/* Dream Title and Date - ENHANCED */}
          <div className="mb-10">
            <h1 className="text-8xl mb-6 font-bold gradient-text leading-tight">{dream.title}</h1>
            <p className="text-4xl text-dream-lavender">{formattedDate}</p>
          </div>
          
          {/* Dream Image - Properly positioned and sized */}
          {dreamImage ? (
            <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={dreamImage} 
                alt={dream.title}
                className="w-full max-h-[800px] object-cover"
                crossOrigin="anonymous"
              />
            </div>
          ) : (
            <div className="mb-12 h-[640px] bg-dream-purple/20 rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="text-5xl font-medium text-dream-lavender">Dream Visualization</div>
            </div>
          )}
          
          {/* Dream Content - Better typography */}
          <div className="mb-12 text-4xl leading-relaxed text-white/90 bg-white/5 p-8 rounded-xl backdrop-blur-sm">
            {dream.content.length > 300 
              ? `${dream.content.slice(0, 300)}...` 
              : dream.content
            }
          </div>
          
          {/* Analysis Section - Styled better */}
          {dream.analysis && (
            <div className="mb-auto">
              <div className="text-3xl mb-4 text-dream-lavender font-medium">Dream Analysis</div>
              <blockquote className="border-l-8 border-dream-lavender pl-8 py-3 text-3xl italic text-white/80">
                {dream.analysis.length > 150 
                  ? `${dream.analysis.slice(0, 150)}...` 
                  : dream.analysis
                }
              </blockquote>
            </div>
          )}
          
          {/* App Footer - ENHANCED */}
          <div className="mt-auto pt-12 flex items-center justify-between">
            <div className="text-5xl font-bold gradient-text">Lucid Repo</div>
            <div className="text-2xl font-semibold bg-dream-lavender/30 px-6 py-3 rounded-full text-white border border-dream-lavender/50">
              Download the app
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DreamShareCard;
