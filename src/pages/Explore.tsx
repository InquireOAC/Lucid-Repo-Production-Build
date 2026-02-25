import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserSearchResults from "@/components/explore/UserSearchResults";
import VaultTabContent from "@/components/explore/VaultTabContent";
import type { VaultCategory } from "@/data/vaultContent";

const tabs: { label: string; value: VaultCategory }[] = [
  { label: "Lucid Dreaming", value: "lucid-dreaming" },
  { label: "Meditation", value: "meditation" },
];

const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<VaultCategory>("lucid-dreaming");

  return (
    <div className="min-h-screen pt-safe-top">
      <div className="p-4 pb-2">
        <h1 className="text-xl font-bold text-foreground">Explore</h1>
        <p className="text-xs text-muted-foreground mt-1">Your knowledge vault</p>
      </div>

      <div className="px-4 space-y-5">
        {/* User Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full border-primary/15 bg-card/60 backdrop-blur-md focus:ring-primary/30"
          />
        </div>

        <UserSearchResults query={searchQuery} />

        {/* Tab Switcher */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.value
                  ? "bg-primary/15 text-primary"
                  : "bg-card/60 text-muted-foreground hover:bg-card/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <VaultTabContent category={activeTab} />
      </div>
    </div>
  );
};

export default Explore;
