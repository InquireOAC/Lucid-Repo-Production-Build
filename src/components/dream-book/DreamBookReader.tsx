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
        {dreams.map((dream) => (
          <DreamBookPageSpread key={dream.id} dream={dream} mode="reader" />
        ))}
      </div>
    </div>
  );
};

export default DreamBookReader;
