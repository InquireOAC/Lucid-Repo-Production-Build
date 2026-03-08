import React from "react";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/components/ui/StaggerContainer";
import { Badge } from "@/components/ui/badge";
import type { DreamCluster } from "@/hooks/useDreamConnections";
import { format } from "date-fns";

const DreamClusterCard: React.FC<{ cluster: DreamCluster }> = ({ cluster }) => (
  <motion.div
    variants={staggerItemVariants}
    className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-card/80 p-4"
  >
    <span className="absolute top-2 right-2 text-5xl opacity-10 pointer-events-none">{cluster.emoji}</span>

    <p className="text-sm font-bold text-amber-300">{cluster.emoji} {cluster.event_name}</p>
    <p className="text-[10px] text-muted-foreground mt-0.5">
      {format(new Date(cluster.event_date), "MMM d, yyyy")} · {cluster.dream_count} dreams
    </p>
    <p className="text-xs text-muted-foreground mt-1">{cluster.description}</p>

    {cluster.top_themes.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {cluster.top_themes.map((t) => (
          <Badge key={t} className="text-[10px] bg-amber-500/20 text-amber-300 border-0">{t}</Badge>
        ))}
      </div>
    )}
  </motion.div>
);

export default DreamClusterCard;
