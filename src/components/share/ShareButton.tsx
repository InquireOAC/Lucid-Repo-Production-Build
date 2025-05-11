
import React from "react";
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
  // Make sure we have all possible image fields in the dream object
  // This ensures that the share card has access to the images regardless of field naming
  const normalizedDream = {
    ...dream,
    title: dream.title || "Untitled Dream", // Ensure we always have a title
    generatedImage: dream.generatedImage || dream.image_url,
    imagePrompt: dream.imagePrompt || dream.image_prompt,
    content: dream.content || "No dream content available.",
    analysis: dream.analysis || ""
  };

  return (
    <DreamShareCard dream={normalizedDream} />
  );
};

export default ShareButton;
