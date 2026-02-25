import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Check } from "lucide-react";
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
      toast.error("This palette requires a subscription", {
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
        <DialogHeader className="px-5 pb-2 shrink-0">
          <DialogTitle className="text-lg">Choose Your Palette</DialogTitle>
          <p className="text-sm text-muted-foreground">Set the tone for your dream journal</p>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-5 pb-5 grid grid-cols-2 gap-2">
            {availableSchemes.map((scheme) => {
              const isActive = currentScheme.id === scheme.id;
              const isLocked = scheme.requiresSubscription && !isSubscribed;

              return (
                <button
                  key={scheme.id}
                  type="button"
                  onClick={() => handleSelect(scheme)}
                  className={cn(
                    "relative w-full text-left p-3 rounded-xl border transition-all duration-200 vault-glass",
                    isActive
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:shadow-[0_0_15px_hsl(var(--primary)/0.08)]",
                    !isActive && "vault-card-lift",
                    isLocked && "opacity-75"
                  )}
                >
                  <div
                    className={cn(
                      "h-2 w-full rounded-full mb-2 transition-opacity",
                      isLocked && "opacity-50"
                    )}
                    style={{
                      background: `linear-gradient(90deg, ${scheme.previewColor}, ${scheme.secondaryPreviewColor})`,
                    }}
                  />

                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-xs text-foreground">{scheme.name}</p>

                    {isActive && (
                      <div className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}

                    {isLocked && !isActive && (
                      <div className="shrink-0 flex items-center gap-1 bg-background/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                        <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className="text-[9px] font-semibold text-muted-foreground tracking-wide">PRO</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColorSchemeDialog;
