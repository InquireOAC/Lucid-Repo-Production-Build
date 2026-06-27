import React from "react";

interface StatTileProps {
  value: React.ReactNode;
  label: string;
}

/** Compact glass stat tile used in the Home "This Week" row. */
const StatTile: React.FC<StatTileProps> = ({ value, label }) => (
  <div className="flex-1 min-w-0 rounded-xl bg-white/[0.04] border border-white/[0.06] px-2 py-3 text-center">
    <div className="text-lg lg:text-2xl font-bold text-foreground leading-none">{value}</div>
    <div className="text-[10px] lg:text-xs text-muted-foreground mt-1 truncate">{label}</div>
  </div>
);

export default StatTile;
