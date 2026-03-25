import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Pencil, Flame } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import DailyQuote from "./DailyQuote";
interface JournalHeaderProps {
  onAddDream: () => void;
}

const JournalHeader = ({ onAddDream }: JournalHeaderProps) => {
  const navigate = useNavigate();

  const handleRecordDream = () => {
    navigate("/journal/new");
  };

  return (
    <>
      <header className="mb-6">
        <DailyQuote />
      </header>

      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="flex items-center gap-2 bg-primary/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-primary/20 w-fit">
          <Calendar size={18} className="text-primary" />
          <span className="text-sm text-white/80 font-medium">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </span>
        </div>
        <Button 
          onClick={handleRecordDream} 
          variant="aurora"
          className="flex items-center gap-2 px-4 py-1.5 text-sm"
        >
          <Pencil size={18} />
          <span className="font-medium">Record Dream</span>
        </Button>
      </div>

      {/* Engagement stats row */}
      {stats && (
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {stats.current_recall_streak > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1">
              <Flame size={14} className="text-orange-400" />
              <span className="text-xs font-semibold text-orange-400">
                {stats.current_recall_streak}-day streak
              </span>
            </div>
          )}
          {stats.total_entries > 0 && stats.total_nights > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
              <span className="text-xs font-medium text-primary">
                {Math.round((stats.total_entries / Math.max(stats.total_nights, 1)) * 100)}% recall rate
              </span>
            </div>
          )}
          {stats.total_lucid_dreams > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
              <span className="text-xs font-medium text-primary">
                {stats.lucid_this_month} lucid this month
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default JournalHeader;
