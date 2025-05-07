
import React from "react";
import { Calendar, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import DailyQuote from "./DailyQuote";

interface JournalHeaderProps {
  onAddDream: () => void;
}

const JournalHeader = ({ onAddDream }: JournalHeaderProps) => {
  return (
    <>
      <header className="mb-6">
        <DailyQuote />
      </header>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <Button 
          onClick={onAddDream} 
          className="bg-gradient-to-r from-dream-lavender to-dream-purple hover:opacity-90 flex items-center gap-2"
        >
          <Pencil size={16} />
          <span>Record Dream</span>
        </Button>
      </div>
    </>
  );
};

export default JournalHeader;
