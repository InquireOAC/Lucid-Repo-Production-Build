
import React, { useState } from "react";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DreamEntry } from "@/types/dream";
import DreamShareCard from "./DreamShareCard";

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
  const [showShareCard, setShowShareCard] = useState(false);
  
  // Make sure we have all possible image fields in the dream object
  // This ensures that the share card has access to the images regardless of field naming
  const normalizedDream = {
    ...dream,
    title: dream.title || "Untitled Dream", // Ensure we always have a title
    generatedImage: dream.generatedImage || dream.image_url, // Using image_url instead of imageUrl
    imagePrompt: dream.imagePrompt || dream.image_prompt,
    content: dream.content || "No dream content available.",
    analysis: dream.analysis || "",
    date: dream.date || new Date().toISOString()
  };

  console.log("ShareButton - Dream data:", normalizedDream);
  console.log("ShareButton - Image URL:", normalizedDream.generatedImage);
  
  const toggleShareCard = () => {
    setShowShareCard(!showShareCard);
  };

  return (
    <>
      <Button 
        onClick={toggleShareCard}
        variant={variant} 
        size={size}
        className={`flex items-center gap-2 text-dream-lavender border-dream-lavender hover:bg-dream-lavender/10 ${className}`}
      >
        <Share size={18} />
        <span>Share</span>
      </Button>
      
      {showShareCard && <DreamShareCard dream={normalizedDream} />}
    </>
  );
};

export default ShareButton;
