
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
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden flex flex-col glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="gradient-text">Edit Dream</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 pr-1">
          <DreamEntryForm
            existingDream={existingDream}
            onSubmit={onSubmit}
            tags={tags}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDreamDialog;
