
import React, { useState, useEffect, useCallback } from "react";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import DreamDetail from "@/components/DreamDetail";
import JournalHeader from "@/components/journal/JournalHeader";
import TagFilter from "@/components/journal/TagFilter";
import AddDreamDialog from "@/components/journal/AddDreamDialog";
import EditDreamDialog from "@/components/journal/EditDreamDialog";
import DeleteDreamConfirmationDialog from "@/components/journal/DeleteDreamConfirmationDialog";
import DreamsList from "@/components/journal/DreamsList";
import EmptyJournal from "@/components/journal/EmptyJournal";
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
    audioUrl?: string;
  }): Promise<void> => {
    if (!selectedDream) return;
    console.log('Edit dream submit with audio:', dreamData.audioUrl);
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
    if (!selectedDream) return;
    
    // Skip DB call for comment-count-only updates (just update local state)
    const isCommentCountOnly = Object.keys(updates).every(k => 
      k === 'comment_count' || k === 'commentCount'
    );
    if (isCommentCountOnly) return;

    // Only pass actually changed fields
    const dreamPayload: Record<string, any> = {};
    if (updates.title !== undefined) dreamPayload.title = updates.title;
    if (updates.content !== undefined) dreamPayload.content = updates.content;
    if (updates.tags !== undefined) dreamPayload.tags = updates.tags;
    if (updates.lucid !== undefined) dreamPayload.lucid = updates.lucid;
    if (updates.mood !== undefined) dreamPayload.mood = updates.mood;
    if (updates.analysis !== undefined) dreamPayload.analysis = updates.analysis;
    if (updates.generatedImage !== undefined) dreamPayload.generatedImage = updates.generatedImage;
    if (updates.imagePrompt !== undefined) dreamPayload.imagePrompt = updates.imagePrompt;
    if (updates.is_public !== undefined || updates.isPublic !== undefined) {
      dreamPayload.is_public = updates.is_public ?? updates.isPublic;
    }
    if (updates.audio_url !== undefined || updates.audioUrl !== undefined) {
      dreamPayload.audioUrl = updates.audio_url ?? updates.audioUrl;
    }

    if (Object.keys(dreamPayload).length === 0) return;

    // Fill required fields for handleEditDream
    handleEditDream({
      title: dreamPayload.title ?? selectedDream.title,
      content: dreamPayload.content ?? selectedDream.content,
      tags: dreamPayload.tags ?? selectedDream.tags ?? [],
      lucid: dreamPayload.lucid ?? selectedDream.lucid,
      mood: dreamPayload.mood ?? selectedDream.mood ?? "Neutral",
      ...dreamPayload,
    }, id);
  };

  return (
    <div className="min-h-screen starry-background pt-safe-top px-4 pb-4 md:px-6">
      <JournalHeader onAddDream={() => setIsAddingDream(true)} />

      <TagFilter
        tags={uniqueTagsInDreams}
        activeTags={activeTagIds}
        onTagClick={handleTagClick}
        onClearTags={() => setActiveTagIds([])}
      />

      <div className="mb-6">
        {entries.length === 0 ? (
          <EmptyJournal onAddDream={() => setIsAddingDream(true)} />
        ) : (
          <DreamsList
            dreams={filteredDreams}
            tags={tags}
            onSelect={setSelectedDream}
            onEdit={handleOpenEditDialog}
            onTogglePublic={handleTogglePublic}
            onDelete={(dreamId) => setDreamToDelete(dreamId)}
            onTagClick={handleTagClick}
          />
        )}
      </div>

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
