
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Film, BookOpen } from "lucide-react";
import { AdminVideoButton } from "@/components/videos/AdminVideoManager";
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
  mode: "dreams" | "videos";
  setMode: (mode: "dreams" | "videos") => void;
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
  onClearTags,
  mode,
  setMode
}: LucidRepoHeaderProps) => {
  return (
    <div className="mb-6">
      {/* Mode Toggle Header */}
      <div className="text-center mb-6">
        <div className="inline-flex glass-card rounded-lg p-1 border-white/20">
          <Button
            variant={mode === "dreams" ? "default" : "ghost"}
            onClick={() => setMode("dreams")}
            className={`px-6 py-2 transition-all duration-200 ${
              mode === "dreams" 
                ? "bg-gradient-to-r from-dream-purple to-dream-pink text-white shadow-lg" 
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Lucid Repo
          </Button>
          <Button
            variant={mode === "videos" ? "default" : "ghost"}
            onClick={() => setMode("videos")}
            className={`px-6 py-2 transition-all duration-200 ${
              mode === "videos" 
                ? "bg-gradient-to-r from-dream-purple to-dream-pink text-white shadow-lg" 
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Film className="w-4 h-4 mr-2" />
            Lucid Studios
          </Button>
          {mode === "videos" && <AdminVideoButton />}
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4" autoComplete="off">
        <Input 
          aria-label={mode === "dreams" ? "Search dreams" : "Search videos"} 
          type="text" 
          className="max-w-xs" 
          placeholder={mode === "dreams" ? "Search dreams..." : "Search videos..."} 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
      </form>

      {mode === "dreams" && (
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
      )}

      {/* Tag filter intentionally hidden */}
      {/* <TagFilter ... /> */}
    </div>
  );
};

export default LucidRepoHeader;
