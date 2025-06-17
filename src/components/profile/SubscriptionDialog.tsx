
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import SubscriptionManager from "./SubscriptionManager";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const { subscription, isLoading } = useSubscriptionContext();

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Loading Subscription...</DialogTitle>
          </DialogHeader>
          <div className="p-4">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!subscription) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscribe to Premium</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <SubscriptionManager />
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{subscription.plan} Plan</CardTitle>
                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
              <CardDescription>
                {subscription.cancelAtPeriodEnd 
                  ? `Expires on ${subscription.currentPeriodEnd}`
                  : `Renews on ${subscription.currentPeriodEnd}`
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Image Generation</span>
                <span className="text-sm text-muted-foreground">
                  {subscription.imageCredits.remaining} remaining
                </span>
              </div>
              <Progress value={imageUsagePercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{subscription.imageCredits.used} used</span>
                <span>{subscription.imageCredits.total} total</span>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dream Analysis</span>
                <Badge variant="secondary">Unlimited</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Unlimited dream analysis for all active subscribers
              </p>
            </div>
          </div>

          {subscription.subscriptionType && (
            <div className="text-xs text-muted-foreground text-center">
              Subscription Type: {subscription.subscriptionType}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
