
import React from "react";
import { DreamEntry, DreamTag } from "@/types/dream";
import DreamDetail from "@/components/DreamDetail";

interface DreamDetailWrapperProps {
  selectedDream: DreamEntry | null;
  tags: DreamTag[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<DreamEntry>) => void;
  isAuthenticated: boolean;
}

const DreamDetailWrapper = ({
  selectedDream,
  tags,
  onClose,
  onUpdate,
  isAuthenticated
}: DreamDetailWrapperProps) => {
  if (!selectedDream) return null;
  
  return (
    <DreamDetail
      dream={selectedDream}
      tags={tags}
      onClose={onClose}
      onUpdate={onUpdate}
      onDelete={() => {
        // We don't allow deletion from LucidRepo yet
        onClose();
      }}
      isAuthenticated={isAuthenticated}
    />
  );
};

export default DreamDetailWrapper;
