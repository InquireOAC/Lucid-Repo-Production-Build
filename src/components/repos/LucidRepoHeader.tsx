import React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DreamTag } from "@/types/dream";

interface LucidRepoHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  tags: DreamTag[];
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
  onClearTags
}: LucidRepoHeaderProps) => {
  return (
    <div className="mb-6 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search dreams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-sm text-muted-foreground">Tag Filter:</span>
          {tags.map((tag) => (
            <Button
              size="sm"
              key={tag.id}
              variant={activeTags.includes(tag.id) ? "default" : "ghost"}
              style={{
                backgroundColor: activeTags.includes(tag.id) ? tag.color : undefined,
                color: activeTags.includes(tag.id) ? "#fff" : tag.color
              }}
              onClick={() => onTagClick(tag.id)}
            >
              {tag.name}
            </Button>
          ))}
          {activeTags.length > 0 && (
            <Button
              type="button"
              size="sm"
              onClick={onClearTags}
              variant="outline"
            >
              Clear tags
            </Button>
          )}
        </div>
      )}
      <div className="flex justify-between items-center">
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Dreams</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex justify-end">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most_liked">Most Liked</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
export default LucidRepoHeader;
