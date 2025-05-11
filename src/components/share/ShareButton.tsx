
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
    id: dream.id,
    title: dream.title || "Untitled Dream",
    generatedImage: dream.generatedImage || dream.image_url || null,
    imagePrompt: dream.imagePrompt || dream.image_prompt,
    content: dream.content || "No dream content available.",
    analysis: dream.analysis || "",
    date: dream.date || new Date().toISOString()
  };

  console.log("ShareButton - Dream data:", normalizedDream);
  console.log("ShareButton - Image URL:", normalizedDream.generatedImage);

  return <DreamShareCard dream={normalizedDream} />;
};

export default ShareButton;
