import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ImageIcon, MessageCircle, Crown, Video, Mic, Infinity,
  Loader2, RotateCcw, X
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNativeSubscription } from "@/hooks/useNativeSubscription";
import { normalizeProduct, Product } from "@/utils/subscriptionProductUtils";
import { toast } from "sonner";
import lucidRepoLogo from "@/assets/LogoForFramer-3.png";
import { NativePaywallPlugin } from "@/plugins/NativePaywallPlugin";

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

/* ------------------------------------------------------------------ */
/*  Paywall Particles                                                  */
/* ------------------------------------------------------------------ */

const PaywallParticles = React.memo(() => {
  const stars = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const isBright = Math.random() > 0.65;
        return {
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: isBright ? Math.random() * 2.5 + 1.5 : Math.random() * 1.5 + 0.5,
          delay: Math.random() * 8,
          duration: Math.random() * 3 + 2,
          color: Math.random() > 0.5
            ? `hsla(220, 90%, 78%, ${isBright ? 0.8 : 0.35})`
            : `hsla(0, 0%, 100%, ${isBright ? 0.7 : 0.25})`,
          twinkle: isBright,
        };
      }),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            boxShadow: s.twinkle ? `0 0 ${s.size * 3}px ${s.color}` : undefined,
            animation: s.twinkle
              ? `pw-twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`
              : `pw-float ${s.duration + 4}s ${s.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
});
PaywallParticles.displayName = "PaywallParticles";

/* ------------------------------------------------------------------ */
/*  PaywallDialog                                                      */
/* ------------------------------------------------------------------ */

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
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const f: PaywallFeature = detail?.feature || "analysis";

      // On native iOS: try the native SwiftUI paywall first.
      // If it returns 'unsupported' (RevenueCat not ready / iOS 14) fall
      // through to the React sheet below.
      if (Capacitor.getPlatform() === 'ios') {
        try {
          const { result } = await NativePaywallPlugin.presentPaywall({ feature: f });
          if (result !== 'unsupported') return; // native handled it
        } catch {
          // Plugin not compiled in (web dev) — fall through
        }
      }

      setFeature(f);
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
  const selectedTierKey = isNative
    ? nativeTierKey
    : selectedProduct
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
            className="fixed inset-0 z-[61] flex flex-col pt-safe-top pb-safe-bottom overflow-x-hidden relative"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, hsl(235 55% 12%) 0%, hsl(225 60% 6%) 45%, hsl(220 15% 5%) 100%)",
            }}
          >
            {/* Particle background */}
            <PaywallParticles />

            {/* Header */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-4 h-14 relative z-10"
              style={{ borderBottom: "1px solid hsl(217 91% 60% / 0.18)" }}
            >
              <div className="w-10" />
              <h1
                className="text-base text-foreground/90 tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
              >
                Unlock the Dream
              </h1>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto relative z-10" style={{ WebkitOverflowScrolling: "touch" }}>
              {/* Hero */}
              <div className="relative px-6 pt-10 pb-6 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
                <div className="relative">
                  {/* Cosmic moon orb with feature icon */}
                  <div
                    className="relative flex items-center justify-center mx-auto mb-4"
                    style={{ width: 140, height: 140 }}
                  >
                    {/* Outer pulsing glow */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "radial-gradient(circle, hsl(217 91% 60% / 0.2) 0%, transparent 70%)",
                        animation: "pw-pulse-ring 3s ease-in-out infinite",
                      }}
                    />
                    {/* Rotating orbit ring */}
                    <div
                      className="absolute rounded-full border border-primary/20"
                      style={{
                        width: 110,
                        height: 110,
                        animation: "pw-orbit 10s linear infinite",
                      }}
                    >
                      <div
                        className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
                        style={{ top: -3, left: "50%", marginLeft: -3 }}
                      />
                    </div>
                    {/* Moon orb */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: 76,
                        height: 76,
                        background: "radial-gradient(circle at 35% 35%, hsl(220 80% 82%), hsl(240 60% 42%) 55%, hsl(250 50% 18%))",
                        boxShadow: "0 0 30px hsl(217 91% 60% / 0.4), inset 0 0 20px hsl(250 60% 20% / 0.5)",
                      }}
                    />
                    {/* Feature icon */}
                    <div className="relative z-10">
                      <FeatureIcon
                        className="h-9 w-9"
                        style={{ filter: "drop-shadow(0 0 8px hsl(217 91% 80% / 0.7))" }}
                      />
                    </div>
                  </div>

                  <h2
                    className="text-2xl font-semibold text-foreground mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Unlock {featureConfig.title}
                  </h2>
                  <p
                    className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed"
                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                  >
                    {featureConfig.description}
                  </p>
                </div>
              </div>

              {/* Feature list */}
              <div className="px-6 pb-4">
                <p
                  className="text-xs text-muted-foreground mb-3 tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                >
                  Everything included
                </p>
                <ul className="space-y-2.5">
                  {activeFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-foreground/90">
                      <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Plan selection */}
              <div className="px-5 pb-8">
                <p
                  className="text-center text-xs text-muted-foreground mb-4 tracking-wide"
                  style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                >
                  Choose your path through the dreamscape
                </p>

                {isNative ? (
                  <NativePaywallPlans onClose={() => setIsOpen(false)} onTierChange={setNativeTierKey} />
                ) : loading ? (
                  <div className="flex justify-center py-14">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedProducts.map((product, index) => {
                      const isSelected = selectedPlan === product.id;
                      const isPremiumCard = index === 0 && sortedProducts.length > 1;
                      const priceNum = parsePrice(product.price);
                      const priceDisplay = `$${priceNum.toFixed(2)}`;

                      return (
                        <button
                          key={product.id}
                          onClick={() => setSelectedPlan(product.id)}
                          className="relative w-full rounded-2xl p-4 text-left transition-all backdrop-blur-sm"
                          style={{
                            border: isSelected
                              ? isPremiumCard
                                ? "1px solid hsla(45, 90%, 60%, 0.6)"
                                : "1px solid hsl(217 91% 60% / 0.6)"
                              : "1px solid hsla(255, 255%, 255%, 0.1)",
                            background: isSelected
                              ? isPremiumCard
                                ? "hsla(45, 60%, 15%, 0.35)"
                                : "hsl(217 91% 60% / 0.1)"
                              : "hsla(255, 255%, 255%, 0.04)",
                            boxShadow: isSelected
                              ? isPremiumCard
                                ? "0 0 20px hsla(45, 90%, 60%, 0.2), inset 0 0 20px hsla(45, 90%, 60%, 0.05)"
                                : "0 0 16px hsl(217 91% 60% / 0.2), inset 0 0 16px hsl(217 91% 60% / 0.05)"
                              : undefined,
                          }}
                        >
                          {isPremiumCard && (
                            <span
                              className="absolute -top-3 right-4 text-[10px] font-bold uppercase tracking-wider text-amber-900 px-3 py-0.5 rounded-full"
                              style={{ background: "linear-gradient(135deg, hsl(45 90% 65%), hsl(35 90% 55%))" }}
                            >
                              Best Value
                            </span>
                          )}
                          <div className="flex items-center justify-between">
                            <div>
                              <h3
                                className="font-semibold text-foreground text-base"
                                style={isPremiumCard ? { fontFamily: "'Playfair Display', serif" } : undefined}
                              >
                                {product.name}
                              </h3>
                              <p className="text-muted-foreground text-sm mt-0.5">
                                {priceDisplay}/month
                              </p>
                            </div>
                            <div
                              className="h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0"
                              style={{
                                borderColor: isSelected
                                  ? isPremiumCard ? "hsl(45 90% 60%)" : "hsl(var(--primary))"
                                  : "hsl(var(--muted-foreground) / 0.4)",
                                backgroundColor: isSelected
                                  ? isPremiumCard ? "hsl(45 90% 60%)" : "hsl(var(--primary))"
                                  : "transparent",
                              }}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-background" />
                              )}
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
              <div
                className="flex-shrink-0 px-5 pb-6 pt-3 relative z-10"
                style={{ borderTop: "1px solid hsl(217 91% 60% / 0.12)" }}
              >
                <Button
                  className="w-full h-12 text-base font-semibold text-primary-foreground"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(263 60% 55%))",
                    boxShadow: "0 0 20px hsl(var(--primary) / 0.4), 0 4px 24px hsl(var(--primary) / 0.2)",
                  }}
                  onClick={handleSubscribe}
                  disabled={subscribing || !selectedPlan}
                >
                  {subscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Begin Your Journey"}
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

            {/* Paywall keyframes */}
            <style>{`
              @keyframes pw-twinkle {
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
              }
              @keyframes pw-float {
                0% { transform: translateY(0) scale(1); opacity: 0.4; }
                100% { transform: translateY(-30px) scale(1.3); opacity: 0.1; }
              }
              @keyframes pw-pulse-ring {
                0%, 100% { transform: scale(1); opacity: 0.6; }
                50% { transform: scale(1.15); opacity: 1; }
              }
              @keyframes pw-orbit {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ------------------------------------------------------------------ */
/*  Native (iOS/Android) plan cards using RevenueCat                  */
/* ------------------------------------------------------------------ */

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
      {sorted.map((product, index) => {
        const isSelected = selectedPlan === product.id;
        const isPremium = product.id === 'price_premium';
        const isPremiumCard = index === 0 && sorted.length > 1;

        return (
          <button
            key={product.id}
            onClick={() => setSelectedPlan(product.id)}
            className="relative w-full rounded-2xl p-4 text-left transition-all backdrop-blur-sm"
            style={{
              border: isSelected
                ? isPremium
                  ? "1px solid hsla(45, 90%, 60%, 0.6)"
                  : "1px solid hsl(217 91% 60% / 0.6)"
                : "1px solid hsla(255, 255%, 255%, 0.1)",
              background: isSelected
                ? isPremium
                  ? "hsla(45, 60%, 15%, 0.35)"
                  : "hsl(217 91% 60% / 0.1)"
                : "hsla(255, 255%, 255%, 0.04)",
              boxShadow: isSelected
                ? isPremium
                  ? "0 0 20px hsla(45, 90%, 60%, 0.2), inset 0 0 20px hsla(45, 90%, 60%, 0.05)"
                  : "0 0 16px hsl(217 91% 60% / 0.2), inset 0 0 16px hsl(217 91% 60% / 0.05)"
                : undefined,
            }}
          >
            {isPremium && (
              <span
                className="absolute -top-3 right-4 text-[10px] font-bold uppercase tracking-wider text-amber-900 px-3 py-0.5 rounded-full"
                style={{ background: "linear-gradient(135deg, hsl(45 90% 65%), hsl(35 90% 55%))" }}
              >
                Best Value
              </span>
            )}
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-semibold text-foreground text-base"
                  style={isPremium ? { fontFamily: "'Playfair Display', serif" } : undefined}
                >
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mt-0.5">{product.price}/month</p>
              </div>
              <div
                className="h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0"
                style={{
                  borderColor: isSelected
                    ? isPremium ? "hsl(45 90% 60%)" : "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground) / 0.4)",
                  backgroundColor: isSelected
                    ? isPremium ? "hsl(45 90% 60%)" : "hsl(var(--primary))"
                    : "transparent",
                }}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-background" />
                )}
              </div>
            </div>
          </button>
        );
      })}

      <Button
        className="w-full h-12 text-base font-semibold text-primary-foreground mt-4"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(263 60% 55%))",
          boxShadow: "0 0 20px hsl(var(--primary) / 0.4), 0 4px 24px hsl(var(--primary) / 0.2)",
        }}
        onClick={handleSubscribe}
        disabled={subscribing || !selectedPlan}
      >
        {subscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Begin Your Journey"}
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
