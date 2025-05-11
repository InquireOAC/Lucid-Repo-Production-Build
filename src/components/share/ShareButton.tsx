
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
  const normalizedDream = {
    ...dream,
    generatedImage: dream.generatedImage || dream.image_url,
    imagePrompt: dream.imagePrompt || dream.image_prompt
  };

  return (
    <DreamShareCard dream={normalizedDream} />
  );
};

export default ShareButton;
