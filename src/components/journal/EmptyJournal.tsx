import React from "react";
import { useNavigate } from "react-router-dom";
import { Book, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyJournalProps {
  onAddDream: () => void;
}

const EmptyJournal = ({ onAddDream }: EmptyJournalProps) => {
  const navigate = useNavigate();

  const handleRecordDream = () => {
    navigate("/journal/new");
  };

  return (
    <div className="text-center py-16 px-4">
      <div className="relative inline-block mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aurora-purple/20 to-aurora-violet/20 flex items-center justify-center animate-float">
          <Book size={36} className="text-aurora-purple" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2 gradient-text">Your dream journal awaits</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        Record your first dream to begin your journey into the realm of lucid dreaming
      </p>
      
      <Button
        onClick={handleRecordDream}
        variant="aurora"
        className="px-6 py-2"
      >
        <PenLine className="mr-2 h-4 w-4" />
        Record Your First Dream
      </Button>
    </div>
  );
};

export default EmptyJournal;
