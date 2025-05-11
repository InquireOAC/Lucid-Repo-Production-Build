
import React, { useState } from "react";
import { DreamEntry } from "@/types/dream";
import DreamShareCard from "./DreamShareCard";
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
  
  // Ensure we have all necessary fields with proper fallbacks
  const normalizedDream = {
    ...dream,
    id: dream.id || `dream-${Date.now()}`,
    title: dream.title || "Untitled Dream",
    // Prioritize the field that actually contains data
    generatedImage: dream.generatedImage || dream.image_url || null,
    imagePrompt: dream.imagePrompt || dream.image_prompt || "",
    content: dream.content || "No dream content available.",
    analysis: dream.analysis || "",
    date: dream.date || new Date().toISOString()
  };

  const handleShareClick = () => {
    if (isSharing) return;
    setIsSharing(true);
    
    // Reset sharing state after a timeout even if the share process fails
    setTimeout(() => setIsSharing(false), 5000);
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
      <Share size={18} />
      <span>{size !== 'icon' && (isSharing ? "Processing..." : "Share")}</span>
      
      {/* The actual share card component (kept hidden until needed) */}
      {isSharing && <DreamShareCard dream={normalizedDream} onComplete={() => setIsSharing(false)} />}
    </Button>
  );
};

export default ShareButton;
