
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles, ImageIcon, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import StripeSubscriptionManager from "./StripeSubscriptionManager";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="gradient-text">Your Subscription</DialogTitle>
            {subscription?.plan && (
              <Badge className="bg-gradient-to-r from-dream-purple to-dream-lavender">
                <Crown className="h-3 w-3 mr-1" />
                {subscription.plan}
              </Badge>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] max-h-[500px]">
          <div className="space-y-4 py-4 pr-4">
            {!subscription ? (
              <div>
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Upgrade to unlock premium features like unlimited dream analysis and more image generations!
                </p>
                <StripeSubscriptionManager />
              </div>
            ) : (
              <>
                {/* Status Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current period ends:</span>
                    <span className="text-sm font-medium">{subscription.currentPeriodEnd}</span>
                  </div>
                </div>
                
                {/* Credits */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Credits remaining this month</h4>
                  
                  {/* Analysis Credits */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-sm">
                        <Sparkles className="h-3.5 w-3.5 text-dream-purple" />
                        <span>Dream Analysis</span>
                      </div>
                      <span className="text-xs">
                        {subscription.analysisCredits.total === 999999 
                          ? 'Unlimited' 
                          : `${subscription.analysisCredits.used} / ${subscription.analysisCredits.total}`
                        }
                      </span>
                    </div>
                    {subscription.analysisCredits.total !== 999999 && (
                      <Progress 
                        value={(subscription.analysisCredits.used / subscription.analysisCredits.total) * 100} 
                        className="h-1.5"
                      />
                    )}
                  </div>
                  
                  {/* Image Credits */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-sm">
                        <ImageIcon className="h-3.5 w-3.5 text-dream-lavender" />
                        <span>Image Generation</span>
                      </div>
                      <span className="text-xs">
                        {`${subscription.imageCredits.used} / ${subscription.imageCredits.total}`}
                      </span>
                    </div>
                    <Progress 
                      value={(subscription.imageCredits.used / subscription.imageCredits.total) * 100}
                      className="h-1.5"
                    />
                  </div>
                </div>
                
                {/* Manage Subscription */}
                <div className="pt-2">
                  <StripeSubscriptionManager currentPlan={subscription.plan} />
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
