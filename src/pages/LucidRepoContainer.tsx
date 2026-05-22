
import React, { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/repos/AuthDialog";
import DiscoveryHero from "@/components/repos/DiscoveryHero";
import DiscoveryRow from "@/components/repos/DiscoveryRow";
import DiscoveryDreamCard from "@/components/repos/DiscoveryDreamCard";
import StoryListCard from "@/components/repos/StoryListCard";
import DiscoverySeriesCard from "@/components/series/DiscoverySeriesCard";
import SeriesDetailPage from "@/components/series/SeriesDetailPage";
import MasonryDreamGrid from "@/components/repos/MasonryDreamGrid";
import DreamStoryPage from "@/pages/DreamStoryPage";
import { usePublicDreamTags } from "@/hooks/usePublicDreamTags";
import { useDiscoveryDreams } from "@/hooks/useDiscoveryDreams";
import { usePublicSeries, DreamSeries } from "@/hooks/useDreamSeries";
import { useLucidRepoDreamActions } from "@/hooks/useLucidRepoDreamActions";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { ArrowLeft, Moon, Search, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageTransition from "@/components/ui/PageTransition";
import { DreamEntry } from "@/types/dream";
import { Skeleton } from "@/components/ui/skeleton";

const LucidRepoContainer = () => {
  const { dreamId } = useParams<{ dreamId?: string }>();

  if (dreamId) {
    return <DreamStoryPage />;
  }

  return <LucidRepoDiscovery />;
};

const FILTER_CATEGORIES = ["All", "Lucid", "Nightmare", "Recurring", "Adventure", "Spiritual", "Flying", "Prophetic", "Sleep Paralysis"];

const LucidRepoDiscovery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expandedSectionKey = searchParams.get("section");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedSeries, setSelectedSeries] = useState<DreamSeries | null>(null);
  const [sortMode, setSortMode] = useState<"popular" | "new">("popular");
  const { series: publicSeries } = usePublicSeries();
  const { recentIds } = useReadingHistory();

  const {
    featured,
    trending,
    following,
    newReleases,
    tagSections,
    isLoading,
    refetch,
  } = useDiscoveryDreams(user);

  // Combine all dreams
  const allDreams = [
    ...(featured ? [featured] : []),
    ...trending,
    ...following,
    ...newReleases,
    ...tagSections.flatMap(s => s.dreams),
  ];

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

  // Search + category filter
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

  React.useEffect(() => {
    setSortMode("popular");
  }, [activeFilter]);

  // Category grid dreams
  const categoryDreams = useMemo(() => {
    if (activeFilter === "All") return [];
    const filterLower = activeFilter.toLowerCase();
    let result = uniqueDreams.filter(d =>
      d.tags?.some(t => t.toLowerCase() === filterLower)
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.content?.toLowerCase().includes(q) ||
        d.profiles?.username?.toLowerCase().includes(q) ||
        d.profiles?.display_name?.toLowerCase().includes(q)
      );
    }
    if (sortMode === "popular") {
      result.sort((a, b) => ((b.like_count || 0) + (b.comment_count || 0)) - ((a.like_count || 0) + (a.comment_count || 0)));
    } else {
      result.sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
    }
    return result;
  }, [activeFilter, uniqueDreams, searchQuery, sortMode]);

  const showLoading = isLoading || tagsLoading;

  // Build queue IDs for continuous reading
  const trendingIds = trending.map(d => d.id);

  // Derive expanded section from URL param
  const expandedSection = useMemo(() => {
    if (!expandedSectionKey) return null;
    const sectionMap: Record<string, { title: string; dreams: DreamEntry[] }> = {
      following: { title: "📖 From People You Follow", dreams: filterDreams(following) },
      trending: { title: "🔥 Trending Stories", dreams: filterDreams(trending) },
      new: { title: "✨ New Releases", dreams: filterDreams(newReleases) },
    };
    // Check tag sections
    for (const section of tagSections) {
      sectionMap[`tag-${section.tag.toLowerCase()}`] = { title: `${section.tag} Dreams`, dreams: section.dreams };
    }
    return sectionMap[expandedSectionKey] || null;
  }, [expandedSectionKey, following, trending, newReleases, tagSections, searchQuery, activeFilter]);

  const navigateToSection = (key: string) => {
    navigate(`/lucid-repo?section=${encodeURIComponent(key)}`);
  };

  // Expanded section view
  if (expandedSection) {
    return (
      <PageTransition className="min-h-screen bg-black text-white">
        <div className="container mx-auto pt-safe-top px-4 sm:px-6 pb-6 max-w-6xl pl-safe-left pr-safe-right overflow-x-hidden">
          <div className="flex items-center gap-3 pt-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/lucid-repo')} className="text-white hover:bg-white/10 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-extrabold text-white">{expandedSection.title}</h1>
          </div>
          {expandedSection.dreams.length === 0 ? (
            <div className="text-center py-20">
              <Moon className="h-12 w-12 mx-auto text-white/30 mb-4" />
              <p className="text-white/60">No dreams in this section</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expandedSection.dreams.map(dream => (
                <StoryListCard
                  key={dream.id}
                  dream={dream}
                  onLike={handleDreamLikeFromCard}
                  onUserClick={handleNavigateToProfile}
                  queueIds={expandedSection.dreams.map(d => d.id)}
                />
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-black text-white">
      <div className="container mx-auto pt-safe-top px-4 sm:px-6 md:px-8 pb-6 max-w-6xl pl-safe-left pr-safe-right overflow-x-hidden">
        {/* Desktop page header */}
        <div className="hidden md:flex items-center justify-between pt-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Lucid Repo</h1>
            <p className="text-sm text-white/60 mt-1">Explore shared dreams from the community</p>
          </div>
        </div>

        {/* Search */}
        <div className="pt-3 md:pt-0 mb-4">
        <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
          <div className="relative max-w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              aria-label="Search dreams"
              type="text"
              className="pl-9 pr-4 h-10 w-full rounded-xl text-sm bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/30 focus:bg-white/10 transition-colors"
              placeholder="Search dreams, stories, dreamers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        </div>

        {/* Category Filter Chips */}
        <div className="flex overflow-x-auto gap-2 mb-5 pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {FILTER_CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveFilter(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all ${
              activeFilter === cat
                ? "bg-white text-black font-semibold shadow-sm"
                : "bg-white/10 text-white/70 hover:bg-white/20 font-medium"
            }`}
          >
            {cat}
          </button>
        ))}
        </div>

      {showLoading ? (
        <div className="space-y-6">
          <Skeleton className="w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl bg-white/5" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28 w-full rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      ) : activeFilter !== "All" ? (
        <>
          {/* Sort toggle */}
          <div className="flex justify-end mb-3">
            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5">
              {(["popular", "new"] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSortMode(mode)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    sortMode === mode
                      ? "bg-white text-black shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {mode === "popular" ? "Popular" : "New"}
                </button>
              ))}
            </div>
          </div>
          {categoryDreams.length === 0 ? (
            <div className="text-center py-20">
              <Moon className="h-12 w-12 mx-auto text-white/30 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-white">No {activeFilter.toLowerCase()} dreams</h3>
              <p className="text-white/60">Try a different category</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categoryDreams.map(dream => (
                <StoryListCard
                  key={dream.id}
                  dream={dream}
                  onLike={handleDreamLikeFromCard}
                  onUserClick={handleNavigateToProfile}
                  queueIds={categoryDreams.map(d => d.id)}
                />
              ))}
            </div>
          )}
        </>
      ) : uniqueDreams.length === 0 ? (
        <div className="text-center py-20">
          <Moon className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-white">No dreams yet</h3>
          <p className="text-white/60">Be the first to share a dream!</p>
        </div>
      ) : (
        <>
          {/* Featured Hero — taller with Start Reading CTA */}
          {featured && !searchQuery && (
            <DiscoveryHero
              dream={featured}
              onOpenDream={handleOpenDream}
              onLike={handleDreamLikeFromCard}
              onUserClick={handleNavigateToProfile}
            />
          )}

          {/* Continue Reading — from reading history */}
          {recentIds.length > 0 && !searchQuery && (() => {
            const continueReading = uniqueDreams.filter(d => recentIds.includes(d.id));
            if (continueReading.length === 0) return null;
            return (
              <DiscoveryRow title="Continue Reading">
                {continueReading.map(dream => (
                  <StoryListCard
                    key={dream.id}
                    dream={dream}
                    onLike={handleDreamLikeFromCard}
                    onUserClick={handleNavigateToProfile}
                    variant="wide"
                  />
                ))}
              </DiscoveryRow>
            );
          })()}

          {/* From People You Follow — horizontal cards */}
          {user && filterDreams(following).length > 0 && (
            <DiscoveryRow title="From People You Follow" onSeeAll={() => navigateToSection('following')}>
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

          {/* Trending Stories — horizontal posters */}
          {filterDreams(trending).length > 0 && (
            <DiscoveryRow title="Trending Stories" onSeeAll={() => navigateToSection('trending')}>
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

          {/* New Releases — horizontal posters */}
          {filterDreams(newReleases).length > 0 && (
            <DiscoveryRow title="New Releases" onSeeAll={() => navigateToSection('new')}>
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
          {!searchQuery && publicSeries.length > 0 && (
            <DiscoveryRow title="Dream Series">
              {publicSeries.map(s => (
                <DiscoverySeriesCard
                  key={s.id}
                  series={s}
                  onClick={setSelectedSeries}
                />
              ))}
            </DiscoveryRow>
          )}

          {/* Tag sections — horizontal cards */}
          {!searchQuery && tagSections.map(section => (
            <DiscoveryRow key={section.tag} title={`${section.tag} Dreams`} onSeeAll={() => navigateToSection(`tag-${section.tag.toLowerCase()}`)}>
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
      </div>
    </PageTransition>
  );
};

export default LucidRepoContainer;
