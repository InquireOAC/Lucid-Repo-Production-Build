import React, { useState, useEffect } from "react";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import DreamDetail from "@/components/DreamDetail";
import JournalHeader from "@/components/journal/JournalHeader";
import TagFilter from "@/components/journal/TagFilter";
import AddDreamDialog from "@/components/journal/AddDreamDialog";
import EditDreamDialog from "@/components/journal/EditDreamDialog";
import DeleteDreamConfirmationDialog from "@/components/journal/DeleteDreamConfirmationDialog";
import JournalTabs from "@/components/journal/JournalTabs";
import { DreamEntry } from "@/types/dream"; // Ensure DreamEntry is imported
import PullToRefresh from "@/components/ui/PullToRefresh";

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

  useEffect(() => {
    if (user) {
      syncDreamsFromDb();
    }
  }, [user, syncDreamsFromDb]); // Added syncDreamsFromDb to dependency array

  const handleAddDreamAndClose = async (dreamData: any) => {
    await handleAddDream(dreamData);
    setIsAddingDream(false);
    if (user) {
      setTimeout(() => syncDreamsFromDb(), 500); // Sync after a short delay
    }
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
    if (user) {
      setTimeout(() => syncDreamsFromDb(), 500); // Sync after a short delay
    }
  };

  const confirmDeleteDream = async () => {
    if (dreamToDelete) {
      await handleDeleteDream(dreamToDelete);
      setDreamToDelete(null);
      if (user) {
        syncDreamsFromDb(); // Refresh after deletion
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
        mood: updates.mood ?? selectedDream.mood ?? "Neutral", // Default mood if undefined
        analysis: updates.analysis ?? selectedDream.analysis,
        generatedImage: updates.generatedImage ?? selectedDream.generatedImage,
        imagePrompt: updates.imagePrompt ?? selectedDream.imagePrompt,
      };
      handleEditDream(dreamPayload, id);
    }
  };

  return (
    <PullToRefresh onRefresh={syncDreamsFromDb}>
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
          onTabChange={setActiveTab}
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
            if (!open && user) syncDreamsFromDb();
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
                if (user) syncDreamsFromDb();
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
              if (user) syncDreamsFromDb();
            }}
            onUpdate={handleDreamDetailUpdate}
            onDelete={(id) => { // onDelete in DreamDetail usually triggers a confirmation
              setDreamToDelete(id); // Set dream to delete to open confirmation dialog
              setSelectedDream(null); // Close detail view
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
    </PullToRefresh>
  );
};

export default Journal;
