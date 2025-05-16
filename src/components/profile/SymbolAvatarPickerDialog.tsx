
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Moon, Sun, Cloud, Eye } from "lucide-react";

const SYMBOLS = [
  { name: "star", label: "Star", icon: Star },
  { name: "moon", label: "Moon", icon: Moon },
  { name: "sun", label: "Sun", icon: Sun },
  { name: "cloud", label: "Cloud", icon: Cloud },
  { name: "eye", label: "Eye", icon: Eye },
];

const COLOR_CHOICES = [
  "#9b87f5", // Primary Purple
  "#F2FCE2", // Soft Green
  "#D3E4FD", // Soft Blue
  "#FFDEE2", // Soft Pink
  "#FDE1D3", // Peach
  "#8B5CF6", // Vivid Purple
  "#0EA5E9", // Ocean Blue
  "#F97316", // Bright Orange
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
  const [selectedColor, setSelectedColor] = useState<string>(avatarColor || COLOR_CHOICES[0]);

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
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {COLOR_CHOICES.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? "border-dream-purple" : "border-gray-200"}`}
              style={{ backgroundColor: color }}
              aria-label={`Color ${color}`}
              type="button"
            />
          ))}
        </div>
        <div className="flex justify-center">
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
