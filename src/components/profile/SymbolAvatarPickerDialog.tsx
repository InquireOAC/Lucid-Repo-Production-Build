
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Star,
  Moon,
  Sun,
  Cloud,
  Eye,
} from "lucide-react";
import { IoMdPlanet } from "react-icons/io";
import { GiGalaxy } from "react-icons/gi";
import { PiShootingStarFill } from "react-icons/pi";

const SYMBOLS = [
  { name: "star", label: "Star", icon: Star },
  { name: "moon", label: "Moon", icon: Moon },
  { name: "sun", label: "Sun", icon: Sun },
  { name: "cloud", label: "Cloud", icon: Cloud },
  { name: "planet", label: "Planet", icon: IoMdPlanet },
  { name: "galaxy", label: "Galaxy", icon: GiGalaxy },
  { name: "shootingstar", label: "Shooting Star", icon: PiShootingStarFill },
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
      <DialogContent className="sm:max-w-[400px] flex flex-col gap-6 pt-6">
        <DialogHeader>
          <DialogTitle className="gradient-text text-lg mb-2">Pick your Avatar</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {SYMBOLS.map(sym => {
              const Icon = sym.icon;
              return (
                <button
                  key={sym.name}
                  onClick={() => setSelectedSymbol(sym.name)}
                  aria-label={sym.label}
                  className={`rounded-full border-2 p-2 outline-none focus:ring-2 focus:ring-dream-purple/80 transition-all duration-100
                    ${selectedSymbol === sym.name ? "border-dream-purple bg-dream-purple/10 shadow-md scale-110" : "border-transparent"}
                  `}
                  type="button"
                  style={{ background: "transparent" }}
                >
                  <Icon size={44} color={selectedColor} />
                </button>
              );
            })}
          </div>
          <div className="w-full flex flex-col items-center gap-2 mt-2">
            <label className="text-sm font-medium text-gray-700 mb-1">Pick any color</label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                aria-label="Select avatar color"
                className="rounded-full border-2 border-dream-purple shadow w-12 h-12 p-1 bg-transparent"
                style={{
                  background: "transparent",
                  cursor: "pointer",
                }}
              />
              <div
                className="rounded-full border-2 border-dream-purple flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  background: "transparent",
                }}
              >
                {/* Preview */}
                {(() => {
                  const Icon = SYMBOLS.find(s => s.name === selectedSymbol)?.icon || Star;
                  return <Icon size={34} color={selectedColor} />;
                })()}
              </div>
            </div>
            <span className="text-[12px] text-dream-purple mt-1">Choose any color you want!</span>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-dream-lavender to-dream-purple text-white font-bold"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
