
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Smartphone, RotateCcw, AlertCircle, Crown } from "lucide-react";
import { useNativeSubscription } from "@/hooks/useNativeSubscription";

interface NativeSubscriptionManagerProps {
  currentPlan?: string;
}

const NativeSubscriptionManager = ({ currentPlan }: NativeSubscriptionManagerProps) => {
  const { products, isLoading, showPaywall, restorePurchases } = useNativeSubscription();

  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <Smartphone className="h-12 w-12 mx-auto text-dream-purple mb-2" />
        <h3 className="text-lg font-medium">Mobile Subscription</h3>
        <p className="text-sm text-muted-foreground">
          Subscribe through the App Store to access premium features
        </p>
      </div>

      {currentPlan && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800 text-sm font-medium">
            Current Plan: {currentPlan}
          </p>
          <p className="text-green-600 text-xs mt-1">
            Manage your subscription through the App Store Settings
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Main Paywall Button */}
        <Card className="p-6 text-center bg-gradient-to-br from-dream-purple/5 to-dream-lavender/5 border-dream-purple/20">
          <Crown className="h-16 w-16 mx-auto text-dream-purple mb-4" />
          <h4 className="text-xl font-bold mb-2">Unlock Premium Features</h4>
          <p className="text-muted-foreground mb-4">
            Get unlimited dream analysis and image generation
          </p>
          <Button
            className="w-full h-12 text-lg bg-gradient-to-r from-dream-purple to-dream-lavender hover:from-dream-purple/90 hover:to-dream-lavender/90"
            onClick={showPaywall}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Crown className="h-5 w-5 mr-2" />
                View Subscription Options
              </>
            )}
          </Button>
        </Card>

        {/* Fallback product display if needed */}
        {products.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <p className="text-muted-foreground mb-2">
              Subscription options are loading...
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Make sure your RevenueCat offerings are configured with products:<br/>
              • com.lucidrepo.limited.monthly (Basic)<br/>
              • com.lucidrepo.unlimited.monthly (Premium)
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              size="sm"
            >
              Retry Loading
            </Button>
          </div>
        )}
      </div>

      <div className="pt-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={restorePurchases}
          disabled={isLoading}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restore Purchases
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Tap this if you've already purchased a subscription
        </p>
      </div>
    </div>
  );
};

export default NativeSubscriptionManager;
