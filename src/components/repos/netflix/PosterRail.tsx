import React from "react";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}

const PosterRail: React.FC<Props> = ({ title, onSeeAll, children }) => (
  <section className="mb-6 lg:mb-10">
    <div className="flex items-center justify-between mb-2 lg:mb-3">
      <h2 className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-foreground">{title}</h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-xs lg:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          See all <ChevronRight className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
        </button>
      )}
    </div>
    <div className="flex overflow-x-auto gap-2 lg:gap-4 xl:gap-5 pb-1 lg:pb-3 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
      {children}
    </div>
  </section>
);

export default PosterRail;