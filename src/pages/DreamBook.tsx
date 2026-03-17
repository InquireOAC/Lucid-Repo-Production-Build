import React, { useState, useMemo } from "react";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useAuth } from "@/contexts/AuthContext";
import { DreamEntry } from "@/types/dream";
import DreamBook3DViewer, { buildPages } from "@/components/dream-book/DreamBook3DViewer";
import DreamBookReader from "@/components/dream-book/DreamBookReader";
import DreamBookControls from "@/components/dream-book/DreamBookControls";
import DreamBookFilterPanel, { BookFilter } from "@/components/dream-book/DreamBookFilterPanel";
import DreamBookExportModal from "@/components/dream-book/DreamBookExportModal";
import DreamBookEmptyState from "@/components/dream-book/DreamBookEmptyState";
import { Loader2 } from "lucide-react";

const DreamBook = () => {
  const { entries, isLoading } = useJournalEntries();
  const { profile } = useAuth();

  const [viewMode, setViewMode] = useState<"book" | "reader">("book");
  const [currentPage, setCurrentPage] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [filter, setFilter] = useState<BookFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const authorName = profile?.display_name || profile?.username || "Dreamer";

  const filteredDreams = useMemo(() => {
    let dreams = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    if (filter === "lucid") {
      dreams = dreams.filter((d) => d.lucid);
    } else if (filter === "selected" && selectedIds.size > 0) {
      dreams = dreams.filter((d) => selectedIds.has(d.id));
    }
    return dreams;
  }, [entries, filter, selectedIds]);

  // Total pages = built from the page expansion logic
  const totalPages = useMemo(() => buildPages(filteredDreams).length, [filteredDreams]);

  const handleApplyFilter = (f: BookFilter, ids: Set<string>) => {
    setFilter(f);
    setSelectedIds(ids);
    setCurrentPage(0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (entries.length === 0) {
    return <DreamBookEmptyState />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="text-center pt-4 pb-1 px-4">
        <h1 className="text-xl font-bold font-serif text-foreground">Dream Book</h1>
        <p className="text-xs text-muted-foreground">
          {filteredDreams.length} dream{filteredDreams.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Controls */}
      <DreamBookControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
        onExport={() => setExportOpen(true)}
        onFilter={() => setFilterOpen(true)}
      />

      {/* Main content */}
      {viewMode === "book" ? (
        <DreamBook3DViewer
          dreams={filteredDreams}
          authorName={authorName}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      ) : (
        <DreamBookReader dreams={filteredDreams} authorName={authorName} />
      )}

      {/* Filter panel */}
      <DreamBookFilterPanel
        open={filterOpen}
        onOpenChange={setFilterOpen}
        allDreams={entries}
        filter={filter}
        selectedIds={selectedIds}
        onApply={handleApplyFilter}
      />

      {/* Export modal */}
      <DreamBookExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        dreams={filteredDreams}
        authorName={authorName}
      />
    </div>
  );
};

export default DreamBook;
