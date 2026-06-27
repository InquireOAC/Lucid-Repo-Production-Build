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
import { Search, X, Film, CheckSquare, Archive, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const sceneMeta = (d: DreamEntry): string | undefined => {
  const n = d.section_images?.filter((s) => s.image_url).length || 0;
  return n > 0 ? `${n} ${n === 1 ? "scene" : "scenes"}` : undefined;
};

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

  // Select mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Bulk delete confirmation
  const [bulkDeletePending, setBulkDeletePending] = useState(false);

  const toggleSelectMode = () => {
    setSelectMode((v) => !v);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Hide archived dreams from the main list
  const activeEntries = useMemo(
    () => entries.filter((d) => !d.is_archived),
    [entries],
  );

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

  const handleArchiveSelected = async () => {
    if (!user || selectedIds.size === 0) return;
    const ids = [...selectedIds];
    const { error } = await supabase
      .from("dream_entries")
      .update({ is_archived: true })
      .in("id", ids)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to archive dreams");
      return;
    }
    toast.success(`${ids.length} dream${ids.length !== 1 ? "s" : ""} archived`);
    setSelectedIds(new Set());
    setSelectMode(false);
    setTimeout(memoizedSyncDreams, 300);
  };

  const handleDeleteSelected = () => {
    setBulkDeletePending(true);
  };

  const confirmBulkDelete = async () => {
    if (!user || selectedIds.size === 0) return;
    const ids = [...selectedIds];
    const { error } = await supabase
      .from("dream_entries")
      .delete()
      .in("id", ids)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to delete dreams");
      setBulkDeletePending(false);
      return;
    }
    toast.success(`${ids.length} dream${ids.length !== 1 ? "s" : ""} deleted`);
    setSelectedIds(new Set());
    setSelectMode(false);
    setBulkDeletePending(false);
    setTimeout(memoizedSyncDreams, 300);
  };

  // Dynamic category list: builtins + user's actual tags + moods
  const categories: Category[] = useMemo(() => {
    const set = new Set<string>(BUILTIN_CATEGORIES);
    for (const d of activeEntries) {
      for (const t of d.tags || []) {
        const name = (tags.find((x) => x.id === t)?.name || t).trim();
        if (name) set.add(name);
      }
      if (d.mood) set.add(d.mood.charAt(0).toUpperCase() + d.mood.slice(1));
    }
    return Array.from(set);
  }, [activeEntries, tags]);

  // Search
  const searched = useMemo(() => {
    if (!searchQuery.trim()) return activeEntries;
    const q = searchQuery.toLowerCase();
    return activeEntries.filter(
      (d) =>
        d.title?.toLowerCase().includes(q) ||
        d.content?.toLowerCase().includes(q) ||
        d.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [activeEntries, searchQuery]);

  // Compose all three filters
  const filtered = useMemo(
    () => filterByDate(filterByCategory(searched, activeCategory), dateRange),
    [searched, activeCategory, dateRange],
  );

  // Hero: most recent dream with media, fallback first dream
  const heroDream = useMemo(() => activeEntries.find(hasPoster) || activeEntries[0], [activeEntries]);

  // Rails for the default "All / Any time" view
  const recentlyAdded = useMemo(() => activeEntries.slice(0, 12), [activeEntries]);
  const lucidDreams = useMemo(() => activeEntries.filter((d) => d.lucid).slice(0, 12), [activeEntries]);
  const cinematicDreams = useMemo(
    () => activeEntries.filter((d) => !!d.video_url).slice(0, 12),
    [activeEntries],
  );
  const thisMonth = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return activeEntries
      .filter((d) => {
        const t = new Date(d.created_at || d.date).getTime();
        return Number.isFinite(t) && t >= cutoff;
      })
      .slice(0, 12);
  }, [activeEntries]);

  const isFiltered = activeCategory !== "All" || dateRange !== "any" || !!searchQuery.trim();

  // Select props helper
  const selectProps = (d: DreamEntry) => ({
    isSelectMode: selectMode,
    isSelected: selectedIds.has(d.id),
    onSelect: toggleSelect,
  });

  // Pills rendered below the hero (not inside sticky header)
  const FilterPills = (
    <div className="mb-4 lg:mb-8 space-y-2 lg:space-y-3">
      {/* Category pills */}
      <div
        className="flex overflow-x-auto lg:flex-wrap gap-2 lg:gap-2.5 pb-1 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-1 lg:px-4 lg:py-1.5 rounded-full text-xs lg:text-sm transition-all border ${
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
        className="flex overflow-x-auto lg:flex-wrap gap-2 lg:gap-2.5 pb-1 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {DATE_PILLS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setDateRange(value)}
            className={`whitespace-nowrap px-3.5 py-1 lg:px-4 lg:py-1.5 rounded-full text-xs lg:text-sm transition-all border ${
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
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:max-w-7xl lg:px-12 xl:max-w-[1500px] xl:px-16 pb-10 lg:pb-16">

        {/* ── Sticky header: title + search + select toggle ────────── */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-8 lg:-mx-12 xl:-mx-16 px-4 md:px-8 lg:px-12 xl:px-16 pt-3 lg:pt-5 pb-2 lg:pb-3 bg-background/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground tracking-tight">
              My <span className="text-primary">Dreams</span>
            </h1>
            <div className="flex items-center gap-1">
              {selectMode && selectedIds.size > 0 && (
                <span className="text-xs font-semibold text-primary mr-1">
                  {selectedIds.size} selected
                </span>
              )}
              <button
                type="button"
                aria-label={selectMode ? "Exit select mode" : "Select dreams"}
                onClick={toggleSelectMode}
                className={`h-9 w-9 lg:h-11 lg:w-11 flex items-center justify-center rounded-full transition-colors ${
                  selectMode
                    ? "bg-primary/15 text-primary hover:bg-primary/25"
                    : "hover:bg-muted/40"
                }`}
              >
                {selectMode ? <X className="h-5 w-5 lg:h-6 lg:w-6" /> : <CheckSquare className="h-5 w-5 lg:h-6 lg:w-6" />}
              </button>
              {!selectMode && (
                <button
                  type="button"
                  aria-label="Search dreams"
                  onClick={() => setSearchOpen((v) => !v)}
                  className="h-9 w-9 lg:h-11 lg:w-11 flex items-center justify-center rounded-full hover:bg-muted/40 transition-colors"
                >
                  {searchOpen ? <X className="h-5 w-5 lg:h-6 lg:w-6" /> : <Search className="h-5 w-5 lg:h-6 lg:w-6" />}
                </button>
              )}
            </div>
          </div>

          {searchOpen && !selectMode && (
            <div className="mt-2 lg:mt-3">
              <Input
                autoFocus
                type="text"
                aria-label="Search dreams"
                placeholder="Search your dreams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 lg:h-12 rounded-xl text-sm lg:text-base bg-muted/30 border-border/30"
              />
            </div>
          )}
        </div>

        {/* ── Empty state ──────────────────────────────────────────── */}
        {activeEntries.length === 0 ? (
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
              <h2 className="text-base md:text-lg lg:text-2xl xl:text-3xl font-bold text-foreground mb-3 lg:mb-5">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : activeCategory !== "All"
                  ? activeCategory === "Cinematic"
                    ? "Your Cinematic Dreams"
                    : `${activeCategory} Dreams`
                  : dateRange !== "any"
                  ? DATE_PILLS.find((p) => p.value === dateRange)?.label ?? "Filtered"
                  : "All Dreams"}
                <span className="ml-2 text-xs lg:text-sm font-normal text-muted-foreground">
                  ({filtered.length})
                </span>
              </h2>

              {filtered.length === 0 ? (
                <div className="text-center py-16 lg:py-24">
                  <Film className="h-10 w-10 lg:h-14 lg:w-14 mx-auto text-muted-foreground/50 mb-3 lg:mb-5" />
                  <p className="text-sm lg:text-base text-muted-foreground">
                    No dreams match{" "}
                    {searchQuery ? `"${searchQuery}"` : "the current filters"}.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 lg:gap-5 xl:gap-6">
                  {filtered.map((d) => (
                    <JournalPosterCard key={d.id} dream={d} width="md" meta={sceneMeta(d)} {...selectProps(d)} />
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
                  <JournalPosterCard key={d.id} dream={d} meta={sceneMeta(d)} {...selectProps(d)} />
                ))}
              </PosterRail>
            )}

            {cinematicDreams.length > 0 && (
              <PosterRail title="Your Cinematics">
                {cinematicDreams.map((d) => (
                  <JournalPosterCard key={d.id} dream={d} showPlayOverlay meta={sceneMeta(d)} {...selectProps(d)} />
                ))}
              </PosterRail>
            )}

            {lucidDreams.length > 0 && (
              <PosterRail title="Lucid Dreams">
                {lucidDreams.map((d) => (
                  <JournalPosterCard key={d.id} dream={d} meta={sceneMeta(d)} {...selectProps(d)} />
                ))}
              </PosterRail>
            )}

            {thisMonth.length > 0 && (
              <PosterRail title="This Month">
                {thisMonth.map((d) => (
                  <JournalPosterCard key={d.id} dream={d} meta={sceneMeta(d)} {...selectProps(d)} />
                ))}
              </PosterRail>
            )}
          </>
        )}
      </div>

      {/* ── Bulk action bar ──────────────────────────────────────────── */}
      <AnimatePresence>
        {selectMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 md:bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="flex items-center gap-3 lg:gap-4 px-5 py-3 lg:px-7 lg:py-4 rounded-full bg-card border border-border/60 shadow-xl pointer-events-auto">
              <span className="text-sm font-semibold text-foreground">
                {selectedIds.size} dream{selectedIds.size !== 1 ? "s" : ""}
              </span>
              <div className="w-px h-5 bg-border/60" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveSelected}
                className="gap-1.5 rounded-full text-xs"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="gap-1.5 rounded-full text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Bulk delete confirmation dialog */}
      <DeleteDreamConfirmationDialog
        isOpen={bulkDeletePending}
        onOpenChange={(open) => {
          if (!open) setBulkDeletePending(false);
        }}
        onConfirmDelete={confirmBulkDelete}
      />
    </PageTransition>
  );
};

export default Journal;
