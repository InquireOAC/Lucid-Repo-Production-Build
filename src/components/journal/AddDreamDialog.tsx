
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DreamEntryForm from "@/components/DreamEntryForm";
import { DreamTag } from "@/types/dream";

interface AddDreamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dreamData: any) => Promise<void>;
  tags: DreamTag[];
  isSubmitting: boolean;
}

const AddDreamDialog: React.FC<AddDreamDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  tags,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="gradient-text">Record New Dream</DialogTitle>
        </DialogHeader>
        <DreamEntryForm
          onSubmit={onSubmit}
          tags={tags}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddDreamDialog;
