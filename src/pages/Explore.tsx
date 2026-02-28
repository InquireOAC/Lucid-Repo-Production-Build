import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserSearchResults from "@/components/explore/UserSearchResults";
import VaultTabContent from "@/components/explore/VaultTabContent";
import type { VaultCategory } from "@/data/vaultContent";
import PageTransition from "@/components/ui/PageTransition";

const tabs: { label: string; value: VaultCategory }[] = [
  { label: "Lucid Dreaming", value: "lucid-dreaming" },
  { label: "Meditation", value: "meditation" },
];

const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<VaultCategory>("lucid-dreaming");

  return (
    <PageTransition className="min-h-screen pt-safe-top">
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
              className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeTab === tab.value
                  ? "text-primary"
                  : "bg-card/60 text-muted-foreground hover:bg-card/80"
              }`}
            >
              {activeTab === tab.value && (
                <motion.div
                  layoutId="explore-tab-bg"
                  className="absolute inset-0 bg-primary/15 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <VaultTabContent category={activeTab} />
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default Explore;
