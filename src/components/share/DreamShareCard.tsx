
import React, { useRef, useEffect, useState } from "react";
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Ensure we have the proper image from either camelCase or snake_case field
  const dreamImage = dream.generatedImage || dream.image_url;
  
  // Preload custom fonts and image if available
  useEffect(() => {
    // Preload the dream image if it exists
    if (dreamImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = dreamImage;
      img.onload = () => {
        console.log("Dream image preloaded successfully:", dreamImage);
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error("Failed to preload dream image:", dreamImage);
        setImageError(true);
      };
    }
    
    // Ensure all fonts are loaded
    document.fonts.ready.then(() => {
      console.log("All fonts loaded");
    });
  }, [dreamImage]);

  const handleShare = async () => {
    if (shareCardRef.current) {
      try {
        console.log("Generating share image for dream:", dream.title);
        console.log("Image URL:", dreamImage);
        
        // Add a small delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const blob = await elementToPngBlob(shareCardRef.current);
        if (!blob) {
          console.error("Failed to generate image blob");
          return;
        }
        
        await shareContent(
          blob,
          `${dream.title} - Dream Story`,
          "Check out my dream from Lucid Repo!"
        );
      } catch (error) {
        console.error("Share error:", error);
      }
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
          {/* App Name at the top */}
          <div className="mb-10 mt-4">
            <h1 className="text-5xl font-bold text-white">Lucid Repo</h1>
            <div className="h-2 w-24 bg-dream-lavender rounded mt-3 mb-10"></div>
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
          
          {/* Dream Image - Below the analysis */}
          <div className="mb-16 rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: '400px' }}>
            {dreamImage ? (
              <img 
                src={dreamImage}
                alt={dream.title || "Dream Visualization"}
                className="w-full object-cover"
                style={{ height: '500px', objectFit: 'cover' }}
                crossOrigin="anonymous"
                onLoad={() => console.log("Image loaded in card:", dreamImage)}
                onError={(e) => {
                  console.error("Image failed to load in card:", dreamImage);
                  // Fall back to a colorful gradient placeholder instead of a plain placeholder
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.background = 
                    'linear-gradient(to right, rgba(155, 135, 245, 0.8), rgba(126, 105, 171, 0.8))';
                  e.currentTarget.parentElement!.innerHTML += 
                    '<div class="flex items-center justify-center h-full">' +
                    '<span class="text-4xl text-white font-medium">Dream Visualization</span>' +
                    '</div>';
                }}
              />
            ) : (
              <div className="h-[500px] bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <div className="text-4xl font-medium text-white">Dream Visualization</div>
              </div>
            )}
          </div>
          
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
