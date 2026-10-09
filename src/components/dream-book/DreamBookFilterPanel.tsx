import React, { useState } from "react";
import { DreamEntry } from "@/types/dream";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type BookFilter = "all" | "lucid" | "selected";

interface DreamBookFilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allDreams: DreamEntry[];
  filter: BookFilter;
  selectedIds: Set<string>;
  onApply: (filter: BookFilter, selectedIds: Set<string>) => void;
}

const DreamBookFilterPanel = ({
  open,
  onOpenChange,
  allDreams,
  filter: initialFilter,
  selectedIds: initialSelected,
  onApply,
}: DreamBookFilterPanelProps) => {
  const [filter, setFilter] = useState<BookFilter>(initialFilter);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelected));

  const toggleSelected = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleApply = () => {
    onApply(filter, selectedIds);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif">Curate Your Book</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Filter pills */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Include</p>
            <div className="flex flex-wrap gap-2">
              {(["all", "lucid", "selected"] as BookFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    filter === f
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {f === "all" ? "All Dreams" : f === "lucid" ? "Lucid Only" : "Select Dreams"}
                </button>
              ))}
            </div>
          </div>

          {/* Manual selection */}
          {filter === "selected" && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Select dreams to include:</p>
              {allDreams.map((dream) => (
                <label
                  key={dream.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/20 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedIds.has(dream.id)}
                    onCheckedChange={() => toggleSelected(dream.id)}
                  />
                  <span className="text-sm text-foreground truncate">{dream.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleApply} className="w-full">
          Apply
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default DreamBookFilterPanel;
