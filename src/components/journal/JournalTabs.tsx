
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DreamsList from "@/components/journal/DreamsList";
import EmptyJournal from "@/components/journal/EmptyJournal";
import { DreamEntry, DreamTag } from "@/types/dream";

interface JournalTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  allEntries: DreamEntry[];
  filteredDreams: DreamEntry[];
  tags: DreamTag[];
  onSelectDream: (dream: DreamEntry) => void;
  onEditDream: (dream: DreamEntry) => void;
  onTogglePublic: (dream: DreamEntry) => void;
  onDeleteDream: (dreamId: string) => void;
  onTagClickInList: (tagId: string) => void;
  onAddDream: () => void;
}

const JournalTabs: React.FC<JournalTabsProps> = ({
  activeTab,
  onTabChange,
  allEntries,
  filteredDreams,
  tags,
  onSelectDream,
  onEditDream,
  onTogglePublic,
  onDeleteDream,
  onTagClickInList,
  onAddDream,
}) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="mb-6"
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
        {allEntries.length === 0 ? (
          <EmptyJournal onAddDream={onAddDream} />
        ) : (
          <DreamsList
            dreams={filteredDreams}
            tags={tags}
            onSelect={onSelectDream}
            onEdit={onEditDream}
            onTogglePublic={onTogglePublic}
            onDelete={onDeleteDream}
            onTagClick={onTagClickInList}
          />
        )}
      </TabsContent>

      <TabsContent value="recent">
        <DreamsList
          dreams={filteredDreams.slice(0, 6)} // Show recent (e.g., first 6 of filtered)
          tags={tags}
          onSelect={onSelectDream}
          onEdit={onEditDream}
          onTogglePublic={onTogglePublic}
          onDelete={onDeleteDream}
          onTagClick={onTagClickInList}
        />
      </TabsContent>
    </Tabs>
  );
};

export default JournalTabs;
