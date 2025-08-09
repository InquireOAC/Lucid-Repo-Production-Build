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
        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
          <Calendar size={18} className="text-purple-300" />
          <span className="text-sm text-white/80 font-medium">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <Button 
          onClick={onAddDream} 
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2 px-6 py-2"
        >
          <Pencil size={18} />
          <span className="font-medium">Record Dream</span>
        </Button>
      </div>
    </>;
};
export default JournalHeader;