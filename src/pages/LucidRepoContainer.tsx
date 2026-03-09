import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DreamDetailWrapper from "@/components/repos/DreamDetailWrapper";
import AuthDialog from "@/components/repos/AuthDialog";
import DiscoveryHero from "@/components/repos/DiscoveryHero";
import DiscoveryRow from "@/components/repos/DiscoveryRow";
import DiscoveryDreamCard from "@/components/repos/DiscoveryDreamCard";
import DiscoverySeriesCard from "@/components/series/DiscoverySeriesCard";
import SeriesDetailPage from "@/components/series/SeriesDetailPage";
import DreamStoryPage from "@/pages/DreamStoryPage";
import { usePublicDreamTags } from "@/hooks/usePublicDreamTags";
import { useDiscoveryDreams } from "@/hooks/useDiscoveryDreams";
import { usePublicSeries, DreamSeries } from "@/hooks/useDreamSeries";
import { useLucidRepoDreamActions } from "@/hooks/useLucidRepoDreamActions";
import { ArrowLeft, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageTransition from "@/components/ui/PageTransition";
import { DreamEntry } from "@/types/dream";
import { Skeleton } from "@/components/ui/skeleton";

const LucidRepoContainer = () => {
  const { dreamId } = useParams<{ dreamId?: string }>();
  const { user } = useAuth();

  // If a dreamId is present, render the full-page story reader
  if (dreamId) {
    return <DreamStoryPage />;
  }

  return <LucidRepoDiscovery />;
};

const FILTER_CATEGORIES = ["All", "Lucid", "Nightmare", "Recurring", "Adventure", "Spiritual", "Flying", "Prophetic", "Sleep Paralysis"];

const LucidRepoDiscovery = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedSeries, setSelectedSeries] = useState<DreamSeries | null>(null);
  const [expandedSection, setExpandedSection] = useState<{ title: string; dreams: DreamEntry[] } | null>(null);
  const { series: publicSeries } = usePublicSeries();

  const {
    featured,
    trending,
    following,
    newReleases,
    tagSections,
    isLoading,
    refetch,
  } = useDiscoveryDreams(user);

  // Combine all dreams for detail wrapper state management
  const allDreams = [
    ...(featured ? [featured] : []),
    ...trending,
    ...following,
    ...newReleases,
    ...tagSections.flatMap(s => s.dreams),
  ];

  // Deduplicate
  const seenIds = new Set<string>();
  const uniqueDreams = allDreams.filter(d => {
    if (seenIds.has(d.id)) return false;
    seenIds.add(d.id);
    return true;
  });

  const [dreamsState, setDreamsState] = useState<DreamEntry[]>([]);
  React.useEffect(() => {
    if (uniqueDreams.length > 0) setDreamsState(uniqueDreams);
  }, [uniqueDreams.length]);

  const {
    selectedDream,
    authDialogOpen,
    setAuthDialogOpen,
    handleOpenDream,
    handleCloseDream,
    handleNavigateToProfile,
    handleDreamLike,
    handleDreamLikeFromCard,
    handleDreamUpdate,
  } = useLucidRepoDreamActions(
    user,
    dreamsState,
    setDreamsState,
    refetch,
    async () => false,
    refetch
  );

  const { tags: publicTags, isLoading: tagsLoading } = usePublicDreamTags();

  // Combined search + category filter
  const filterDreams = (dreams: DreamEntry[]) => {
    let result = dreams;
    if (activeFilter !== "All") {
      const filterLower = activeFilter.toLowerCase();
      result = result.filter(d =>
        d.tags?.some(t => t.toLowerCase() === filterLower)
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.content?.toLowerCase().includes(q) ||
        d.profiles?.username?.toLowerCase().includes(q) ||
        d.profiles?.display_name?.toLowerCase().includes(q)
      );
    }
    return result;
  };

  const showLoading = isLoading || tagsLoading;

  // Expanded section view
  if (expandedSection) {
    return (
      <PageTransition className="container mx-auto pt-safe-top px-4 sm:px-6 pb-6 max-w-6xl pl-safe-left pr-safe-right overflow-x-hidden">
        <div className="flex items-center gap-3 pt-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setExpandedSection(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">{expandedSection.title}</h1>
        </div>
        {expandedSection.dreams.length === 0 ? (
          <div className="text-center py-20">
            <Moon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No dreams in this section</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {expandedSection.dreams.map(dream => (
              <div key={dream.id} className="w-full">
                <DiscoveryDreamCard
                  dream={dream}
                  onOpenDream={handleOpenDream}
                  onLike={handleDreamLikeFromCard}
                  onUserClick={handleNavigateToProfile}
                />
              </div>
            ))}
          </div>
        )}
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto pt-safe-top px-4 sm:px-6 pb-6 max-w-6xl pl-safe-left pr-safe-right overflow-x-hidden">
      {/* Search */}
      <div className="pt-3 mb-4">
        <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              aria-label="Search dreams"
              type="text"
              className="pl-9 pr-4 h-10 w-full rounded-xl text-sm bg-muted/20 border-border/30 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-muted/30 transition-colors"
              placeholder="Search dreams, stories, dreamers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Category Filter Bar */}
      <div className="flex overflow-x-auto gap-5 mb-4 pb-1 pl-[3px] scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {FILTER_CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveFilter(cat)}
            className={`whitespace-nowrap pb-2 text-sm transition-all border-b-2 ${
              activeFilter === cat
                ? "font-bold text-primary border-primary"
                : "font-medium text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {showLoading ? (
        <div className="space-y-6">
          <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-[140px] aspect-[2/3] rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-[140px] aspect-[2/3] rounded-xl flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      ) : uniqueDreams.length === 0 ? (
        <div className="text-center py-20">
          <Moon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No dreams yet</h3>
          <p className="text-muted-foreground">Be the first to share a dream!</p>
        </div>
      ) : (
        <>
          {/* Featured Hero */}
          {featured && !searchQuery && activeFilter === "All" && (
            <DiscoveryHero
              dream={featured}
              onOpenDream={handleOpenDream}
              onLike={handleDreamLikeFromCard}
              onUserClick={handleNavigateToProfile}
            />
          )}

          {/* Trending Now */}
          {filterDreams(trending).length > 0 && (
            <DiscoveryRow title="🔥 Trending Now" onSeeAll={() => setExpandedSection({ title: "🔥 Trending Now", dreams: filterDreams(trending) })}>
              {filterDreams(trending).map(dream => (
                <DiscoveryDreamCard
                  key={dream.id}
                  dream={dream}
                  onOpenDream={handleOpenDream}
                  onLike={handleDreamLikeFromCard}
                  onUserClick={handleNavigateToProfile}
                />
              ))}
            </DiscoveryRow>
          )}

          {/* From People You Follow */}
          {user && filterDreams(following).length > 0 && (
            <DiscoveryRow title="📖 From People You Follow">
              {filterDreams(following).map(dream => (
                <DiscoveryDreamCard
                  key={dream.id}
                  dream={dream}
                  onOpenDream={handleOpenDream}
                  onLike={handleDreamLikeFromCard}
                  onUserClick={handleNavigateToProfile}
                />
              ))}
            </DiscoveryRow>
          )}

          {/* New Releases */}
          {filterDreams(newReleases).length > 0 && (
            <DiscoveryRow title="✨ New Releases">
              {filterDreams(newReleases).map(dream => (
                <DiscoveryDreamCard
                  key={dream.id}
                  dream={dream}
                  onOpenDream={handleOpenDream}
                  onLike={handleDreamLikeFromCard}
                  onUserClick={handleNavigateToProfile}
                />
              ))}
            </DiscoveryRow>
          )}

          {/* Dream Series */}
          {!searchQuery && activeFilter === "All" && publicSeries.length > 0 && (
            <DiscoveryRow title="📚 Dream Series">
              {publicSeries.map(s => (
                <DiscoverySeriesCard
                  key={s.id}
                  series={s}
                  onClick={setSelectedSeries}
                />
              ))}
            </DiscoveryRow>
          )}

          {/* Tag-based sections */}
          {!searchQuery && activeFilter === "All" && tagSections.map(section => (
            <DiscoveryRow key={section.tag} title={`${section.tag} Dreams`}>
              {section.dreams.map(dream => (
                <DiscoveryDreamCard
                  key={dream.id}
                  dream={dream}
                  onOpenDream={handleOpenDream}
                  onLike={handleDreamLikeFromCard}
                  onUserClick={handleNavigateToProfile}
                />
              ))}
            </DiscoveryRow>
          ))}
        </>
      )}


      {selectedSeries && (
        <SeriesDetailPage
          series={selectedSeries}
          open={!!selectedSeries}
          onClose={() => setSelectedSeries(null)}
          isOwner={user?.id === selectedSeries.user_id}
          onOpenDream={handleOpenDream}
        />
      )}

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </PageTransition>
  );
};

export default LucidRepoContainer;
