
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { DreamTag } from "@/types/dream";

interface DreamDetailContentProps {
  content: string;
  formattedDate: string;
  dreamTags: DreamTag[];
  generatedImage?: string;
  analysis?: string;
}

const DreamDetailContent = ({
  content,
  formattedDate,
  dreamTags,
  generatedImage,
  analysis
}: DreamDetailContentProps) => {
  return (
    <div className="space-y-4 mt-2">
      {/* Only show date if it's provided (backward compatibility) */}
      {formattedDate && (
        <div className="text-sm text-muted-foreground">{formattedDate}</div>
      )}
      
      {/* Content */}
      <div className="text-sm whitespace-pre-wrap">{content}</div>
      
      {/* Tags */}
      {dreamTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-4">
          {dreamTags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color + "40", color: tag.color }}
              className="text-xs font-normal border"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Dream Image */}
      {generatedImage && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Dream Visualization</h3>
          <img 
            src={generatedImage} 
            alt="Dream visualization" 
            className="rounded-md w-full h-auto"
          />
        </div>
      )}

      {/* Dream Analysis */}
      {analysis && (
        <div className="mt-4 p-3 bg-muted/40 rounded-md">
          <h3 className="text-sm font-medium mb-1">Dream Analysis</h3>
          <div className="text-sm text-muted-foreground">{analysis}</div>
        </div>
      )}
    </div>
  );
};

export default DreamDetailContent;
