import React from "react";
import { motion } from "framer-motion";

interface ConnectionsHeaderProps {
  matchCount: number;
  activeWaves: number;
  syncScore: number;
}

const ConnectionsHeader: React.FC<ConnectionsHeaderProps> = ({ matchCount, activeWaves, syncScore }) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dream Connections</h1>
        <p className="text-xs text-muted-foreground mt-1">When dreams align across the collective consciousness</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard value={matchCount} label="Your Matches" color="text-purple-400" borderColor="border-purple-500/20" />
        <StatCard value={activeWaves} label="Active Waves" color="text-emerald-400" borderColor="border-emerald-500/20" />
        <StatCard value={syncScore} label="Sync Score" color="text-amber-400" borderColor="border-amber-500/20" />
      </div>
    </div>
  );
};

const StatCard = ({ value, label, color, borderColor }: { value: number; label: string; color: string; borderColor: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-card/60 backdrop-blur-sm rounded-xl border ${borderColor} p-3 text-center`}
  >
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
  </motion.div>
);

export default ConnectionsHeader;
