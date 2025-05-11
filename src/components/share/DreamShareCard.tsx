
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
          className="w-[1080px] h-[1920px] p-16 flex flex-col"
          style={{
            fontFamily: "'basis-grotesque-pro', sans-serif",
            color: '#fff',
            background: 'linear-gradient(135deg, rgba(99, 73, 166, 1) 0%, rgba(33, 48, 113, 1) 100%)',
          }}
        >
          {/* App Header/Brand */}
          <div className="mb-6 mt-4">
            <div className="h-2 w-24 bg-dream-lavender rounded mb-16"></div>
          </div>
          
          {/* Dream Title - Large and Bold */}
          <div className="mb-12">
            <h1 className="text-8xl font-bold leading-tight text-white mb-6">{dream.title || "Untitled Dream"}</h1>
            <p className="text-4xl text-dream-lavender">{formattedDate}</p>
          </div>
          
          {/* Dream Image - Large and Prominent */}
          {dreamImage ? (
            <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={dreamImage} 
                alt={dream.title || "Dream Visualization"}
                className="w-full object-cover"
                style={{ maxHeight: '700px' }}
                crossOrigin="anonymous"
              />
            </div>
          ) : (
            <div className="mb-12 h-80 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-3xl flex items-center justify-center shadow-2xl">
              <div className="text-5xl font-medium text-white">Dream Visualization</div>
            </div>
          )}
          
          {/* Dream Content - Better typography and background */}
          <div className="mb-12 bg-black/20 backdrop-blur-sm rounded-xl p-8">
            <p className="text-3xl leading-relaxed">
              {dream.content && dream.content.length > 300 
                ? `${dream.content.slice(0, 300)}...` 
                : dream.content || "No dream content recorded."}
            </p>
          </div>
          
          {/* Analysis Section */}
          {dream.analysis && (
            <div className="mb-16">
              <div className="text-3xl mb-2 font-medium text-dream-lavender">Dream Analysis</div>
              <div className="flex">
                <div className="w-1 bg-dream-lavender mr-4 self-stretch"></div>
                <blockquote className="text-2xl italic text-white/90">
                  {dream.analysis.length > 150 
                    ? `${dream.analysis.slice(0, 150)}...` 
                    : dream.analysis}
                </blockquote>
              </div>
            </div>
          )}
          
          {/* App Footer */}
          <div className="mt-auto flex items-center justify-between">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-12 w-64 rounded-md"></div>
            <div className="text-xl py-3 px-6 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20">
              Download the app
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DreamShareCard;
