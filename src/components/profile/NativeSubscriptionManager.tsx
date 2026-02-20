
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, AlertCircle, Sparkles, Check, Crown } from "lucide-react";
import { useNativeSubscription } from "@/hooks/useNativeSubscription";

interface NativeSubscriptionManagerProps {
  currentPlan?: string;
}

const NativeSubscriptionManager = ({ currentPlan }: NativeSubscriptionManagerProps) => {
  const { products, isLoading, purchaseSubscription, restorePurchases } = useNativeSubscription();

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center pb-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
          <Crown className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Unlock Premium</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Access all dream analysis & image generation features
        </p>
      </div>

      {currentPlan && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="text-sm font-medium">Current Plan: {currentPlan}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage via App Store Settings
          </p>
        </div>
      )}

      {/* Products */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading plans...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              No plans available right now.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              size="sm"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {products.map((product) => {
              const isPremium = product.name.toLowerCase().includes('premium');
              return (
                <div 
                  key={product.id} 
                  className={`relative overflow-hidden rounded-xl border p-4 space-y-3 transition-all ${
                    isPremium 
                      ? 'border-primary/40 bg-primary/5' 
                      : 'border-border/50 bg-card/50'
                  }`}
                >
                  {isPremium && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  )}
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {isPremium && <Sparkles className="h-4 w-4 text-primary" />}
                        <h4 className="font-semibold">{product.name}</h4>
                      </div>
                      {isPremium && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold">{product.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  </div>
                  
                  <ul className="space-y-1.5">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full ${isPremium ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={isPremium ? 'default' : 'outline'}
                    onClick={() => purchaseSubscription(product.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Restore */}
      <div className="pt-3 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={restorePurchases}
          disabled={isLoading}
          size="sm"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-2" />
          Restore Purchases
        </Button>
      </div>

      {/* Legal */}
      <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
        Auto-renews unless canceled 24hrs before period end. Manage in App Store settings.{" "}
        <button
          onClick={() => handleExternalLink('https://www.lucidrepo.com/terms-of-service')}
          className="text-primary/70 underline hover:text-primary"
        >
          Terms
        </button>
      </p>
    </div>
  );
};

export default NativeSubscriptionManager;
