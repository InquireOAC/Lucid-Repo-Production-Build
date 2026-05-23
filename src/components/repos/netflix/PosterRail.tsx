import React from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}

const PosterRail: React.FC<Props> = ({ title, onSeeAll, children }) => (
  <section className="mb-6 -mx-4 sm:-mx-6 md:mx-0">
    <div className="flex items-center justify-between mb-2 px-4 sm:px-6 md:px-0">
      <h2 className="text-base md:text-lg font-bold text-foreground">{title}</h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          See all <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
    <div className="flex overflow-x-auto gap-2 px-4 sm:px-6 md:px-0 pb-1 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
      {children}
    </div>
  </section>
);

export default PosterRail;