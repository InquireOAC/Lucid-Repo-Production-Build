import React from "react";
import SymbolTracker from "@/components/insights/SymbolTracker";

const Insights: React.FC = () => {
  return (
    <div className="min-h-screen pt-safe-top">
      <div className="p-4 pb-2 flex items-center gap-2">
        <h1 className="text-xl font-bold">Insights</h1>
      </div>
      <div className="px-4">
        <SymbolTracker />
      </div>
    </div>
  );
};

export default Insights;