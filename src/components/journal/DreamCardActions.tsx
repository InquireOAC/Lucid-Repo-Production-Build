
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Globe, Lock, Trash2 } from "lucide-react";
import { DreamEntry } from "@/types/dream";

interface DreamCardActionsProps {
  dream: DreamEntry;
  onEdit: (dream: DreamEntry) => void;
  onTogglePublic: (dream: DreamEntry) => void;
  onDelete: (dreamId: string) => void;
}

const DreamCardActions = ({ 
  dream, 
  onEdit, 
  onTogglePublic, 
  onDelete 
}: DreamCardActionsProps) => {
  const isPublic = dream.is_public || dream.isPublic;

  return (
    <div className="flex justify-end gap-1 mt-2 px-2">
      <Button
        size="sm"
        variant="secondary"
        className="h-8"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(dream);
        }}
      >
        <Edit size={14} className="mr-1" /> Edit
      </Button>

      <Button
        size="sm"
        variant={isPublic ? "outline" : "default"}
        className={`h-8 ${isPublic ? "bg-white text-gray-800" : "bg-dream-purple"}`}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePublic(dream);
        }}
      >
        {isPublic ? (
          <>
            <Lock size={14} className="mr-1" /> Private
          </>
        ) : (
          <>
            <Globe size={14} className="mr-1" /> Share
          </>
        )}
      </Button>

      <Button
        size="sm"
        variant="destructive"
        className="h-8"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(dream.id);
        }}
      >
        <Trash2 size={14} className="mr-1" /> Delete
      </Button>
    </div>
  );
};

export default DreamCardActions;
