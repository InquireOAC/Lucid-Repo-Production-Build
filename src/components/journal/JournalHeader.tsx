import React from "react";
import { Calendar, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import DailyQuote from "./DailyQuote";
interface JournalHeaderProps {
  onAddDream: () => void;
}
const JournalHeader = ({
  onAddDream
}: JournalHeaderProps) => {
  return <>
      <header className="mb-6">
        <DailyQuote />
      </header>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-2 py-1 border border-white/10 w-fit">
          <Calendar size={18} className="text-purple-300" />
          <span className="text-sm text-white/80 font-medium">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <Button 
          onClick={onAddDream} 
          className="bg-white text-purple-800 hover:bg-white/90 shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105 flex items-center gap-2 px-4 py-1.5 text-sm"
        >
          <Pencil size={18} />
          <span className="font-medium">Record Dream</span>
        </Button>
      </div>
    </>;
};
export default JournalHeader;