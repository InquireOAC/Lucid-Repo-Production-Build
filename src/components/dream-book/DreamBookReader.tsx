import React from "react";
import { DreamEntry } from "@/types/dream";
import DreamBookCover from "./DreamBookCover";
import DreamBookPageSpread from "./DreamBookPageSpread";

interface DreamBookReaderProps {
  dreams: DreamEntry[];
  authorName: string;
}

const DreamBookReader = ({ dreams, authorName }: DreamBookReaderProps) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-20">
      <DreamBookCover authorName={authorName} dreams={dreams} compact />

      <div className="mt-6">
        {dreams.map((dream) => {
          const validScenes = (dream.section_images || []).filter(
            (s: any) => s.text || s.image_url || s.video_url
          );

          if (validScenes.length > 0) {
            return (
              <div key={dream.id}>
                <DreamBookPageSpread dream={dream} mode="reader" isTitlePage />
                {validScenes.map((scene, idx) => (
                  <DreamBookPageSpread
                    key={`${dream.id}-scene-${idx}`}
                    dream={dream}
                    mode="reader"
                    scene={scene}
                  />
                ))}
                {dream.analysis && (
                  <div className="bg-card/60 border border-border/30 rounded-lg p-4 mb-8">
                    <p className="text-xs font-semibold text-primary mb-1">Dream Analysis</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{dream.analysis}</p>
                  </div>
                )}
              </div>
            );
          }

          return <DreamBookPageSpread key={dream.id} dream={dream} mode="reader" />;
        })}
      </div>
    </div>
  );
};

export default DreamBookReader;
