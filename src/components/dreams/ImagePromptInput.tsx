
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

interface ImagePromptInputProps {
  imagePrompt: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onRegenerate?: () => void;
  isGenerating?: boolean;
}

const ImagePromptInput = ({ imagePrompt, onChange, disabled = false, onRegenerate, isGenerating = false }: ImagePromptInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Custom Prompt
      </label>
      <Textarea
        placeholder="Describe the image you want to generate..."
        value={imagePrompt}
        onChange={(e) => onChange(e.target.value)}
        className="dream-input resize-none text-sm"
        rows={3}
        disabled={disabled}
      />
      {onRegenerate && !disabled && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating || !imagePrompt.trim()}
          >
            <Wand2 className="h-4 w-4 mr-1" />
            {isGenerating ? "Generating..." : "Regenerate"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImagePromptInput;
