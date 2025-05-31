
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Crown, CreditCard, Sparkles, ImageIcon } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import StripeSubscriptionManager from "./StripeSubscriptionManager";
import NativeSubscriptionManager from "./NativeSubscriptionManager";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd?: boolean;
    analysisCredits: {
      used: number;
      total: number;
    };
    imageCredits: {
      used: number;
      total: number;
    };
  };
}

const SubscriptionDialog = ({
  isOpen,
  onOpenChange,
  subscription
}: SubscriptionDialogProps) => {
  const isNative = Capacitor.isNativePlatform();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="gradient-text flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Your Subscription
            </DialogTitle>
            {subscription?.plan && (
              <Badge className="flex items-center gap-1 bg-gradient-to-r from-dream-purple to-dream-lavender">
                <Crown className="w-4 h-4" />
                {subscription.plan}
              </Badge>
            )}
          </div>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[70vh] pr-1">
          <div className="space-y-5 py-2">
            {subscription && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Renews on:</span>
                    <span className="text-sm font-medium">{subscription.currentPeriodEnd}</span>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <div className="bg-amber-500/10 text-amber-600 rounded-md p-2 text-xs mt-2">
                      Your subscription will not renew after {subscription.currentPeriodEnd}.
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Monthly Credits Left</h4>
                  <CreditDisplay
                    icon={<Sparkles className="w-4 h-4 text-dream-purple" />}
                    label="Dream Analysis"
                    used={subscription.analysisCredits.used}
                    total={subscription.analysisCredits.total}
                  />
                  <CreditDisplay
                    icon={<ImageIcon className="w-4 h-4 text-dream-lavender" />}
                    label="Image Generation"
                    used={subscription.imageCredits.used}
                    total={subscription.imageCredits.total}
                  />
                </div>
              </>
            )}
            
            {/* Use native subscription manager on mobile, Stripe on web */}
            {isNative ? (
              <NativeSubscriptionManager currentPlan={subscription?.plan} />
            ) : (
              <StripeSubscriptionManager currentPlan={subscription?.plan} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CreditDisplay = ({ icon, label, used, total }: { icon: React.ReactNode; label: string; used: number; total: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-sm">
      <span className="flex gap-1 items-center">{icon}<span>{label}</span></span>
      <span className="text-xs">
        {total === 999999 ? "Unlimited" : `${used} / ${total}`}
      </span>
    </div>
    {total !== 999999 && (
      <div className="w-full bg-secondary rounded-full h-1">
        <div
          className="h-1 bg-dream-purple rounded-full"
          style={{ width: `${Math.min(100, (used / total) * 100)}%` }}
        />
      </div>
    )}
  </div>
);

export default SubscriptionDialog;
