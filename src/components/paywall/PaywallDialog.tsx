import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ImageIcon, MessageCircle, Crown, Video, Mic,
  Check, Loader2, RotateCcw, X
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNativeSubscription } from "@/hooks/useNativeSubscription";
import { normalizeProduct, Product } from "@/utils/subscriptionProductUtils";
import { toast } from "sonner";
import lucidRepoLogo from "@/assets/LogoForFramer.png";

const LogoIcon = ({ className }: { className?: string }) => (
  <img src={lucidRepoLogo} alt="" className={className || "h-4 w-4"} />
);

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
    { label: "Unlimited Dream Analysis", icon: LogoIcon },
    { label: "10 Dream Art Generations", icon: ImageIcon },
    { label: "AI Dream Chat (5 msgs/day)", icon: MessageCircle },
    { label: "Voice-to-Text Journaling", icon: Mic },
  ],
  mystic: [
    { label: "Unlimited Dream Analysis", icon: LogoIcon },
    { label: "Unlimited Dream Art", icon: ImageIcon },
    { label: "Unlimited AI Dream Chat", icon: MessageCircle },
    { label: "Dream Video Generation", icon: Video },
    { label: "Voice-to-Text Journaling", icon: Mic },
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

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setFeature(detail?.feature || "analysis");
      setIsOpen(true);
    };
    window.addEventListener("show-paywall", handler);
    return () => window.removeEventListener("show-paywall", handler);
  }, []);

  useEffect(() => {
    if (isOpen && !isNative) {
      fetchStripeProducts();
    }
  }, [isOpen, isNative]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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
    { id: "price_basic", name: "Dreamer", price: "$4.99/month", features: PLAN_FEATURES.dreamer.map((f) => f.label) },
    { id: "price_premium", name: "Mystic", price: "$15.99/month", features: PLAN_FEATURES.mystic.map((f) => f.label) },
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

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
    return priceA - priceB; // cheaper (Dreamer) first
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Full-page slide-up panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[61] flex flex-col bg-background pt-safe-top pb-safe-bottom"
          >
            {/* Fixed header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-border/50">
              <div className="w-10" />
              <h1 className="text-base font-semibold text-foreground">Upgrade</h1>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto pb-24" style={{ WebkitOverflowScrolling: "touch" }}>
              {/* Hero header */}
              <div className="relative px-6 pt-10 pb-6 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 mb-5">
                    <FeatureIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Unlock {featureConfig.title}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    {featureConfig.description}
                  </p>
                </div>
              </div>

              {/* Plans */}
              <div className="px-5 space-y-4">
                {isNative ? (
                  <NativePaywallPlans onClose={() => setIsOpen(false)} />
                ) : loading ? (
                  <div className="flex justify-center py-14">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : (
                  sortedProducts.map((product, index) => {
                    // With price-sorted products, the last (most expensive) is premium
                    const isPremium = sortedProducts.length > 1
                      ? index === sortedProducts.length - 1
                      : product.id === "price_premium";
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
              <div className="px-6 pt-8 pb-6 text-center">
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/** Native (iOS/Android) plan cards using RevenueCat */
const NativePaywallPlans = ({ onClose }: { onClose: () => void }) => {
  const { products, isLoading, purchaseSubscription, restorePurchases } = useNativeSubscription();

  if (isLoading) {
    return (
      <div className="flex justify-center py-14">
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
    <div className="space-y-4">
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
