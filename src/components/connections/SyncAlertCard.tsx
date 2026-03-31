import React from "react";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/components/ui/StaggerContainer";
import type { SyncAlert } from "@/hooks/useDreamConnections";
import { formatDistanceToNow } from "date-fns";

const SyncAlertCard: React.FC<{ alert: SyncAlert }> = ({ alert }) => {
  return (
    <motion.div
      variants={staggerItemVariants}
      className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card/90 backdrop-blur-sm p-5"
    >
      <div className="flex items-start gap-4">
        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
          <span className="absolute inset-1 rounded-full bg-primary/15 animate-pulse" />
          <span className="absolute inset-3 rounded-full bg-primary/30" />
          <span className="relative text-lg">{alert.emoji}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-foreground">Synchronicity Detected</p>
            {alert.is_trending && (
              <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[10px] font-bold uppercase tracking-wider">
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{alert.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-primary">{alert.dreamer_count} dreamers</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
};

export default SyncAlertCard;
