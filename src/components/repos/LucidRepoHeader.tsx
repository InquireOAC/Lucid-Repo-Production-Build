import React, { useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-3 pt-3 space-y-2.5">
      {/* Tabs Row */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-muted/20 backdrop-blur-sm rounded-xl p-0.5 h-9">
          <TabsTrigger
            value="following"
            className="flex-1 rounded-lg text-[13px] font-medium h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Following
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="flex-1 rounded-lg text-[13px] font-medium h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Recent
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="flex-1 rounded-lg text-[13px] font-medium h-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
          >
            Popular
          </TabsTrigger>
        </TabsList>
        <TabsContent value="following"></TabsContent>
        <TabsContent value="recent"></TabsContent>
        <TabsContent value="popular"></TabsContent>
      </Tabs>

      {/* Search */}
      <form onSubmit={handleSearch} autoComplete="off">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            aria-label="Search dreams"
            type="text"
            className="pl-9 pr-4 h-9 w-full rounded-xl text-sm bg-muted/20 border-border/30 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-muted/30 transition-colors"
            placeholder="Search dreams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Dream Type Carousel */}
      {tags.length > 0 && (
        <div
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => onTagClick(tag.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeTags.includes(tag.id)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/25 text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {tag.name}
            </button>
          ))}
          {activeTags.length > 0 && (
            <button
              type="button"
              onClick={onClearTags}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-all whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LucidRepoHeader;
