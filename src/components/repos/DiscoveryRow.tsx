import React, { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface DiscoveryRowProps {
  title: string;
  children: React.ReactNode;
  onSeeAll?: () => void;
}

const DiscoveryRow: React.FC<DiscoveryRowProps> = ({ title, children, onSeeAll }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            See all
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
    </motion.section>
  );
};

export default DiscoveryRow;
