
import { useState } from "react";
import { DreamEntry } from "@/types/dream";
import { useAuth } from "@/contexts/AuthContext";
import { useJournalEntries } from "./useJournalEntries";
import { useJournalActions } from "./useJournalActions";
import { useJournalFilter } from "./useJournalFilter";

export const useDreamJournal = () => {
  const { user } = useAuth();
  const { entries, syncDreamsFromDb } = useJournalEntries();
  const { 
    isSubmitting, 
    handleAddDream, 
    handleUpdateDream,
    handleDeleteDream,
    handleTogglePublic 
  } = useJournalActions();
  
  const { 
    tags, 
    activeTagIds, 
    filteredDreams, 
    uniqueTagsInDreams,
    handleTagClick, 
    setActiveTagIds 
  } = useJournalFilter(entries);
  
  const [isAddingDream, setIsAddingDream] = useState(false);
  const [isEditingDream, setIsEditingDream] = useState(false);
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  const [dreamToDelete, setDreamToDelete] = useState<string | null>(null);

  return {
    // Data
    entries,
    filteredDreams,
    tags,
    uniqueTagsInDreams,
    activeTagIds,
    
    // UI state
    isSubmitting,
    isAddingDream,
    setIsAddingDream,
    isEditingDream,
    setIsEditingDream,
    selectedDream,
    setSelectedDream,
    dreamToDelete,
    setDreamToDelete,
    
    // Actions
    handleAddDream,
    handleUpdateDream,
    handleDeleteDream,
    handleTogglePublic,
    handleTagClick,
    setActiveTagIds,
    
    // Auth
    user,
    
    // Sync
    syncDreamsFromDb
  };
};
