
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// TagFilter import intentionally remains commented out

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
  // sortBy,
  // setSortBy,
  handleSearch,
  tags,
  activeTags,
  onTagClick,
  onClearTags
}: LucidRepoHeaderProps) => {
  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4" autoComplete="off">
        <Input 
          aria-label="Search dreams" 
          type="text" 
          className="max-w-xs" 
          placeholder="Search dreams or usernames..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
      </form>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="bg-dream-purple">
          <TabsTrigger value="following" className="text-zinc-50">Following</TabsTrigger>
          <TabsTrigger value="recent" className="text-stone-50">Recent</TabsTrigger>
          <TabsTrigger value="popular" className="text-stone-50">Popular</TabsTrigger>
        </TabsList>
        <TabsContent value="following"></TabsContent>
        <TabsContent value="recent"></TabsContent>
        <TabsContent value="popular"></TabsContent>
      </Tabs>

      {/* Tag filter intentionally hidden */}
      {/* <TagFilter ... /> */}
    </div>
  );
};

export default LucidRepoHeader;
