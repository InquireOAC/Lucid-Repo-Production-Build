
import React from "react";
import { Input } from "@/components/ui/input";

interface ImagePromptInputProps {
  imagePrompt: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ImagePromptInput = ({ imagePrompt, onChange, disabled = false }: ImagePromptInputProps) => {
  return (
    <Input
      type="text"
      placeholder="Generated Prompt"
      value={imagePrompt}
      onChange={(e) => onChange(e.target.value)}
      className="dream-input mb-3"
      disabled={disabled}
    />
  );
};

export default ImagePromptInput;
