import React from "react";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/components/ui/StaggerContainer";
import type { DreamCluster } from "@/hooks/useDreamConnections";
import { format } from "date-fns";

const DreamClusterCard: React.FC<{ cluster: DreamCluster }> = ({ cluster }) => (
  <motion.div
    variants={staggerItemVariants}
    className="relative overflow-hidden rounded-2xl border border-amber-500/15 bg-card/90 backdrop-blur-sm p-5"
  >
    {/* Large decorative emoji */}
    <span className="absolute -top-2 -right-2 text-[80px] opacity-[0.12] pointer-events-none select-none">
      {cluster.emoji}
    </span>

    <div className="flex items-start gap-3">
      <span className="text-3xl mt-0.5">{cluster.emoji}</span>
      <div>
        <p className="text-base font-bold text-amber-400">{cluster.event_name}</p>
        <p className="text-xs text-amber-400/70 mt-0.5">
          {format(new Date(cluster.event_date), "MMMM d, yyyy")} · {cluster.dream_count} dreams
        </p>
      </div>
    </div>

    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{cluster.description}</p>

    {cluster.top_themes.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-4">
        {cluster.top_themes.map((t) => (
          <span
            key={t}
            className="px-3 py-1 rounded-full text-xs font-medium border border-amber-500/30 text-amber-400 bg-amber-500/5"
          >
            {t}
          </span>
        ))}
      </div>
    )}
  </motion.div>
);

export default DreamClusterCard;
