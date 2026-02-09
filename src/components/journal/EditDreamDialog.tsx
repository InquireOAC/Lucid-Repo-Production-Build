
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DreamEntryForm from "@/components/DreamEntryForm";
import { DreamEntry, DreamTag } from "@/types/dream";

interface EditDreamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dreamData: any) => Promise<void>;
  existingDream: DreamEntry | null;
  tags: DreamTag[];
  isSubmitting: boolean;
}

const EditDreamDialog: React.FC<EditDreamDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  existingDream,
  tags,
  isSubmitting,
}) => {
  if (!existingDream) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="gradient-text">Edit Dream</DialogTitle>
        </DialogHeader>
        <DreamEntryForm
          existingDream={existingDream}
          onSubmit={onSubmit}
          tags={tags}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditDreamDialog;
