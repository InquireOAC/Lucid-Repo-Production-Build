
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDreamJournal } from "@/hooks/useDreamJournal";
import DreamEntryForm from "@/components/DreamEntryForm";
import DreamDetail from "@/components/DreamDetail";
import JournalHeader from "@/components/journal/JournalHeader";
import TagFilter from "@/components/journal/TagFilter";
import EmptyJournal from "@/components/journal/EmptyJournal";
import DreamsList from "@/components/journal/DreamsList";

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
    handleUpdateDream,
    handleDeleteDream,
    handleTogglePublic,
    handleTagClick,
    setActiveTagIds,
    user
  } = useDreamJournal();
  
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen dream-background p-4 md:p-6">
      <JournalHeader onAddDream={() => setIsAddingDream(true)} />
      
      {/* Tag filter bar */}
      <TagFilter 
        tags={uniqueTagsInDreams} 
        activeTags={activeTagIds} 
        onTagClick={handleTagClick}
        onClearTags={() => setActiveTagIds([])}
      />

      <Tabs 
        defaultValue="all" 
        className="mb-6"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="all" className="text-sm">
            All Dreams
          </TabsTrigger>
          <TabsTrigger value="recent" className="text-sm">
            Recent Dreams
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {entries.length === 0 ? (
            <EmptyJournal onAddDream={() => setIsAddingDream(true)} />
          ) : (
            <DreamsList
              dreams={filteredDreams}
              tags={tags}
              onSelect={setSelectedDream}
              onEdit={(dream) => {
                setSelectedDream(dream);
                setIsEditingDream(true);
              }}
              onTogglePublic={handleTogglePublic}
              onDelete={(dreamId) => setDreamToDelete(dreamId)}
              onTagClick={handleTagClick}
            />
          )}
        </TabsContent>
        
        <TabsContent value="recent">
          <DreamsList
            dreams={filteredDreams.slice(0, 6)}
            tags={tags}
            onSelect={setSelectedDream}
            onEdit={(dream) => {
              setSelectedDream(dream);
              setIsEditingDream(true);
            }}
            onTogglePublic={handleTogglePublic}
            onDelete={(dreamId) => setDreamToDelete(dreamId)}
            onTagClick={handleTagClick}
          />
        </TabsContent>
      </Tabs>

      {/* Add Dream Dialog */}
      <Dialog open={isAddingDream} onOpenChange={setIsAddingDream}>
        <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="gradient-text">Record New Dream</DialogTitle>
          </DialogHeader>
          <DreamEntryForm onSubmit={handleAddDream} tags={tags} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Dream Dialog */}
      {selectedDream && (
        <Dialog open={isEditingDream} onOpenChange={setIsEditingDream}>
          <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="gradient-text">Edit Dream</DialogTitle>
            </DialogHeader>
            <DreamEntryForm
              existingDream={selectedDream}
              onSubmit={handleEditDream}
              tags={tags}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Dream Detail Dialog */}
      {selectedDream && !isEditingDream && (
        <DreamDetail
          dream={selectedDream}
          tags={tags}
          onClose={() => setSelectedDream(null)}
          onUpdate={handleUpdateDream}
          onDelete={handleDeleteDream}
          isAuthenticated={!!user}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!dreamToDelete} 
        onOpenChange={(open) => !open && setDreamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this dream from your journal.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => dreamToDelete && handleDeleteDream(dreamToDelete)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Journal;
