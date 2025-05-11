
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
  size = "icon",
  className = "",
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<DreamShareCardRef>(null);
  
  // Ensure we have all necessary fields with proper fallbacks
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

  const handleShareClick = async () => {
    if (isSharing) return;
    
    // Start sharing process
    setIsSharing(true);
    
    try {
      // Trigger the share process via the ref
      if (shareCardRef.current) {
        const success = await shareCardRef.current.shareDream();
        
        if (success) {
          // Success message removed
        } else {
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
        className={`flex items-center gap-2 text-dream-lavender border-dream-lavender hover:bg-dream-lavender/10 ${className}`}
        disabled={isSharing}
      >
        <Share size={18} />
        <span>{size !== 'icon' && (isSharing ? "Sharing..." : "Share")}</span>
      </Button>
      
      {/* The hidden share card component (mounted all the time but invisible) */}
      <DreamShareCard 
        ref={shareCardRef}
        dream={normalizedDream}
        onShareStart={() => setIsSharing(true)} 
        onShareComplete={() => setIsSharing(false)}
      />
    </>
  );
};

export default ShareButton;
