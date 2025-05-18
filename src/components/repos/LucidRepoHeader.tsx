import React from "react";
import SearchBar from "@/components/SearchBar";
import SortOrderSelect from "@/components/SortOrderSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TagFilter from "@/components/journal/TagFilter";

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
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search dreams..."
        />
        <SortOrderSelect sortBy={sortBy} setSortBy={setSortBy} />
      </form>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        <TabsContent value="popular"></TabsContent>
        <TabsContent value="recent"></TabsContent>
      </Tabs>

      {/* Hiding the tag filter on Lucid Repo page */}
      {/* <TagFilter
        tags={tags}
        activeTags={activeTags}
        onTagClick={onTagClick}
        onClearTags={onClearTags}
      /> */}
    </div>
  );
};

export default LucidRepoHeader;
