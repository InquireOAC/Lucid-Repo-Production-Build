import React from "react";
import { useNavigate } from "react-router-dom";
import { Film, Plus } from "lucide-react";

interface EmptyJournalProps {
  onAddDream?: () => void;
}

const EmptyJournal: React.FC<EmptyJournalProps> = () => {
  const navigate = useNavigate();

  return (
    <div className="relative -mx-4 sm:-mx-6 md:mx-0 mt-2 mb-6 md:rounded-2xl overflow-hidden">
      <div className="relative aspect-[3/4] md:aspect-[21/9] bg-gradient-to-br from-primary/30 via-accent/20 to-background">
        {/* Decorative blurred orbs */}
        <div className="absolute -top-20 -left-10 w-72 h-72 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />

        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6 text-center z-10">
          <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 border border-white/15">
            <Film className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2 drop-shadow-md">
            Your dream cinema is empty
          </h2>
          <p className="text-sm text-white/70 max-w-sm mb-5">
            Record your first dream to start building your personal film library.
          </p>
          <button
            onClick={() => navigate("/journal/new")}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
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
