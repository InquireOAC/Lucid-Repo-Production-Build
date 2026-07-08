import React from "react";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/components/ui/StaggerContainer";
import { TrendingUp } from "lucide-react";
import type { CollectiveWave } from "@/hooks/useDreamConnections";
import { formatDistanceToNow } from "date-fns";

const CollectiveWaveCard: React.FC<{ wave: CollectiveWave }> = ({ wave }) => (
  <motion.div
    variants={staggerItemVariants}
    className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-card/90 backdrop-blur-sm p-5"
  >
    {/* Large decorative emoji */}
    <span className="absolute -top-1 -right-1 text-[80px] opacity-[0.12] pointer-events-none select-none">
      {wave.emoji}
    </span>

    <p className="text-base font-bold text-emerald-400">
      {wave.emoji} {wave.theme}
    </p>
    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{wave.description}</p>

    {/* Stats row */}
    <div className="flex items-end gap-6 mt-4">
      <div>
        <p className="text-3xl font-bold text-foreground">{wave.dream_count}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Dreams</p>
      </div>
      {wave.percent_change > 0 && (
        <div>
          <div className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xl font-bold">+{wave.percent_change}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">vs last week</p>
        </div>
      )}
    </div>

    {/* Symbol pills */}
    {wave.top_symbols.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-4">
        {wave.top_symbols.map((s) => (
          <span
            key={s}
            className="px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
          >
            {s}
          </span>
        ))}
      </div>
    )}

    {/* Timeframe */}
    <p className="text-xs text-muted-foreground/60 mt-4">
      Past {formatDistanceToNow(new Date(wave.timeframe_start))}
    </p>
  </motion.div>
);

export default CollectiveWaveCard;
