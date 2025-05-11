
import React from "react";
import { DreamEntry } from "@/types/dream";
import DreamShareCard from "./DreamShareCard";
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
  // Ensure we have all necessary fields with proper fallbacks
  const normalizedDream = {
    ...dream,
    id: dream.id || `dream-${Date.now()}`,
    title: dream.title || "Untitled Dream",
    // Prioritize the field that actually contains data - check both possible field names
    generatedImage: dream.generatedImage || dream.image_url || null,
    imagePrompt: dream.imagePrompt || dream.image_prompt || "",
    content: dream.content || "No dream content available.",
    analysis: dream.analysis || "",
    date: dream.date || new Date().toISOString()
  };

  // Log the normalized dream for debugging - include more details
  console.log("Normalized dream for sharing:", {
    id: normalizedDream.id,
    title: normalizedDream.title,
    hasImage: !!normalizedDream.generatedImage,
    imageLength: normalizedDream.generatedImage ? normalizedDream.generatedImage.length : 0,
    imageUrl: normalizedDream.generatedImage ? normalizedDream.generatedImage.substring(0, 50) + '...' : 'none'
  });

  if (!normalizedDream.title || !normalizedDream.content) {
    toast.error("Cannot share dream - missing required information");
    return null;
  }

  return <DreamShareCard dream={normalizedDream} />;
};

export default ShareButton;
