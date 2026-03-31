import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { staggerItemVariants } from "@/components/ui/StaggerContainer";
import type { SyncAlert } from "@/hooks/useDreamConnections";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import SymbolAvatar from "@/components/profile/SymbolAvatar";

interface DreamerProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  avatar_symbol: string | null;
  avatar_color: string | null;
}

const MAX_AVATARS = 4;

const SyncAlertCard: React.FC<{ alert: SyncAlert }> = ({ alert }) => {
  const [profiles, setProfiles] = useState<DreamerProfile[]>([]);

  // dreamer_ids removed for privacy - show count only

  const remaining = Math.max(0, alert.dreamer_count - MAX_AVATARS);

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
              <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{alert.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          {profiles.map((p) => (
            <SymbolAvatar
              key={p.id}
              symbol={p.avatar_symbol}
              color={p.avatar_color}
              avatarUrl={p.avatar_url}
              fallbackLetter={p.display_name?.[0] || p.username?.[0] || "U"}
              size={28}
            />
          ))}
          {remaining > 0 && (
            <span className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              +{remaining}
            </span>
          )}
          <span className="text-xs font-medium text-primary ml-1.5">{alert.dreamer_count} dreamers</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
};

export default SyncAlertCard;
