
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="gradient-text">Record New Dream</DialogTitle>
        </DialogHeader>
        <DreamEntryForm
          tags={tags}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddDreamDialog;
