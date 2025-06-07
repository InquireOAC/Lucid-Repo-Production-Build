
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Smartphone, RotateCcw, AlertCircle } from "lucide-react";
import { useNativeSubscription } from "@/hooks/useNativeSubscription";

interface NativeSubscriptionManagerProps {
  currentPlan?: string;
}

const NativeSubscriptionManager = ({ currentPlan }: NativeSubscriptionManagerProps) => {
  const { products, isLoading, purchaseSubscription, restorePurchases } = useNativeSubscription();

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
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading subscription options...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <p className="text-muted-foreground mb-2">
              No subscription products available.
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
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <Card key={product.id} className="p-4 space-y-4">
                <div>
                  <h4 className="text-lg font-medium">{product.name}</h4>
                  <p className="text-2xl font-bold text-dream-purple">{product.price}</p>
                  <p className="text-sm text-muted-foreground">Monthly subscription</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {product.packageObject.product.identifier}
                  </p>
                </div>
                
                <ul className="space-y-2 text-sm">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  onClick={() => purchaseSubscription(product.id)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Subscribe via App Store`
                  )}
                </Button>
              </Card>
            ))}
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
