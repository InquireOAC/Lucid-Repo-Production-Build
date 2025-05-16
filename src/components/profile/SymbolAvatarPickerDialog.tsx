
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Star,
  Moon,
  Sun,
  Cloud,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Eye
} from "lucide-react";

const SYMBOLS = [
  { name: "star", label: "Star", icon: Star },
  { name: "moon", label: "Moon", icon: Moon },
  { name: "sun", label: "Sun", icon: Sun },
  { name: "cloud", label: "Cloud", icon: Cloud },
  { name: "arrowdown", label: "Arrow Down", icon: ArrowDown },
  { name: "arrowup", label: "Arrow Up", icon: ArrowUp },
  { name: "arrowright", label: "Arrow Right", icon: ArrowRight },
  { name: "eye", label: "Eye", icon: Eye },
];

type SymbolAvatarPickerDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  avatarSymbol: string | null;
  avatarColor: string | null;
  onSave: (symbol: string, color: string) => void;
};

export default function SymbolAvatarPickerDialog({
  isOpen, onOpenChange, avatarSymbol, avatarColor, onSave
}: SymbolAvatarPickerDialogProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(avatarSymbol || SYMBOLS[0].name);
  const [selectedColor, setSelectedColor] = useState<string>(avatarColor || "#9b87f5");

  const handleSave = () => {
    onSave(selectedSymbol, selectedColor);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pick your Avatar</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {SYMBOLS.map(sym => {
              const Icon = sym.icon;
              return (
                <button
                  key={sym.name}
                  onClick={() => setSelectedSymbol(sym.name)}
                  aria-label={sym.label}
                  className={`rounded-full border-2 p-2 ${selectedSymbol === sym.name ? "border-dream-purple" : "border-transparent"}`}
                  type="button"
                >
                  <Icon size={40} color={selectedColor} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="mb-4 flex flex-col items-center justify-center">
          <label className="mb-1 text-sm font-medium text-gray-700">Pick any color</label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            aria-label="Select avatar color"
            className="w-16 h-10 rounded-full border-2 border-dream-purple"
          />
        </div>
        <div className="flex justify-center">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
