import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, AlertCircle, Sparkles, Check, Crown, Brain, ImageIcon, MessageCircle } from "lucide-react";
import { useNativeSubscription } from "@/hooks/useNativeSubscription";
import { Capacitor } from "@capacitor/core";

const PLAN_FEATURES = {
  basic: [
    { label: "Unlimited Dream Analysis", icon: Brain },
    { label: "10 Dream Art Generations", icon: ImageIcon },
    { label: "AI Dream Chat (5 msgs/day)", icon: MessageCircle },
    { label: "Voice-to-Text Journaling", icon: Sparkles },
  ],
  premium: [
    { label: "Unlimited Dream Analysis", icon: Brain },
    { label: "Unlimited Dream Art", icon: ImageIcon },
    { label: "Unlimited AI Dream Chat", icon: MessageCircle },
    { label: "Dream Video Generation", icon: Sparkles },
    { label: "Voice-to-Text Journaling", icon: MessageCircle },
    { label: "Priority Support", icon: Crown },
  ],
};

interface NativeSubscriptionManagerProps {
  currentPlan?: string;
}

const NativeSubscriptionManager = ({ currentPlan }: NativeSubscriptionManagerProps) => {
  const { products, isLoading, purchaseSubscription, restorePurchases } = useNativeSubscription();
  const isIOS = Capacitor.getPlatform() === "ios";
  const storeName = isIOS ? "App Store" : "Play Store";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center pb-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-3">
          <Crown className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Unlock Premium</h3>
        <p className="text-sm text-muted-foreground mt-1">Access all dream analysis & image generation features</p>
      </div>

      {currentPlan && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="text-sm font-medium text-foreground">Current Plan: {currentPlan}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Manage via {storeName} Settings</p>
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
            <p className="text-sm text-muted-foreground mb-3">No plans available right now.</p>
            <Button variant="outline" onClick={() => window.location.reload()} size="sm">Retry</Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {products.map((product) => {
              const isPremium = product.id === 'price_premium';
              const planFeatures = isPremium ? PLAN_FEATURES.premium : PLAN_FEATURES.basic;
              return (
                <div
                  key={product.id}
                  className={`relative overflow-hidden rounded-xl border p-5 space-y-3 transition-all ${
                    isPremium ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/50"
                  }`}
                >
                  {isPremium && (
                    <div className="absolute top-0 right-0 w-28 h-28 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  )}
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isPremium && <Sparkles className="h-4 w-4 text-primary" />}
                        <h4 className="font-semibold text-foreground">{product.name}</h4>
                      </div>
                      {isPremium && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Popular</span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {product.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                    <ul className="space-y-2">
                      {planFeatures.map((f, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm text-foreground/90">
                          <f.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span>{f.label}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-1 ${isPremium ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}`}
                      variant={isPremium ? "default" : "outline"}
                      onClick={() => purchaseSubscription(product.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Restore */}
      <div className="pt-3 border-t border-border/50">
        <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={restorePurchases} disabled={isLoading} size="sm">
          <RotateCcw className="h-3.5 w-3.5 mr-2" />
          Restore Purchases
        </Button>
      </div>

      {/* Legal */}
      <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
        Auto-renews unless canceled 24hrs before period end. Manage in {storeName} settings.{" "}
        <a href="https://www.lucidrepo.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary/60 underline hover:text-primary">Terms</a>
      </p>
    </div>
  );
};

export default NativeSubscriptionManager;
