import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Film, BookOpen, Search } from "lucide-react";
import { AdminVideoButton } from "@/components/videos/AdminVideoManager";

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
  mode: "dreams" | "videos";
  setMode: (mode: "dreams" | "videos") => void;
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
  mode,
  setMode
}: LucidRepoHeaderProps) => {
  return (
    <div className="mb-8 pt-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold gradient-text">Lucid Repo</h1>
        </div>
        <p className="text-muted-foreground">Explore dreams from around the world</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex glass-card rounded-full p-1 border-primary/20">
          <Button
            variant={mode === "dreams" ? "aurora" : "ghost"}
            onClick={() => setMode("dreams")}
            className="rounded-full px-6"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Dreams
          </Button>
          <Button
            variant={mode === "videos" ? "aurora" : "ghost"}
            onClick={() => setMode("videos")}
            className="rounded-full px-6"
          >
            <Film className="w-4 h-4 mr-2" />
            Studios
          </Button>
        </div>
      </div>
      
      {mode === "videos" && (
        <div className="flex justify-center">
          <AdminVideoButton />
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex justify-center" autoComplete="off">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            aria-label={mode === "dreams" ? "Search dreams" : "Search videos"} 
            type="text" 
            className="pl-10 pr-4 py-2 rounded-full bg-secondary/30 border-primary/20 focus:border-primary/50" 
            placeholder={mode === "dreams" ? "Search dreams..." : "Search videos..."} 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
      </form>

      {/* Tabs */}
      {mode === "dreams" && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center">
            <TabsList className="bg-secondary/30 rounded-full p-1">
              <TabsTrigger 
                value="following" 
                className="rounded-full px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-aurora-purple data-[state=active]:to-aurora-violet data-[state=active]:text-white"
              >
                Following
              </TabsTrigger>
              <TabsTrigger 
                value="recent"
                className="rounded-full px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-aurora-purple data-[state=active]:to-aurora-violet data-[state=active]:text-white"
              >
                Recent
              </TabsTrigger>
              <TabsTrigger 
                value="popular"
                className="rounded-full px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-aurora-purple data-[state=active]:to-aurora-violet data-[state=active]:text-white"
              >
                Popular
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="following"></TabsContent>
          <TabsContent value="recent"></TabsContent>
          <TabsContent value="popular"></TabsContent>
        </Tabs>
      )}

      {/* Category pills */}
      {mode === "dreams" && tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagClick(tag.id)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                activeTags.includes(tag.id)
                  ? 'bg-gradient-to-r from-aurora-purple to-aurora-violet text-white'
                  : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
              }`}
            >
              {tag.name}
            </button>
          ))}
          {activeTags.length > 0 && (
            <button
              onClick={onClearTags}
              className="px-3 py-1 rounded-full text-sm bg-destructive/20 text-destructive hover:bg-destructive/30 transition-all"
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
