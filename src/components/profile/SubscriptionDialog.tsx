
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, ImageIcon, Brain, Crown } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";
import NativeSubscriptionManager from "./NativeSubscriptionManager";
import StripeSubscriptionManager from "./StripeSubscriptionManager";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const { subscription, isLoading, refreshSubscription } = useSubscription(user);
  const isNativePlatform = Capacitor.isNativePlatform();

  React.useEffect(() => {
    if (isOpen && user) {
      refreshSubscription();
    }
  }, [isOpen, user, refreshSubscription]);

  const handleRefresh = () => {
    refreshSubscription();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Loading...
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!subscription) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-xl bg-background/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-primary" />
              Choose Your Plan
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">
              {isNativePlatform ? 'In-App Purchase' : 'Web Subscription'}
            </p>
            {isNativePlatform && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
          <div>
            {isNativePlatform ? (
              <NativeSubscriptionManager />
            ) : (
              <StripeSubscriptionManager />
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const imageUsagePercentage = subscription.imageCredits.total > 0 
    ? (subscription.imageCredits.used / subscription.imageCredits.total) * 100 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-primary" />
              Subscription
            </DialogTitle>
            {isNativePlatform && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-5">
          {/* Plan card */}
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                <h3 className="text-xl font-semibold">{subscription.plan}</h3>
              </div>
              <Badge 
                variant={subscription.status === 'active' ? 'default' : 'secondary'}
                className={subscription.status === 'active' ? 'bg-primary/90' : ''}
              >
                {subscription.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {subscription.cancelAtPeriodEnd 
                ? `Expires ${subscription.currentPeriodEnd}`
                : `Renews ${subscription.currentPeriodEnd}`
              }
            </p>
          </div>

          {/* Credits */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Image Generation</span>
              </div>
              <Progress value={imageUsagePercentage} className="h-1.5" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{subscription.imageCredits.used} used</span>
                <span>{subscription.imageCredits.remaining} remaining</span>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Dream Analysis</span>
                </div>
                <Badge variant="secondary" className="text-xs">Unlimited</Badge>
              </div>
            </div>
          </div>

          {isNativePlatform && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              Manage your subscription through App Store settings
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
