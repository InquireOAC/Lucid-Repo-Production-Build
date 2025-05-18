
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import TagFilter is intentionally kept commented out

interface LucidRepoHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  tags: any[];
  activeTags: string[];
  onTagClick: (tagId: string) => void;
  onClearTags: () => void;
}

const LucidRepoHeader = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy,
  handleSearch,
  tags,
  activeTags,
  onTagClick,
  onClearTags,
}: LucidRepoHeaderProps) => {
  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4">
        {/* Simple search input */}
        <input
          aria-label="Search dreams"
          type="text"
          className="bg-white border px-3 py-2 rounded w-full max-w-xs shadow-inner outline-none"
          placeholder="Search dreams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* Simple sort order select */}
        <select
          aria-label="Sort dreams"
          className="bg-white border px-3 py-2 rounded shadow-inner outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="popular">Popular</option>
          <option value="recent">Recent</option>
        </select>
      </form>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        <TabsContent value="popular"></TabsContent>
        <TabsContent value="recent"></TabsContent>
      </Tabs>

      {/* Tag filter intentionally hidden */}
      {/* <TagFilter ... /> */}
    </div>
  );
};

export default LucidRepoHeader;
