import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, AlertCircle, Sparkles, Crown, Brain, ImageIcon, MessageCircle, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { normalizeProduct, Product } from "@/utils/subscriptionProductUtils";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  cancelAtPeriodEnd?: boolean;
  analysisCredits?: { used: number; total: number };
  imageCredits?: { used: number; total: number };
}

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

interface StripeSubscriptionManagerProps {
  currentPlan?: string;
}

const StripeSubscriptionManager = ({ currentPlan }: StripeSubscriptionManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [configError, setConfigError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const canceled = searchParams.get("canceled");
    if (sessionId) { toast.success("Subscription activated!"); checkSubscriptionStatus(); }
    else if (canceled) { toast.info("Subscription process canceled"); }
  }, [searchParams]);

  useEffect(() => {
    if (user) { fetchProducts(); checkSubscriptionStatus(); }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true); setConfigError(null); setApiError(null);
      const { data, error } = await supabase.functions.invoke("create-checkout-session", { body: { action: "getProducts" } });
      if (error) { setConfigError("Unable to fetch plans."); setApiError(error.message); throw error; }
      if (data?.error) { setConfigError("Stripe API error."); setApiError(data.errorDetails || data.error); throw new Error(data.error); }
      if (data?.products && Array.isArray(data.products)) {
        setProducts(data.products.map(normalizeProduct));
      } else { throw new Error("Invalid products data"); }
    } catch {
      setProducts([
        { id: "price_basic", name: "Dreamer", price: "$4.99/month", features: PLAN_FEATURES.dreamer.map(f => f.label) },
        { id: "price_premium", name: "Mystic", price: "$15.99/month", features: PLAN_FEATURES.mystic.map(f => f.label) },
      ]);
    } finally { setProductsLoading(false); }
  };

  const checkSubscriptionStatus = async () => {
    try {
      setCheckingStatus(true);
      const { data: customerData, error: customerError } = await supabase.from("stripe_customers").select("customer_id").eq("user_id", user?.id).maybeSingle();
      if (customerError) throw customerError;
      if (!customerData?.customer_id) { setSubscriptionStatus({ subscribed: false }); return; }
      const { data: subscriptionData, error: subscriptionError } = await supabase.from("stripe_subscriptions").select("*").eq("customer_id", customerData.customer_id).eq("status", "active").maybeSingle();
      if (subscriptionError) throw subscriptionError;
      if (subscriptionData) {
        const imageLimit = subscriptionData.price_id === "price_premium" ? 999999 : 10;
        setSubscriptionStatus({
          subscribed: true,
          subscription_tier: subscriptionData.price_id === "price_premium" ? "Mystic" : "Dreamer",
          subscription_end: new Date(subscriptionData.current_period_end * 1000).toLocaleDateString(),
          cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
          analysisCredits: { used: subscriptionData.dream_analyses_used || 0, total: 999999 },
          imageCredits: { used: subscriptionData.image_generations_used || 0, total: imageLimit },
        });
      } else { setSubscriptionStatus({ subscribed: false }); }
    } catch { setSubscriptionStatus({ subscribed: false }); }
    finally { setCheckingStatus(false); }
  };

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(true); setApiError(null);
      const { data, error } = await supabase.functions.invoke("create-checkout-session", { body: { action: "createSession", priceId } });
      if (error) { setApiError(error.message); throw error; }
      if (data?.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (error: any) { toast.error("Failed to start checkout", { description: error.message }); }
    finally { setLoading(false); }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("create-portal-session", { body: {} });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("No portal URL returned");
    } catch { toast.error("Failed to open subscription portal"); }
    finally { setLoading(false); }
  };

  if (checkingStatus || productsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-muted-foreground">Loading plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-full">
      {(configError || apiError) && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{configError || apiError}</span>
        </div>
      )}

      {subscriptionStatus?.subscribed ? (
        <ActiveSubscription subscriptionStatus={subscriptionStatus} handleManageSubscription={handleManageSubscription} loading={loading} />
      ) : (
        <div className="space-y-5">
          <div className="text-center pb-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-3">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Unlock Premium</h3>
            <p className="text-sm text-muted-foreground mt-1">Dream analysis & art generation at your fingertips</p>
          </div>

          <div className="grid gap-3">
            {products.map((product) => {
              const isPremium = product.name.toLowerCase().includes("mystic") || product.name.toLowerCase().includes("premium");
              const planFeatures = isPremium ? PLAN_FEATURES.mystic : PLAN_FEATURES.dreamer;
              return (
                <PlanCard
                  key={product.id}
                  product={product}
                  isPremium={isPremium}
                  planFeatures={planFeatures}
                  onSubscribe={handleSubscribe}
                  loading={loading}
                />
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/60 text-center leading-relaxed">
        Auto-renews unless canceled 24hrs before period end.{" "}
        <a href="https://www.lucidrepo.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary/60 underline hover:text-primary">Terms</a>
      </p>
    </div>
  );
};

/* Plan Card */
interface PlanCardProps {
  product: Product;
  isPremium: boolean;
  planFeatures: { label: string; icon: React.ElementType }[];
  onSubscribe: (priceId: string) => Promise<void>;
  loading: boolean;
}

const PlanCard = ({ product, isPremium, planFeatures, onSubscribe, loading }: PlanCardProps) => {
  const [localLoading, setLocalLoading] = useState(false);

  const onClick = async () => {
    setLocalLoading(true);
    try { await onSubscribe(product.id); } catch {} finally { setLocalLoading(false); }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 space-y-3 transition-all ${isPremium ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/50"}`}>
      {isPremium && <div className="absolute top-0 right-0 w-28 h-28 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />}
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
          {product.price.replace("/month", "")}<span className="text-sm font-normal text-muted-foreground">/mo</span>
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
          onClick={onClick}
          disabled={loading || localLoading}
        >
          {loading || localLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </Button>
      </div>
    </div>
  );
};

/* Active Subscription */
interface ActiveSubscriptionProps {
  subscriptionStatus: SubscriptionStatus;
  handleManageSubscription: () => Promise<void>;
  loading: boolean;
}

const ActiveSubscription = ({ subscriptionStatus, handleManageSubscription, loading }: ActiveSubscriptionProps) => (
  <div className="space-y-4">
    <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold text-foreground">{subscriptionStatus.subscription_tier} Plan</h3>
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">Active</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {subscriptionStatus.cancelAtPeriodEnd ? `Expires ${subscriptionStatus.subscription_end}` : `Renews ${subscriptionStatus.subscription_end}`}
        </p>
      </div>
    </div>

    {subscriptionStatus.cancelAtPeriodEnd && (
      <div className="text-xs text-amber-500 bg-amber-500/10 rounded-lg p-3">
        Your subscription will end on {subscriptionStatus.subscription_end}.
      </div>
    )}

    {subscriptionStatus.imageCredits && (
      <div className="rounded-lg border border-border/50 p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Image Generation</span>
          <span className="font-medium text-foreground">{subscriptionStatus.imageCredits.used}/{subscriptionStatus.imageCredits.total === 999999 ? "∞" : subscriptionStatus.imageCredits.total}</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${subscriptionStatus.imageCredits.total === 999999 ? 100 : Math.min(100, (subscriptionStatus.imageCredits.used / subscriptionStatus.imageCredits.total) * 100)}%` }} />
        </div>
      </div>
    )}

    <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/5" onClick={handleManageSubscription} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
      Manage Subscription
    </Button>
  </div>
);

export default StripeSubscriptionManager;
