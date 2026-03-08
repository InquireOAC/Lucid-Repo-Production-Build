import React from "react";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/components/ui/StaggerContainer";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import type { CollectiveWave } from "@/hooks/useDreamConnections";

const CollectiveWaveCard: React.FC<{ wave: CollectiveWave }> = ({ wave }) => (
  <motion.div
    variants={staggerItemVariants}
    className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-card/80 p-4"
  >
    <span className="absolute top-2 right-2 text-5xl opacity-10 pointer-events-none">{wave.emoji}</span>

    <p className="text-sm font-bold text-emerald-300">{wave.emoji} {wave.theme} Dreams</p>
    <p className="text-xs text-muted-foreground mt-1">{wave.description}</p>

    <div className="flex items-center gap-4 mt-3">
      <div>
        <p className="text-lg font-bold text-emerald-400">{wave.dream_count}</p>
        <p className="text-[10px] text-muted-foreground uppercase">Dreams</p>
      </div>
      {wave.percent_change > 0 && (
        <div className="flex items-center gap-1 text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-sm font-bold">+{wave.percent_change}%</span>
        </div>
      )}
    </div>

    {wave.top_symbols.length > 0 && (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {wave.top_symbols.map((s) => (
          <Badge key={s} className="text-[10px] bg-emerald-500/20 text-emerald-300 border-0">{s}</Badge>
        ))}
      </div>
    )}
  </motion.div>
);

export default CollectiveWaveCard;
