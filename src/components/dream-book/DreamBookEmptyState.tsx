import React from "react";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DreamBookEmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-10">
      <div className="lucid-hero relative mb-8 h-52 w-full max-w-lg"><img src="/dream-art/door-at-horizon.png" alt="Glowing doorway at the horizon" className="h-full w-full object-cover"/></div>

      <h2 className="lucid-display text-3xl md:text-4xl text-foreground mb-3">
        Your Story Awaits
      </h2>
      <p className="text-muted-foreground max-w-sm mb-2 text-base">
        Your dreams deserve to be kept like stories.
      </p>
      <p className="text-muted-foreground/70 max-w-xs mb-8 text-sm">
        Start journaling your dreams and watch them transform into a beautiful book you can read, share, and export.
      </p>

      <button className="lucid-button" onClick={() => navigate("/journal/new")}>
        <Pencil className="w-4 h-4 mr-2" />
        Begin Your First Entry
      </button>
    </div>
  );
};

export default DreamBookEmptyState;
