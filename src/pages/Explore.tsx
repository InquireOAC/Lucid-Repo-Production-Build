import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserSearchResults from "@/components/explore/UserSearchResults";
import TechniqueGridCard from "@/components/explore/TechniqueGridCard";
import { techniques } from "@/components/insights/techniqueData";

const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen pt-safe-top">
      <div className="p-4 pb-2">
        <h1 className="text-xl font-bold">Explore</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* User Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-full border-primary/15 bg-card/60 backdrop-blur-md" />

        </div>

        <UserSearchResults query={searchQuery} />

        {/* Techniques */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Lucid Dreaming Techniques</h2>
          <div className="grid grid-cols-2 gap-3">
            {techniques.map((tech, i) =>
            <TechniqueGridCard key={i} technique={tech} index={i} />
            )}
          </div>
        </div>
      </div>
    </div>);

};

export default Explore;