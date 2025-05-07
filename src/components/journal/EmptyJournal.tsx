
import React from "react";
import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyJournalProps {
  onAddDream: () => void;
}

const EmptyJournal = ({ onAddDream }: EmptyJournalProps) => {
  return (
    <div className="text-center py-12">
      <Book size={32} className="mx-auto mb-2 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-1">Your dream journal is empty</h3>
      <p className="text-muted-foreground">
        Record your first dream to get started
      </p>
      <Button
        onClick={onAddDream}
        variant="outline"
        className="mt-4 border-dream-lavender text-dream-lavender hover:bg-dream-lavender/10"
      >
        Record Dream
      </Button>
    </div>
  );
};

export default EmptyJournal;
