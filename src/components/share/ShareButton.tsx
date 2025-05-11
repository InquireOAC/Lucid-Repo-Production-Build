
import React, { useState, useRef } from "react";
import { DreamEntry } from "@/types/dream";
import DreamShareCard, { DreamShareCardRef } from "./DreamShareCard";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  dream: DreamEntry;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  dream,
  variant = "outline",
  size = "default",
  className = ""
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<DreamShareCardRef>(null);

  // Enhanced normalization to ensure image is available
  const normalizedDream = {
    ...dream,
    id: dream.id || `dream-${Date.now()}`,
    title: dream.title || "Untitled Dream",
    generatedImage: dream.generatedImage || dream.image_url || null,
    imagePrompt: dream.imagePrompt || dream.image_prompt || "",
    content: dream.content || "No dream content available.",
    analysis: dream.analysis || "",
    date: dream.date || new Date().toISOString()
  };
  
  console.log("Dream in ShareButton:", normalizedDream);
  console.log("Image URL in ShareButton:", normalizedDream.generatedImage);

  const handleShareClick = async () => {
    if (isSharing) return;

    // Force a small delay to ensure all data is loaded
    setIsSharing(true);
    
    // Add a small delay to ensure the component is fully rendered
    setTimeout(async () => {
      try {
        // Trigger the share process via the ref
        if (shareCardRef.current) {
          const success = await shareCardRef.current.shareDream();
          if (!success) {
            toast.error("Couldn't prepare dream for sharing");
          }
        } else {
          toast.error("Share component not initialized properly");
        }
      } catch (error) {
        console.error("Share error:", error);
        toast.error("Failed to share dream");
      } finally {
        setIsSharing(false);
      }
    }, 500);

    // Reset sharing state after a timeout if something goes wrong
    setTimeout(() => {
      if (isSharing) {
        setIsSharing(false);
        toast.error("Share process timed out. Please try again.");
      }
    }, 20000);
  };

  // Validate required fields
  if (!normalizedDream.title || !normalizedDream.content) {
    return null;
  }

  return (
    <>
      <Button 
        onClick={handleShareClick} 
        variant={variant} 
        size={size} 
        disabled={isSharing} 
        className={`flex items-center justify-center gap-2 ${className}`}
      >
        <Share size={18} />
        <span>{isSharing ? "Sharing..." : "Share"}</span>
      </Button>
      
      {/* The hidden share card component (mounted all the time but invisible) */}
      <DreamShareCard ref={shareCardRef} dream={normalizedDream} onShareStart={() => setIsSharing(true)} onShareComplete={() => setIsSharing(false)} />
    </>
  );
};

export default ShareButton;
