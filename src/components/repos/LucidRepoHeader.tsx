import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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

      {/* Dream Type Dropdown */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 rounded-xl border-border/30 bg-muted/20 text-sm gap-1.5">
                Dream Type
                {activeTags.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold">
                    {activeTags.length}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={activeTags.includes(tag.id)}
                  onCheckedChange={() => onTagClick(tag.id)}
                >
                  {tag.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {activeTags.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearTags} className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default LucidRepoHeader;
