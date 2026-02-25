
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DreamEntryForm from "@/components/DreamEntryForm";
import { DreamTag } from "@/types/dream";

interface AddDreamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dreamData: {
    title: string;
    content: string;
    tags: string[];
    lucid: boolean;
    mood: string;
    analysis?: string;
    generatedImage?: string;
    imagePrompt?: string;
    audioUrl?: string;
  }) => Promise<void>;
  tags: DreamTag[];
  isSubmitting: boolean;
}

const AddDreamDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  tags,
  isSubmitting
}: AddDreamDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="gradient-text">Record New Dream</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 pr-1">
          <DreamEntryForm
            tags={tags}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDreamDialog;
