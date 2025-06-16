
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
      remaining: number;
    };
    imageCredits: {
      used: number;
      total: number;
      remaining: number;
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
                
                {/* Credits Overview Section */}
                <div className="bg-gradient-to-br from-dream-purple/5 to-dream-lavender/5 rounded-lg p-4 border border-dream-purple/20">
                  <h4 className="text-lg font-semibold mb-3 text-center">Your Credits</h4>
                  <div className="space-y-3">
                    <CreditDisplay
                      icon={<Sparkles className="w-5 h-5 text-dream-purple" />}
                      label="Dream Analysis"
                      used={subscription.analysisCredits.used}
                      total={subscription.analysisCredits.total}
                      remaining={subscription.analysisCredits.remaining}
                      isUnlimited={true}
                    />
                    <CreditDisplay
                      icon={<ImageIcon className="w-5 h-5 text-dream-lavender" />}
                      label="Image Generation"
                      used={subscription.imageCredits.used}
                      total={subscription.imageCredits.total}
                      remaining={subscription.imageCredits.remaining}
                      isUnlimited={false}
                    />
                  </div>
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

const CreditDisplay = ({ 
  icon, 
  label, 
  used, 
  total, 
  remaining, 
  isUnlimited 
}: { 
  icon: React.ReactNode; 
  label: string; 
  used: number; 
  total: number; 
  remaining: number;
  isUnlimited: boolean;
}) => (
  <div className="space-y-2 p-3 bg-white/50 rounded-md">
    <div className="flex justify-between items-center">
      <span className="flex gap-2 items-center font-medium">{icon}<span>{label}</span></span>
      <div className="text-right">
        {isUnlimited ? (
          <span className="text-sm font-semibold text-dream-purple">Unlimited</span>
        ) : (
          <>
            <span className="text-lg font-bold text-dream-purple">{remaining}</span>
            <span className="text-xs text-muted-foreground ml-1">remaining</span>
          </>
        )}
      </div>
    </div>
    
    {!isUnlimited && (
      <>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Used: {used}</span>
          <span>Total: {total}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="h-2 bg-gradient-to-r from-dream-purple to-dream-lavender rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (used / total) * 100)}%` }}
          />
        </div>
        {remaining <= 5 && remaining > 0 && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ Only {remaining} credits remaining
          </div>
        )}
        {remaining === 0 && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            🚫 No credits remaining
          </div>
        )}
      </>
    )}
  </div>
);

export default SubscriptionDialog;
