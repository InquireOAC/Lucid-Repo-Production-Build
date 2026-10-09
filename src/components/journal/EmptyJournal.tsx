import React from "react";
import { useNavigate } from "react-router-dom";
import { Film, Plus } from "lucide-react";

interface EmptyJournalProps {
  onAddDream?: () => void;
}

const EmptyJournal: React.FC<EmptyJournalProps> = () => {
  const navigate = useNavigate();

  return (
    <div className="lucid-hero relative mt-2 mb-6">
      <div className="relative aspect-[3/4] md:aspect-[21/9]">
        <img src="/dream-art/door-at-horizon.png" alt="Glowing doorway to an imagined world" className="absolute inset-0 h-full w-full object-cover" />

        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6 text-center z-10">
          <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 border border-white/15">
            <Film className="h-8 w-8 text-white" />
          </div>
          <h2 className="lucid-display text-3xl md:text-5xl text-white leading-tight mb-2 drop-shadow-md">
            Your library begins here
          </h2>
          <p className="text-sm text-white/70 max-w-sm mb-5">
            Record your first dream to start building your personal film library.
          </p>
          <button
            onClick={() => navigate("/journal/new")}
            className="lucid-button"
          >
            <Plus className="h-4 w-4" />
            Record First Dream
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmptyJournal;
