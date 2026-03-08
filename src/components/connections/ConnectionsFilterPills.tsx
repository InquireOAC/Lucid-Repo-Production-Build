import React from "react";
import { motion } from "framer-motion";
import type { ConnectionFilter } from "@/hooks/useDreamConnections";

const filters: { label: string; value: ConnectionFilter }[] = [
  { label: "All", value: "all" },
  { label: "My Matches", value: "matches" },
  { label: "Clusters", value: "clusters" },
  { label: "Waves", value: "waves" },
  { label: "Symbols", value: "symbols" },
];

interface Props {
  active: ConnectionFilter;
  onChange: (f: ConnectionFilter) => void;
}

const ConnectionsFilterPills: React.FC<Props> = ({ active, onChange }) => (
  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
    {filters.map((f) => (
      <button
        key={f.value}
        onClick={() => onChange(f.value)}
        className={`relative shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
          active === f.value ? "text-white" : "bg-card/60 text-muted-foreground hover:bg-card/80"
        }`}
      >
        {active === f.value && (
          <motion.div
            layoutId="connections-filter-bg"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10">{f.label}</span>
      </button>
    ))}
  </div>
);

export default ConnectionsFilterPills;
