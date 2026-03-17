import React from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DreamBookEmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-primary" />
        </div>
        <Sparkles className="w-5 h-5 text-accent-foreground absolute -top-1 -right-1 animate-pulse" />
      </div>

      <h2 className="text-2xl font-bold font-serif text-foreground mb-3">
        Your Story Awaits
      </h2>
      <p className="text-muted-foreground max-w-sm mb-2 text-base">
        Your dreams deserve to be kept like stories.
      </p>
      <p className="text-muted-foreground/70 max-w-xs mb-8 text-sm">
        Start journaling your dreams and watch them transform into a beautiful book you can read, share, and export.
      </p>

      <Button variant="luminous" onClick={() => navigate("/journal/new")}>
        <Sparkles className="w-4 h-4 mr-2" />
        Begin Your First Entry
      </Button>
    </div>
  );
};

export default DreamBookEmptyState;
