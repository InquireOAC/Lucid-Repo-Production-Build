import React from "react";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/components/ui/StaggerContainer";
import type { SyncAlert } from "@/hooks/useDreamConnections";
import { formatDistanceToNow } from "date-fns";

const SyncAlertCard: React.FC<{ alert: SyncAlert }> = ({ alert }) => (
  <motion.div
    variants={staggerItemVariants}
    className="relative overflow-hidden rounded-xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/40 to-card/80 p-4"
  >
    {/* Pulse ring */}
    <div className="absolute top-4 left-4 w-8 h-8">
      <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
      <span className="absolute inset-1 rounded-full bg-indigo-500/30 animate-pulse" />
      <span className="absolute inset-2 rounded-full bg-indigo-500/50" />
    </div>

    {alert.is_trending && (
      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
        Live
      </span>
    )}

    <div className="ml-12">
      <p className="text-sm font-bold text-indigo-300">{alert.emoji} Synchronicity Detected</p>
      <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-indigo-400 font-medium">{alert.dreamer_count} dreamers</span>
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  </motion.div>
);

export default SyncAlertCard;
