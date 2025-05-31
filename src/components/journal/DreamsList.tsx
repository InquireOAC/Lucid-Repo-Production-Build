
import React from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamCard from "@/components/dreams/DreamCard";

interface DreamsListProps {
  dreams: DreamEntry[];
  tags: DreamTag[];
  onSelect: (dream: DreamEntry) => void;
  onEdit: (dream: DreamEntry) => void;
  onTogglePublic: (dream: DreamEntry) => void;
  onDelete: (dreamId: string) => void;
  onTagClick: (tagId: string) => void;
}

const DreamsList = ({
  dreams,
  tags,
  onSelect,
  onEdit,
  onTogglePublic,
  onDelete,
  onTagClick,
}: DreamsListProps) => {
  if (dreams.length === 0) {
    return (
      <div className="text-center py-12 col-span-3">
        <p className="text-muted-foreground">No dreams yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {dreams.map((dream) => (
        <div key={dream.id}>
          <DreamCard
            dream={dream}
            tags={tags}
            onClick={() => onSelect(dream)}
            onTagClick={onTagClick}
            showSharedBadge={true}
            showActions={true}
            onEdit={() => onEdit(dream)}
            onTogglePublic={() => onTogglePublic(dream)}
            onDelete={() => onDelete(dream.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default DreamsList;
