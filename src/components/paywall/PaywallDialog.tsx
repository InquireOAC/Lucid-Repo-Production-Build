import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ImageIcon, MessageCircle, Crown, Video, Mic, Infinity,
  Check, Loader2, RotateCcw, X
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNativeSubscription } from "@/hooks/useNativeSubscription";
import { normalizeProduct, Product } from "@/utils/subscriptionProductUtils";
import { toast } from "sonner";
import lucidRepoLogo from "@/assets/LogoForFramer-3.png";

const LogoIcon = ({ className }: { className?: string }) => (
  <img src={lucidRepoLogo} alt="" className={className || "h-4 w-4"} />
);

type PaywallFeature = "analysis" | "image" | "chat";

const FEATURE_CONFIG: Record<PaywallFeature, { icon: React.ElementType; title: string; description: string }> = {
  analysis: {
    icon: LogoIcon,
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

const PLAN_FEATURES: Record<string, { label: string; icon: React.ElementType }[]> = {
  dreamer: [
    { label: "Unlimited Dream Analysis", icon: Infinity },
    { label: "10 Dream Art Generations", icon: ImageIcon },
    { label: "AI Dream Chat (5 msgs/day)", icon: MessageCircle },
    { label: "Voice-to-Text Journaling", icon: Mic },
  ],
  mystic: [
    { label: "Unlimited Dream Analysis", icon: Infinity },
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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [nativeTierKey, setNativeTierKey] = useState<string>("mystic");

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
        const normalized = data.products.map(normalizeProduct);
        setProducts(normalized);
        // Default select the premium (most expensive) plan
        const sorted = [...normalized].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        if (sorted.length > 0) setSelectedPlan(sorted[0].id);
      } else {
        const fb = getFallbackProducts();
        setProducts(fb);
        setSelectedPlan(fb[1]?.id || fb[0]?.id);
      }
    } catch {
      const fb = getFallbackProducts();
      setProducts(fb);
      setSelectedPlan(fb[1]?.id || fb[0]?.id);
    } finally {
      setLoading(false);
    }
  };

  const parsePrice = (price: string) => parseFloat(price.replace(/[^0-9.]/g, '')) || 0;

  const getFallbackProducts = (): Product[] => [
    { id: "price_basic", name: "Dreamer", price: "$4.99/month", features: [] },
    { id: "price_premium", name: "Mystic", price: "$15.99/month", features: [] },
  ];

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    try {
      setSubscribing(true);
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { action: "createSession", priceId: selectedPlan },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error("Failed to start checkout", { description: err.message });
    } finally {
      setSubscribing(false);
    }
  };

  const featureConfig = FEATURE_CONFIG[feature];
  const FeatureIcon = featureConfig.icon;

  const sortedProducts = [...products].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));

  const selectedProduct = products.find(p => p.id === selectedPlan);
  const maxPrice = Math.max(...products.map(p => parsePrice(p.price)));
  const selectedTierKey = selectedProduct
    ? (parsePrice(selectedProduct.price) >= maxPrice ? "mystic" : "dreamer")
    : "mystic";
  const activeFeatures = PLAN_FEATURES[selectedTierKey];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[61] flex flex-col bg-background pt-safe-top pb-safe-bottom overflow-x-hidden"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 h-14 border-b border-border/50">
              <div className="w-10" />
              <h1 className="text-base font-semibold text-foreground">Upgrade</h1>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
              {/* Hero */}
              <div className="relative px-6 pt-10 pb-6 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-36 h-36 rounded-2xl mb-2">
                    <FeatureIcon className="h-20 w-20" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Unlock {featureConfig.title}
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    {featureConfig.description}
                  </p>
                </div>
              </div>

              {/* Feature list */}
              <div className="px-6 pb-4">
                <ul className="space-y-2.5">
                  {activeFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-foreground/90">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Plan selection */}
              <div className="px-5 pb-8">
                {isNative ? (
                  <NativePaywallPlans onClose={() => setIsOpen(false)} />
                ) : loading ? (
                  <div className="flex justify-center py-14">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedProducts.map((product, index) => {
                      const isSelected = selectedPlan === product.id;
                      const isBestValue = index === 0 && sortedProducts.length > 1;
                      const priceNum = parsePrice(product.price);
                      const priceDisplay = `$${priceNum.toFixed(2)}`;

                      return (
                        <button
                          key={product.id}
                          onClick={() => setSelectedPlan(product.id)}
                          className={`relative w-full rounded-xl border-2 p-4 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border/30 bg-card/30"
                          }`}
                        >
                          {isBestValue && (
                            <span className="absolute -top-2.5 right-4 text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-primary px-2.5 py-0.5 rounded-full">
                              Best value
                            </span>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground text-base">{product.name}</h3>
                              <p className="text-muted-foreground text-sm mt-0.5">
                                {priceDisplay}/month
                              </p>
                            </div>
                            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Fixed bottom bar */}
            {!isNative && !loading && products.length > 0 && (
              <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-border/30 bg-background">
                <Button
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSubscribe}
                  disabled={subscribing || !selectedPlan}
                >
                  {subscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Subscribe"}
                </Button>
                <p className="text-[11px] text-muted-foreground/60 text-center mt-3 leading-relaxed">
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
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/** Native (iOS/Android) plan cards using RevenueCat */
const NativePaywallPlans = ({ onClose, onTierChange }: { onClose: () => void; onTierChange?: (tier: string) => void }) => {
  const { products, isLoading, purchaseSubscription, restorePurchases } = useNativeSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (products.length > 0 && !selectedPlan) {
      // Default to premium (price_premium)
      const premium = products.find(p => p.id === 'price_premium');
      setSelectedPlan(premium?.id || products[0]?.id);
    }
  }, [products, selectedPlan]);

  // Notify parent of tier changes
  useEffect(() => {
    if (selectedPlan && onTierChange) {
      onTierChange(selectedPlan === 'price_premium' ? 'mystic' : 'dreamer');
    }
  }, [selectedPlan, onTierChange]);

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

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setSubscribing(true);
    await purchaseSubscription(selectedPlan);
    setSubscribing(false);
  };

  // Sort: premium first
  const sorted = [...products].sort((a, b) => {
    if (a.id === 'price_premium') return -1;
    if (b.id === 'price_premium') return 1;
    return 0;
  });

  return (
    <div className="space-y-3">
      {sorted.map((product) => {
        const isSelected = selectedPlan === product.id;
        const isPremium = product.id === 'price_premium';

        return (
          <button
            key={product.id}
            onClick={() => setSelectedPlan(product.id)}
            className={`relative w-full rounded-xl border-2 p-4 text-left transition-all ${
              isSelected ? "border-primary bg-primary/5" : "border-border/30 bg-card/30"
            }`}
          >
            {isPremium && (
              <span className="absolute -top-2.5 right-4 text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-primary px-2.5 py-0.5 rounded-full">
                Best value
              </span>
            )}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-base">{product.name}</h3>
                <p className="text-muted-foreground text-sm mt-0.5">{product.price}/month</p>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
              }`}>
                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
            </div>
          </button>
        );
      })}

      <Button
        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
        onClick={handleSubscribe}
        disabled={subscribing || !selectedPlan}
      >
        {subscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Subscribe"}
      </Button>

      <Button
        variant="ghost"
        className="w-full text-muted-foreground hover:text-foreground text-sm"
        onClick={restorePurchases}
      >
        <RotateCcw className="h-3.5 w-3.5 mr-2" />
        Restore Purchases
      </Button>

      <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
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
  );
};

export default PaywallDialog;
