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
          const hasScenes = dream.section_images && dream.section_images.length > 0;

          if (hasScenes) {
            return (
              <div key={dream.id}>
                {/* Title/intro spread */}
                <DreamBookPageSpread dream={dream} mode="reader" isTitlePage />
                {/* Individual scene spreads */}
                {dream.section_images!.map((scene, idx) => (
                  <DreamBookPageSpread
                    key={`${dream.id}-scene-${idx}`}
                    dream={dream}
                    mode="reader"
                    scene={scene}
                  />
                ))}
                {/* Analysis after all scenes */}
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
