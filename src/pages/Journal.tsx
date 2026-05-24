import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import AddDreamDialog from "@/components/journal/AddDreamDialog";
import DeleteDreamConfirmationDialog from "@/components/journal/DeleteDreamConfirmationDialog";
import EmptyJournal from "@/components/journal/EmptyJournal";
import JournalHeroPoster from "@/components/journal/JournalHeroPoster";
import JournalPosterCard from "@/components/journal/JournalPosterCard";
import PosterRail from "@/components/repos/netflix/PosterRail";
import FAB from "@/components/ui/FAB";
import { DreamEntry } from "@/types/dream";
import PageTransition from "@/components/ui/PageTransition";
import { Search, X, Film } from "lucide-react";
import { Input } from "@/components/ui/input";

// ─── filter types ─────────────────────────────────────────────────────────────

const BUILTIN_CATEGORIES = ["All", "Cinematic", "Lucid", "Nightmare", "Recurring", "Flying"] as const;
type Category = string;
type DateRange = "any" | "today" | "week" | "month";

const DATE_PILLS: { value: DateRange; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const DATE_CUTOFF_MS: Record<Exclude<DateRange, "any">, number> = {
  today: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

// ─── filter helpers ───────────────────────────────────────────────────────────

const hasPoster = (d: DreamEntry) =>
  !!(d.generatedImage || d.image_url || d.section_images?.some((s) => s.image_url));

const filterByCategory = (dreams: DreamEntry[], cat: Category): DreamEntry[] => {
  if (cat === "All") return dreams;
  if (cat === "Cinematic") return dreams.filter((d) => !!d.video_url);
  if (cat === "Lucid") return dreams.filter((d) => d.lucid);
  const lower = cat.toLowerCase();
  return dreams.filter(
    (d) =>
      d.mood?.toLowerCase() === lower ||
      d.tags?.some((t) => t.toLowerCase() === lower),
  );
};

const filterByDate = (dreams: DreamEntry[], range: DateRange): DreamEntry[] => {
  if (range === "any") return dreams;
  const cutoff = DATE_CUTOFF_MS[range];
  const now = Date.now();
  return dreams.filter((d) => {
    const t = new Date(d.created_at || d.date).getTime();
    return Number.isFinite(t) && now - t <= cutoff;
  });
};

// ─── component ────────────────────────────────────────────────────────────────

const Journal = () => {
  const navigate = useNavigate();
  const {
    entries,
    isSubmitting,
    isAddingDream,
    setIsAddingDream,
    tags,
    dreamToDelete,
    setDreamToDelete,
    handleAddDream,
    handleDeleteDream,
    user,
    syncDreamsFromDb,
  } = useDreamJournal();

  const memoizedSyncDreams = useCallback(() => {
    if (user) syncDreamsFromDb();
  }, [user, syncDreamsFromDb]);

  useEffect(() => {
    memoizedSyncDreams();
  }, [user]);

  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [dateRange, setDateRange] = useState<DateRange>("any");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddDreamAndClose = async (dreamData: any) => {
    await handleAddDream(dreamData);
    setIsAddingDream(false);
    setTimeout(memoizedSyncDreams, 500);
  };

  const confirmDeleteDream = async () => {
    if (dreamToDelete) {
      await handleDeleteDream(dreamToDelete);
      setDreamToDelete(null);
      if (user) memoizedSyncDreams();
    }
  };

  // Dynamic category list: builtins + user's actual tags + moods
  const categories: Category[] = useMemo(() => {
    const set = new Set<string>(BUILTIN_CATEGORIES);
    for (const d of entries) {
      for (const t of d.tags || []) {
        const name = (tags.find((x) => x.id === t)?.name || t).trim();
        if (name) set.add(name);
      }
      if (d.mood) set.add(d.mood.charAt(0).toUpperCase() + d.mood.slice(1));
    }
    return Array.from(set);
  }, [entries, tags]);

  // Search
  const searched = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.content?.toLowerCase().includes(q) ||
        d.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [entries, searchQuery]);

  // Compose all three filters
  const filtered = useMemo(
    () => filterByDate(filterByCategory(searched, activeCategory), dateRange),
    [searched, activeCategory, dateRange],
  );

  // Hero: most recent dream with media, fallback first dream
  const heroDream = useMemo(() => entries.find(hasPoster) || entries[0], [entries]);

  // Rails for the default "All / Any time" view
  const recentlyAdded = useMemo(() => entries.slice(0, 12), [entries]);
  const lucidDreams = useMemo(() => entries.filter((d) => d.lucid).slice(0, 12), [entries]);
  const cinematicDreams = useMemo(
    () => entries.filter((d) => !!d.video_url).slice(0, 12),
    [entries],
  );
  const thisMonth = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return entries
      .filter((d) => {
        const t = new Date(d.created_at || d.date).getTime();
        return Number.isFinite(t) && t >= cutoff;
      })
      .slice(0, 12);
  }, [entries]);

  const isFiltered = activeCategory !== "All" || dateRange !== "any" || !!searchQuery.trim();

  // Pills rendered below the hero (not inside sticky header)
  const FilterPills = (
    <div className="mb-4 space-y-2">
      {/* Category pills */}
      <div
        className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs transition-all border ${
              activeCategory === cat
                ? "bg-foreground text-background border-foreground font-semibold"
                : "bg-transparent text-foreground/80 border-border/50 hover:bg-muted/30 font-medium"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Date pills */}
      <div
        className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {DATE_PILLS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setDateRange(value)}
            className={`whitespace-nowrap px-3.5 py-1 rounded-full text-xs transition-all border ${
              dateRange === value
                ? "bg-primary text-primary-foreground border-primary font-semibold"
                : "bg-transparent text-foreground/70 border-border/40 hover:bg-muted/30 font-medium"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <PageTransition className="min-h-screen starry-background pt-safe-top pb-safe-bottom">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-10">

        {/* ── Sticky header: title + search only ──────────────────── */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 pt-3 pb-2 bg-background/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              My <span className="text-primary">Dreams</span>
            </h1>
            <button
              type="button"
              aria-label="Search dreams"
              onClick={() => setSearchOpen((v) => !v)}
              className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted/40 transition-colors"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
          </div>

          {searchOpen && (
            <div className="mt-2">
              <Input
                autoFocus
                type="text"
                aria-label="Search dreams"
                placeholder="Search your dreams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-xl text-sm bg-muted/30 border-border/30"
              />
            </div>
          )}
        </div>

        {/* ── Empty state ──────────────────────────────────────────── */}
        {entries.length === 0 ? (
          <>
            {FilterPills}
            <EmptyJournal onAddDream={() => setIsAddingDream(true)} />
          </>
        ) : isFiltered ? (
          /* ── Filtered / search view: hero → pills → poster grid ─── */
          <>
            {heroDream && <JournalHeroPoster dream={heroDream} size="compact" />}
            {FilterPills}

            <div>
              <h2 className="text-base md:text-lg font-bold text-foreground mb-3">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : activeCategory !== "All"
                  ? activeCategory === "Cinematic"
                    ? "Your Cinematic Dreams"
                    : `${activeCategory} Dreams`
                  : dateRange !== "any"
                  ? DATE_PILLS.find((p) => p.value === dateRange)?.label ?? "Filtered"
                  : "All Dreams"}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({filtered.length})
                </span>
              </h2>

              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Film className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No dreams match{" "}
                    {searchQuery ? `"${searchQuery}"` : "the current filters"}.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {filtered.map((d) => (
                    <JournalPosterCard key={d.id} dream={d} width="md" />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── Default view: hero → pills → rails ─────────────────── */
          <>
            {heroDream && <JournalHeroPoster dream={heroDream} />}

            {FilterPills}

            {recentlyAdded.length > 0 && (
              <PosterRail title="Recently Added">
                {recentlyAdded.map((d) => (
                  <JournalPosterCard key={d.id} dream={d} />
                ))}
              </PosterRail>
            )}

            {cinematicDreams.length > 0 && (
              <PosterRail title="Your Cinematics">
                {cinematicDreams.map((d) => (
                  <JournalPosterCard key={d.id} dream={d} showPlayOverlay />
                ))}
              </PosterRail>
            )}

            {lucidDreams.length > 0 && (
              <PosterRail title="Lucid Dreams">
                {lucidDreams.map((d) => (
                  <JournalPosterCard key={d.id} dream={d} />
                ))}
              </PosterRail>
            )}

            {thisMonth.length > 0 && (
              <PosterRail title="This Month">
                {thisMonth.map((d) => (
                  <JournalPosterCard key={d.id} dream={d} />
                ))}
              </PosterRail>
            )}
          </>
        )}
      </div>

      <FAB label="New Dream" to="/journal/new" />

      <AddDreamDialog
        isOpen={isAddingDream}
        onOpenChange={(open) => {
          setIsAddingDream(open);
          if (!open && user) setTimeout(memoizedSyncDreams, 300);
        }}
        onSubmit={handleAddDreamAndClose}
        tags={tags}
        isSubmitting={isSubmitting}
      />

      <DeleteDreamConfirmationDialog
        isOpen={!!dreamToDelete}
        onOpenChange={(open) => {
          if (!open) setDreamToDelete(null);
        }}
        onConfirmDelete={confirmDeleteDream}
      />
    </PageTransition>
  );
};

export default Journal;
