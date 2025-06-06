
import React, { useState, useEffect, useCallback } from "react";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import DreamDetail from "@/components/DreamDetail";
import JournalHeader from "@/components/journal/JournalHeader";
import TagFilter from "@/components/journal/TagFilter";
import AddDreamDialog from "@/components/journal/AddDreamDialog";
import EditDreamDialog from "@/components/journal/EditDreamDialog";
import DeleteDreamConfirmationDialog from "@/components/journal/DeleteDreamConfirmationDialog";
import JournalTabs from "@/components/journal/JournalTabs";
import { DreamEntry } from "@/types/dream";

const Journal = () => {
  const {
    entries,
    filteredDreams,
    tags,
    uniqueTagsInDreams,
    activeTagIds,
    isSubmitting,
    isAddingDream,
    setIsAddingDream,
    isEditingDream,
    setIsEditingDream,
    selectedDream,
    setSelectedDream,
    dreamToDelete,
    setDreamToDelete,
    handleAddDream,
    handleEditDream,
    handleDeleteDream,
    handleTogglePublic,
    handleTagClick,
    setActiveTagIds,
    user,
    syncDreamsFromDb,
  } = useDreamJournal();

  const [activeTab, setActiveTab] = useState("all");

  // Memoize the sync function to prevent infinite loops
  const memoizedSyncDreams = useCallback(() => {
    if (user) {
      syncDreamsFromDb();
    }
  }, [user, syncDreamsFromDb]);

  // Only sync on initial mount and when user changes
  useEffect(() => {
    memoizedSyncDreams();
  }, [user]); // Remove syncDreamsFromDb from dependencies

  // Refresh data when tab changes (background refresh)
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // Refresh in background when switching tabs
    if (user) {
      setTimeout(memoizedSyncDreams, 100);
    }
  };

  const handleAddDreamAndClose = async (dreamData: any) => {
    await handleAddDream(dreamData);
    setIsAddingDream(false);
    // Sync after a short delay to avoid conflicts
    setTimeout(memoizedSyncDreams, 500);
  };

  const handleEditDreamSubmit = async (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
    analysis?: string;
    generatedImage?: string;
    imagePrompt?: string;
  }): Promise<void> => {
    if (!selectedDream) return;
    await handleEditDream(dreamData, selectedDream.id);
    setIsEditingDream(false);
    setSelectedDream(null);
    // Sync after a short delay to avoid conflicts
    setTimeout(memoizedSyncDreams, 500);
  };

  const confirmDeleteDream = async () => {
    if (dreamToDelete) {
      await handleDeleteDream(dreamToDelete);
      setDreamToDelete(null);
      if (user) {
        memoizedSyncDreams();
      }
    }
  };

  const handleOpenEditDialog = (dream: DreamEntry) => {
    setSelectedDream(dream);
    setIsEditingDream(true);
  };
  
  const handleDreamDetailUpdate = (id: string, updates: Partial<DreamEntry>) => {
    if (selectedDream) {
      const dreamPayload = {
        title: updates.title ?? selectedDream.title,
        content: updates.content ?? selectedDream.content,
        tags: updates.tags ?? selectedDream.tags ?? [],
        lucid: typeof updates.lucid === 'boolean' ? updates.lucid : selectedDream.lucid,
        mood: updates.mood ?? selectedDream.mood ?? "Neutral",
        analysis: updates.analysis ?? selectedDream.analysis,
        generatedImage: updates.generatedImage ?? selectedDream.generatedImage,
        imagePrompt: updates.imagePrompt ?? selectedDream.imagePrompt,
      };
      handleEditDream(dreamPayload, id);
    }
  };

  return (
    <div className="min-h-screen dream-background p-4 md:p-6">
      <JournalHeader onAddDream={() => setIsAddingDream(true)} />

      <TagFilter
        tags={uniqueTagsInDreams}
        activeTags={activeTagIds}
        onTagClick={handleTagClick}
        onClearTags={() => setActiveTagIds([])}
      />

      <JournalTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        allEntries={entries}
        filteredDreams={filteredDreams}
        tags={tags}
        onSelectDream={setSelectedDream}
        onEditDream={handleOpenEditDialog}
        onTogglePublic={handleTogglePublic}
        onDeleteDream={(dreamId) => setDreamToDelete(dreamId)}
        onTagClickInList={handleTagClick}
        onAddDream={() => setIsAddingDream(true)}
      />

      <AddDreamDialog
        isOpen={isAddingDream}
        onOpenChange={(open) => {
          setIsAddingDream(open);
          if (!open && user) {
            // Small delay to avoid conflicts
            setTimeout(memoizedSyncDreams, 300);
          }
        }}
        onSubmit={handleAddDreamAndClose}
        tags={tags}
        isSubmitting={isSubmitting}
      />

      {selectedDream && (
        <EditDreamDialog
          isOpen={isEditingDream}
          onOpenChange={(open) => {
            setIsEditingDream(open);
            if (!open) {
              setSelectedDream(null);
              if (user) {
                setTimeout(memoizedSyncDreams, 300);
              }
            }
          }}
          onSubmit={handleEditDreamSubmit}
          existingDream={selectedDream}
          tags={tags}
          isSubmitting={isSubmitting}
        />
      )}

      {selectedDream && !isEditingDream && (
        <DreamDetail
          dream={selectedDream}
          tags={tags}
          onClose={() => {
            setSelectedDream(null);
            if (user) {
              setTimeout(memoizedSyncDreams, 300);
            }
          }}
          onUpdate={handleDreamDetailUpdate}
          onDelete={(id) => {
            setDreamToDelete(id);
            setSelectedDream(null);
          }}
          isAuthenticated={!!user}
        />
      )}

      <DeleteDreamConfirmationDialog
        isOpen={!!dreamToDelete}
        onOpenChange={(open) => {
          if (!open) setDreamToDelete(null);
        }}
        onConfirmDelete={confirmDeleteDream}
      />
    </div>
  );
};

export default Journal;
