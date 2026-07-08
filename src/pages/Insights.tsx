import React from "react";
import SymbolTracker from "@/components/insights/SymbolTracker";

const Insights: React.FC = () => {
  return (
    <div className="min-h-screen pt-safe-top">
      <div className="p-4 md:px-8 md:pt-6 pb-2 flex items-center gap-2 max-w-6xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold">Insights</h1>
      </div>
      <div className="px-4 md:px-8 max-w-6xl mx-auto pb-8">
        <SymbolTracker />
      </div>
    </div>
  );
};

export default Insights;
