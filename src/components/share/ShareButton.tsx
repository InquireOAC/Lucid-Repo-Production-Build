
import React, { useState } from "react";
import { DreamEntry } from "@/types/dream";
import DreamShareCard from "./DreamShareCard";
import { Button } from "@/components/ui/button";
import { Share, Download } from "lucide-react";
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

  const handleShareClick = () => {
    if (isSharing) return;
    
    setIsSharing(true);
    toast.info("Creating dream image to share...");
    
    // Reset sharing state after a timeout even if the share process fails
    setTimeout(() => {
      if (isSharing) {
        setIsSharing(false);
        toast.error("Share process timed out. Please try again.");
      }
    }, 15000); // Extended timeout for better reliability
  };

  // Validate required fields
  if (!normalizedDream.title || !normalizedDream.content) {
    return null;
  }

  return (
    <Button 
      onClick={handleShareClick}
      variant={variant} 
      size={size}
      className={`flex items-center gap-2 text-dream-lavender border-dream-lavender hover:bg-dream-lavender/10 ${className}`}
      disabled={isSharing}
    >
      {isSharing ? <Download size={18} /> : <Share size={18} />}
      <span>{size !== 'icon' && (isSharing ? "Processing..." : "Share")}</span>
      
      {/* The actual share card component (kept hidden until needed) */}
      {isSharing && <DreamShareCard dream={normalizedDream} onComplete={() => setIsSharing(false)} />}
    </Button>
  );
};

export default ShareButton;
