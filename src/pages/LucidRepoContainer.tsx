
import React, { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/repos/AuthDialog";
import StoryListCard from "@/components/repos/StoryListCard";
import DiscoverySeriesCard from "@/components/series/DiscoverySeriesCard";
import SeriesDetailPage from "@/components/series/SeriesDetailPage";
import DreamStoryPage from "@/pages/DreamStoryPage";
import HeroPoster from "@/components/repos/netflix/HeroPoster";
import PosterRail from "@/components/repos/netflix/PosterRail";
import PosterCard from "@/components/repos/netflix/PosterCard";
import TopTenCard from "@/components/repos/netflix/TopTenCard";
import ContinueReadingCard from "@/components/repos/netflix/ContinueReadingCard";
import CategoryHeroCard from "@/components/repos/netflix/CategoryHeroCard";
import { usePublicDreamTags } from "@/hooks/usePublicDreamTags";
import { useDiscoveryDreams } from "@/hooks/useDiscoveryDreams";
import { usePublicSeries, DreamSeries } from "@/hooks/useDreamSeries";
import { useLucidRepoDreamActions } from "@/hooks/useLucidRepoDreamActions";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { useDreamList } from "@/hooks/useDreamList";
import { ArrowLeft, Moon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageTransition from "@/components/ui/PageTransition";
import lucidRepoLogo from "@/assets/lucid-repo-rings-logo.png";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedSeries, setSelectedSeries] = useState<DreamSeries | null>(null);
  const [sortMode, setSortMode] = useState<"popular" | "new">("popular");
  const { series: publicSeries } = usePublicSeries();
  const { recentIds, history } = useReadingHistory();
  const { has: inList, toggle: toggleList, ids: myListIds } = useDreamList();

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

  // Build queue IDs
  const trendingIds = trending.map(d => d.id);

  // Deterministic daily hero
  const heroDream = useMemo(() => {
    if (!trending.length && !featured) return featured || null;
    const pool = [featured, ...trending].filter(Boolean) as DreamEntry[];
    if (!pool.length) return null;
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) hash = (hash * 31 + today.charCodeAt(i)) | 0;
    return pool[Math.abs(hash) % pool.length];
  }, [featured, trending]);

  const topTen = useMemo(() => {
    const scored = [...uniqueDreams]
      .map(d => ({
        d,
        score: (d.like_count || 0) * 3 + (d.comment_count || 0) * 2 + (d.view_count || 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(x => x.d);
    return scored;
  }, [uniqueDreams]);

  const continueReading = useMemo(
    () => recentIds.map(id => uniqueDreams.find(d => d.id === id)).filter(Boolean) as DreamEntry[],
    [recentIds, uniqueDreams]
  );

  const myListDreams = useMemo(
    () => myListIds.map(id => uniqueDreams.find(d => d.id === id)).filter(Boolean) as DreamEntry[],
    [myListIds, uniqueDreams]
  );

  const lastReadDream = continueReading[0];
  const becauseYouRead = useMemo(() => {
    if (!lastReadDream) return [];
    const tags = (lastReadDream.tags || []).map(t => t.toLowerCase());
    if (!tags.length) return [];
    return uniqueDreams
      .filter(d => d.id !== lastReadDream.id && d.tags?.some(t => tags.includes(t.toLowerCase())))
      .slice(0, 12);
  }, [lastReadDream, uniqueDreams]);

  // Derive expanded section from URL param
  const expandedSection = useMemo(() => {
    if (!expandedSectionKey) return null;
    const sectionMap: Record<string, { title: string; dreams: DreamEntry[] }> = {
      following: { title: "From People You Follow", dreams: filterDreams(following) },
      trending: { title: "Trending Stories", dreams: filterDreams(trending) },
      new: { title: "New Releases", dreams: filterDreams(newReleases) },
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
      <PageTransition className="container mx-auto pt-safe-top px-4 sm:px-6 pb-6 max-w-6xl pl-safe-left pr-safe-right overflow-x-hidden">
        <div className="flex items-center gap-3 pt-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/lucid-repo')}>
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
          <div>
            {expandedSection.dreams.map(dream => (
              <CategoryHeroCard
                key={dream.id}
                dream={dream}
                inList={inList(dream.id)}
                onToggleList={toggleList}
              />
            ))}
          </div>
        )}
      </PageTransition>
    );
  }

  return (
    <PageTransition className="container mx-auto pt-safe-top px-4 sm:px-6 md:px-8 pb-6 max-w-6xl pl-safe-left pr-safe-right overflow-x-hidden">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 md:mx-0 px-4 sm:px-6 md:px-0 pt-3 pb-2 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img
              src={lucidRepoLogo}
              alt="Lucid Repo"
              className="h-8 w-8 md:h-9 md:w-9 object-contain flex-shrink-0"
            />
            <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight leading-none">
              Lucid Repo
            </h1>
          </div>
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(v => !v)}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted/40"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
        </div>

        {searchOpen && (
          <div className="mb-2">
            <Input
              autoFocus
              type="text"
              aria-label="Search dreams"
              className="h-10 rounded-xl text-sm bg-muted/30 border-border/30"
              placeholder="Search dreams, dreamers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {showLoading ? (
        <div className="space-y-6 mt-4">
          <Skeleton className="w-full aspect-[3/4] md:aspect-[21/9] rounded-2xl" />
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="flex-shrink-0 w-[130px] aspect-[2/3] rounded-md" />
            ))}
          </div>
        </div>
      ) : activeFilter !== "All" ? (
        <>
          {/* Category filter pills */}
          <div className="flex overflow-x-auto gap-2 pb-1 pt-3 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {FILTER_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs transition-all border ${
                  activeFilter === cat
                    ? "bg-foreground text-background border-foreground font-semibold"
                    : "bg-transparent text-foreground/80 border-border/50 hover:bg-muted/30 font-medium"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Sort toggle */}
          <div className="flex justify-end mb-3 mt-4">
            <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
              {(["popular", "new"] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSortMode(mode)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    sortMode === mode
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "popular" ? "Popular" : "New"}
                </button>
              ))}
            </div>
          </div>
          {categoryDreams.length === 0 ? (
            <div className="text-center py-20">
              <Moon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No {activeFilter.toLowerCase()} dreams</h3>
              <p className="text-muted-foreground">Try a different category</p>
            </div>
          ) : (
            <div>
              {categoryDreams.map(dream => (
                <CategoryHeroCard
                  key={dream.id}
                  dream={dream}
                  inList={inList(dream.id)}
                  onToggleList={toggleList}
                />
              ))}
            </div>
          )}
        </>
      ) : uniqueDreams.length === 0 ? (
        <div className="text-center py-20">
          <Moon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No dreams yet</h3>
          <p className="text-muted-foreground">Be the first to share a dream!</p>
        </div>
      ) : (
        <>
          {/* Hero */}
          {heroDream && !searchQuery && (
            <HeroPoster
              dream={heroDream}
              inList={inList(heroDream.id)}
              onToggleList={toggleList}
            />
          )}

          {/* Category filter pills — below hero, above Top 10 */}
          <div className="flex overflow-x-auto gap-2 pb-1 pt-1 mb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {FILTER_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs transition-all border ${
                  activeFilter === cat
                    ? "bg-foreground text-background border-foreground font-semibold"
                    : "bg-transparent text-foreground/80 border-border/50 hover:bg-muted/30 font-medium"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Top 10 Today */}
          {topTen.length > 0 && !searchQuery && (
            <PosterRail title="Top 10 Dreams Today">
              {topTen.map((d, i) => (
                <TopTenCard key={d.id} dream={d} rank={i + 1} />
              ))}
            </PosterRail>
          )}

          {/* Continue Reading */}
          {continueReading.length > 0 && !searchQuery && (
            <PosterRail title="Continue Reading">
              {continueReading.map(d => (
                <ContinueReadingCard key={d.id} dream={d} />
              ))}
            </PosterRail>
          )}

          {/* My List */}
          {myListDreams.length > 0 && !searchQuery && (
            <PosterRail title="My List">
              {myListDreams.map(d => <PosterCard key={d.id} dream={d} />)}
            </PosterRail>
          )}

          {/* From People You Follow */}
          {user && filterDreams(following).length > 0 && (
            <PosterRail title="From Dreamers You Follow" onSeeAll={() => navigateToSection("following")}>
              {filterDreams(following).map(d => <PosterCard key={d.id} dream={d} />)}
            </PosterRail>
          )}

          {/* Recommended */}
          {filterDreams(trending).length > 0 && (
            <PosterRail title="Recommended for You" onSeeAll={() => navigateToSection("trending")}>
              {filterDreams(trending).map(d => <PosterCard key={d.id} dream={d} />)}
            </PosterRail>
          )}

          {/* Because you read ... */}
          {becauseYouRead.length > 0 && !searchQuery && lastReadDream && (
            <PosterRail title={`Because you read "${lastReadDream.title}"`}>
              {becauseYouRead.map(d => <PosterCard key={d.id} dream={d} />)}
            </PosterRail>
          )}

          {/* New Releases */}
          {filterDreams(newReleases).length > 0 && (
            <PosterRail title="Recently Added" onSeeAll={() => navigateToSection("new")}>
              {filterDreams(newReleases).map(d => <PosterCard key={d.id} dream={d} />)}
            </PosterRail>
          )}

          {/* Dream-type rows */}
          {!searchQuery && tagSections.map(section => (
            <PosterRail
              key={section.tag}
              title={`${section.tag} Dreams`}
              onSeeAll={() => navigateToSection(`tag-${section.tag.toLowerCase()}`)}
            >
              {section.dreams.map(d => <PosterCard key={d.id} dream={d} />)}
            </PosterRail>
          ))}

          {/* Dream Series */}
          {!searchQuery && publicSeries.length > 0 && (
            <section className="mb-6">
              <h2 className="text-base md:text-lg font-bold text-foreground mb-2">
                Dream Series
              </h2>
              <div className="flex overflow-x-auto gap-2 pb-1 snap-x scrollbar-hide" style={{ scrollbarWidth: "none" }}>
                {publicSeries.map(s => (
                  <DiscoverySeriesCard key={s.id} series={s} onClick={setSelectedSeries} />
                ))}
              </div>
            </section>
          )}
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
