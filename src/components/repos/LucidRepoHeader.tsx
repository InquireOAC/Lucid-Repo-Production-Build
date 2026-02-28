import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  handleSearch,
  tags,
  activeTags,
  onTagClick,
  onClearTags,
}: LucidRepoHeaderProps) => {
  return (
    <div className="mb-4 pt-4 space-y-3">
      {/* Search + Tabs Row */}
      <div className="flex items-center gap-2 px-1">
        <form onSubmit={handleSearch} className="flex-shrink-0" autoComplete="off">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              aria-label="Search dreams"
              type="text"
              className="pl-8 pr-3 py-1.5 h-8 w-[10rem] rounded-full text-xs bg-muted/40 border-border/40 focus:border-primary/50 focus:bg-muted/60 transition-colors"
              placeholder="Search dreams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-w-0">
          <TabsList className="w-full bg-muted/30 backdrop-blur-sm rounded-full p-0.5 h-8">
            <TabsTrigger
              value="following"
              className="flex-1 rounded-full text-xs h-7 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
            >
              Following
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="flex-1 rounded-full text-xs h-7 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
            >
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="flex-1 rounded-full text-xs h-7 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
            >
              Popular
            </TabsTrigger>
          </TabsList>
          <TabsContent value="following"></TabsContent>
          <TabsContent value="recent"></TabsContent>
          <TabsContent value="popular"></TabsContent>
        </Tabs>
      </div>

      {/* Category pills */}
      {tags.length > 0 &&
        <div className="flex flex-wrap justify-center gap-2">
          {tags.map((tag) =>
            <button
              key={tag.id}
              onClick={() => onTagClick(tag.id)}
            className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${
              activeTags.includes(tag.id) ?
              'bg-gradient-to-r from-aurora-purple to-aurora-violet text-white' :
              'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'}`
            }>
              {tag.name}
            </button>
          )}
          {activeTags.length > 0 &&
            <button
              onClick={onClearTags}
            className="px-2.5 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all">
              Clear
            </button>
          }
        </div>
      }
    </div>
  );
};

export default LucidRepoHeader;
