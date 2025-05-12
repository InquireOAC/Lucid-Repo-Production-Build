import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Type definitions
interface Product {
  id: string;
  name: string;
  description?: string;
  price: string;
  features: string[];
}

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  analysisCredits?: {
    used: number;
    total: number;
  };
  imageCredits?: {
    used: number;
    total: number;
  };
}

interface StripeSubscriptionManagerProps {
  currentPlan?: string;
}

const StripeSubscriptionManager = ({ currentPlan }: StripeSubscriptionManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProducts();
      checkSubscriptionStatus();
    }
  }, [user]);

  // Fetch products from Stripe with explicit fallback logic
  const fetchProducts = async () => {
    setProductsLoading(true);
    let stripeProducts: Product[] = [];

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { action: "getProducts" },
      });

      console.log("Stripe function response:", { data, error });

      if (error) throw error;

      if (Array.isArray(data?.products) && data.products.length > 0) {
        stripeProducts = data.products;
        setProducts(stripeProducts);
        return;
      }

      console.warn("No products returned, falling back to hardcoded plans");
    } catch (err) {
      console.error("Error fetching Stripe products:", err);
    } finally {
      if (stripeProducts.length === 0) {
        setProducts([
          {
            id: "price_basic",
            name: "Basic",
            price: "$4.99/month",
            features: [
              "10 Dream analyses per month",
              "5 Image generations per month",
              "Dream journal backup",
            ],
          },
          {
            id: "price_premium",
            name: "Premium",
            price: "$9.99/month",
            features: [
              "Unlimited dream analyses",
              "20 Image generations per month",
              "Advanced dream patterns detection",
              "Priority support",
            ],
          },
        ]);
      }
      setProductsLoading(false);
    }
  };

  // ...rest of your component unchanged...
  const checkSubscriptionStatus = async () => {
    try {
      setCheckingStatus(true);

      const { data: customerData, error: customerError } = await supabase
        .from("stripe_customers")
        .select("customer_id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (customerError) throw customerError;

      if (!customerData?.customer_id) {
        setSubscriptionStatus({ subscribed: false });
        return;
      }

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("stripe_subscriptions")
        .select("*")
        .eq("customer_id", customerData.customer_id)
        .eq("status", "active")
        .maybeSingle();

      if (subscriptionError) throw subscriptionError;

      if (subscriptionData) {
        const analysisLimit = subscriptionData.price_id === "price_premium" ? Infinity : 10;
        const imageLimit = subscriptionData.price_id === "price_premium" ? 20 : 5;

        setSubscriptionStatus({
          subscribed: true,
          subscription_tier: subscriptionData.price_id === "price_premium" ? "Premium" : "Basic",
          subscription_end: new Date(subscriptionData.current_period_end * 1000).toLocaleDateString(),
          analysisCredits: {
            used: subscriptionData.dream_analyses_used || 0,
            total: analysisLimit,
          },
          imageCredits: {
            used: subscriptionData.image_generations_used || 0,
            total: imageLimit,
          },
        });
      } else {
        setSubscriptionStatus({ subscribed: false });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast.error("Failed to check subscription status");
      setSubscriptionStatus({ subscribed: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubscribe = async (priceId: string) => { /* ... */ };
  const handleManageSubscription = async () => { /* ... */ };

  if (checkingStatus || productsLoading) {
    return <SubscriptionLoadingState />;
  }

  return (
    <div className="space-y-6 max-w-full">
      {subscriptionStatus?.subscribed ? (
        <ActiveSubscription
          subscriptionStatus={subscriptionStatus}
          handleManageSubscription={handleManageSubscription}
          loading={loading}
        />
      ) : (
        <NoSubscription
          products={products}
          productsLoading={productsLoading}
          handleSubscribe={handleSubscribe}
          loading={loading}
        />
      )}
    </div>
  );
};

// ...other child components (SubscriptionLoadingState, ActiveSubscription, NoSubscription, ProductCard, CreditBar) unchanged...

export default StripeSubscriptionManager;
