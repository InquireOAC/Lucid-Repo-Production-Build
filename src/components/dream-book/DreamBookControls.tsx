import React from "react";
import { ChevronLeft, ChevronRight, BookOpen, AlignLeft, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DreamBookControlsProps {
  viewMode: "book" | "reader";
  onViewModeChange: (mode: "book" | "reader") => void;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onExport: () => void;
  onFilter: () => void;
}

const DreamBookControls = ({
  viewMode,
  onViewModeChange,
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onExport,
  onFilter,
}: DreamBookControlsProps) => {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      {/* Left: filter + export */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={onFilter} className="h-9 w-9">
          <Filter className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onExport} className="h-9 w-9">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      {/* Center: page nav (book mode only) */}
      {viewMode === "book" && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrev}
            disabled={currentPage <= 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono min-w-[4rem] text-center">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={currentPage >= totalPages - 1}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Right: view mode toggle */}
      <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
        <button
          onClick={() => onViewModeChange("book")}
          className={`p-1.5 rounded-md transition-colors ${
            viewMode === "book"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("reader")}
          className={`p-1.5 rounded-md transition-colors ${
            viewMode === "reader"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DreamBookControls;
