import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock } from "lucide-react";
import { useColorScheme } from "@/contexts/ColorSchemeContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ColorScheme } from "@/data/colorSchemes";

interface ColorSchemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ColorSchemeDialog = ({ open, onOpenChange }: ColorSchemeDialogProps) => {
  const { currentScheme, setColorScheme, availableSchemes } = useColorScheme();
  const { subscription } = useSubscriptionContext();

  const isSubscribed = subscription?.status === "active";

  const handleSelect = async (scheme: ColorScheme) => {
    if (scheme.requiresSubscription && !isSubscribed) {
      toast.error("This color scheme requires a subscription", {
        description: "Upgrade to unlock premium themes",
      });
      return;
    }

    await setColorScheme(scheme.id);
    toast.success(`Switched to ${scheme.name}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md h-auto max-h-[80vh] flex flex-col p-0 pt-10">
        <DialogHeader className="px-6 pb-2 shrink-0">
          <DialogTitle>Color Scheme</DialogTitle>
          <p className="text-sm text-muted-foreground">Personalize your app's accent colors</p>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 pb-6 grid grid-cols-2 gap-4">
            {availableSchemes.map((scheme) => {
              const isActive = currentScheme.id === scheme.id;
              const isLocked = scheme.requiresSubscription && !isSubscribed;

              return (
                <button
                  key={scheme.id}
                  onClick={() => handleSelect(scheme)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200",
                    isActive
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-muted/30",
                    isLocked && "opacity-70"
                  )}
                >
                  {/* Color preview */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full shadow-lg transition-transform",
                      isActive && "scale-110"
                    )}
                    style={{ backgroundColor: scheme.previewColor }}
                  />

                  {/* Lock overlay */}
                  {isLocked && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground">PRO</span>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-sm font-medium">{scheme.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{scheme.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ColorSchemeDialog;
