import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ImageIcon, MessageCircle, Brain, Crown,
  Check, Loader2, RotateCcw, X
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNativeSubscription } from "@/hooks/useNativeSubscription";
import { normalizeProduct, Product } from "@/utils/subscriptionProductUtils";
import { toast } from "sonner";

type PaywallFeature = "analysis" | "image" | "chat";

const FEATURE_CONFIG: Record<PaywallFeature, { icon: React.ElementType; title: string; description: string }> = {
  analysis: {
    icon: Brain,
    title: "Dream Analysis",
    description: "AI-powered dream interpretation with symbols, emotions, and subconscious insights.",
  },
  image: {
    icon: ImageIcon,
    title: "Dream Art",
    description: "Generate stunning AI artwork inspired by your dream's narrative.",
  },
  chat: {
    icon: MessageCircle,
    title: "AI Dream Chat",
    description: "Have deep conversations with AI dream experts about your dreams.",
  },
};

const PLAN_FEATURES = {
  dreamer: [
    { label: "Unlimited Dream Analysis", icon: Brain },
    { label: "10 Dream Art Generations", icon: ImageIcon },
    { label: "Dream Video Generation", icon: Sparkles },
    { label: "Voice-to-Text Journaling", icon: MessageCircle },
  ],
  mystic: [
    { label: "Unlimited Dream Analysis", icon: Brain },
    { label: "Unlimited Dream Art", icon: ImageIcon },
    { label: "Dream Video Generation", icon: Sparkles },
    { label: "Voice-to-Text Journaling", icon: MessageCircle },
    { label: "Priority Support", icon: Crown },
  ],
};

const PaywallDialog = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState<PaywallFeature>("analysis");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  // Listen for paywall events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setFeature(detail?.feature || "analysis");
      setIsOpen(true);
    };
    window.addEventListener("show-paywall", handler);
    return () => window.removeEventListener("show-paywall", handler);
  }, []);

  // Fetch products when opened
  useEffect(() => {
    if (isOpen && !isNative) {
      fetchStripeProducts();
    }
  }, [isOpen, isNative]);

  const fetchStripeProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { action: "getProducts" },
      });
      if (!error && data?.products) {
        setProducts(data.products.map(normalizeProduct));
      } else {
        setProducts(getFallbackProducts());
      }
    } catch {
      setProducts(getFallbackProducts());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackProducts = (): Product[] => [
    {
      id: "price_basic",
      name: "Dreamer",
      price: "$4.99/month",
      features: PLAN_FEATURES.dreamer.map((f) => f.label),
    },
    {
      id: "price_premium",
      name: "Mystic",
      price: "$15.99/month",
      features: PLAN_FEATURES.mystic.map((f) => f.label),
    },
  ];

  const handleStripeSubscribe = async (priceId: string) => {
    try {
      setSubscribing(priceId);
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { action: "createSession", priceId },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error("Failed to start checkout", { description: err.message });
    } finally {
      setSubscribing(null);
    }
  };

  const featureConfig = FEATURE_CONFIG[feature];
  const FeatureIcon = featureConfig.icon;

  // Sort: premium last
  const sortedProducts = [...products].sort((a, b) => {
    const aP = a.name.toLowerCase().includes("mystic") || a.name.toLowerCase().includes("premium");
    const bP = b.name.toLowerCase().includes("mystic") || b.name.toLowerCase().includes("premium");
    return aP === bP ? 0 : aP ? 1 : -1;
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[95vw] max-w-lg p-0 gap-0 border-border/50 bg-background overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative px-6 pt-8 pb-5 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 mb-4">
              <FeatureIcon className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1.5">
              Unlock {featureConfig.title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {featureConfig.description}
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="px-5 pb-6 space-y-3">
          {isNative ? (
            <NativePaywallPlans onClose={() => setIsOpen(false)} />
          ) : loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            sortedProducts.map((product) => {
              const isPremium =
                product.name.toLowerCase().includes("mystic") ||
                product.name.toLowerCase().includes("premium");
              const planFeatures = isPremium ? PLAN_FEATURES.mystic : PLAN_FEATURES.dreamer;

              return (
                <div
                  key={product.id}
                  className={`relative rounded-xl border p-5 transition-all ${
                    isPremium
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/50 bg-card/50"
                  }`}
                >
                  {isPremium && (
                    <div className="absolute top-0 right-0 w-28 h-28 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  )}

                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isPremium && <Sparkles className="h-4 w-4 text-primary" />}
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                      </div>
                      {isPremium && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>

                    <p className="text-2xl font-bold text-foreground">
                      {product.price.replace("/month", "")}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
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
                      onClick={() => handleStripeSubscribe(product.id)}
                      disabled={!!subscribing}
                    >
                      {subscribing === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Subscribe"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            Auto-renews unless canceled 24hrs before period end.{" "}
            <a
              href="https://www.lucidrepo.com/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/60 underline hover:text-primary"
            >
              Terms
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/** Native (iOS/Android) plan cards using RevenueCat */
const NativePaywallPlans = ({ onClose }: { onClose: () => void }) => {
  const { products, isLoading, purchaseSubscription, restorePurchases } = useNativeSubscription();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No plans available. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map((product) => {
        const isPremium = product.name.toLowerCase().includes("premium") || product.name.toLowerCase().includes("unlimited");
        return (
          <div
            key={product.id}
            className={`rounded-xl border p-5 space-y-3 ${
              isPremium ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPremium && <Sparkles className="h-4 w-4 text-primary" />}
                <h3 className="font-semibold text-foreground">{product.name}</h3>
              </div>
              {isPremium && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">
              {product.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
            <ul className="space-y-1.5">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`w-full ${isPremium ? "bg-primary hover:bg-primary/90" : ""}`}
              variant={isPremium ? "default" : "outline"}
              onClick={() => purchaseSubscription(product.id)}
            >
              Subscribe
            </Button>
          </div>
        );
      })}

      <Button
        variant="ghost"
        className="w-full text-muted-foreground hover:text-foreground text-sm"
        onClick={restorePurchases}
      >
        <RotateCcw className="h-3.5 w-3.5 mr-2" />
        Restore Purchases
      </Button>
    </div>
  );
};

export default PaywallDialog;
