
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

  // Fetch products from Stripe
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { action: 'getProducts' }
      });
      
      if (error) throw error;
      
      if (data?.products) {
        setProducts(data.products);
        console.log("Stripe products:", data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Fallback products if API call fails
      setProducts([
        {
          id: 'price_basic',
          name: 'Basic',
          price: '$4.99/month',
          features: ['10 Dream analyses per month', '5 Image generations per month', 'Dream journal backup']
        },
        {
          id: 'price_premium',
          name: 'Premium',
          price: '$9.99/month',
          features: ['Unlimited dream analyses', '20 Image generations per month', 'Advanced dream patterns detection', 'Priority support']
        }
      ]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    try {
      setCheckingStatus(true);
      
      // Get subscription status from Supabase
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
      
      // Get the subscription details
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("stripe_subscriptions")
        .select("*")
        .eq("customer_id", customerData.customer_id)
        .eq("status", "active")
        .maybeSingle();
      
      if (subscriptionError) throw subscriptionError;
      
      if (subscriptionData) {
        // Get plans info to determine credit limits
        const analysisLimit = subscriptionData.price_id === "price_premium" ? 999999 : 10;
        const imageLimit = subscriptionData.price_id === "price_premium" ? 20 : 5;
        
        setSubscriptionStatus({
          subscribed: true,
          subscription_tier: subscriptionData.price_id === "price_premium" ? "Premium" : "Basic",
          subscription_end: new Date(subscriptionData.current_period_end * 1000).toLocaleDateString(),
          analysisCredits: {
            used: subscriptionData.dream_analyses_used || 0,
            total: analysisLimit
          },
          imageCredits: {
            used: subscriptionData.image_generations_used || 0,
            total: imageLimit
          }
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

  // Handle subscription checkout
  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { action: 'createSession', priceId }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start subscription process");
    } finally {
      setLoading(false);
    }
  };

  // Handle managing subscription
  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {}
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open subscription management portal");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
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

// Component for loading state
const SubscriptionLoadingState = () => (
  <div className="flex justify-center items-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
    <span className="ml-2">Loading subscription options...</span>
  </div>
);

// Component for active subscription
interface ActiveSubscriptionProps {
  subscriptionStatus: SubscriptionStatus;
  handleManageSubscription: () => Promise<void>;
  loading: boolean;
}

const ActiveSubscription = ({ 
  subscriptionStatus, 
  handleManageSubscription, 
  loading 
}: ActiveSubscriptionProps) => (
  <div className="bg-card/50 border rounded-lg p-4 space-y-4 max-w-full">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">
        {subscriptionStatus.subscription_tier} Plan
      </h3>
      <span className="text-sm text-muted-foreground">
        Renews: {subscriptionStatus.subscription_end}
      </span>
    </div>
    
    {subscriptionStatus.analysisCredits && (
      <CreditBar
        label="Dream Analysis"
        used={subscriptionStatus.analysisCredits.used}
        total={subscriptionStatus.analysisCredits.total}
      />
    )}
    
    {subscriptionStatus.imageCredits && (
      <CreditBar
        label="Image Generation"
        used={subscriptionStatus.imageCredits.used}
        total={subscriptionStatus.imageCredits.total}
      />
    )}
    
    <Button 
      variant="outline" 
      className="w-full mt-4" 
      onClick={handleManageSubscription}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      Manage Subscription
    </Button>
  </div>
);

// Credit bar component
interface CreditBarProps {
  label: string;
  used: number;
  total: number;
}

const CreditBar = ({ label, used, total }: CreditBarProps) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>
        {used}/{total === 999999 ? '∞' : total}
      </span>
    </div>
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <div 
        className="h-full bg-dream-purple" 
        style={{ 
          width: `${total === 999999 
            ? 100 
            : Math.min(100, (used / total) * 100)}%` 
        }}
      />
    </div>
  </div>
);

// Component for no subscription
interface NoSubscriptionProps {
  products: Product[];
  productsLoading: boolean;
  handleSubscribe: (priceId: string) => Promise<void>;
  loading: boolean;
}

const NoSubscription = ({ 
  products, 
  productsLoading, 
  handleSubscribe, 
  loading 
}: NoSubscriptionProps) => (
  <div className="space-y-6 overflow-y-auto">
    <div className="text-center pb-4">
      <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
      <h3 className="text-lg font-medium">No Active Subscription</h3>
      <p className="text-sm text-muted-foreground">
        Subscribe to access premium dream analysis and image generation features.
      </p>
    </div>
    
    <div className="grid gap-4 md:grid-cols-2">
      {productsLoading ? (
        <div className="col-span-2 flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
        </div>
      ) : (
        products.map((product) => (
          <ProductCard 
            key={product.id}
            product={product}
            handleSubscribe={handleSubscribe}
            loading={loading}
          />
        ))
      )}
    </div>
  </div>
);

// Product card component
interface ProductCardProps {
  product: Product;
  handleSubscribe: (priceId: string) => Promise<void>;
  loading: boolean;
}

const ProductCard = ({ product, handleSubscribe, loading }: ProductCardProps) => (
  <div 
    className={`border rounded-lg p-4 space-y-4 ${
      product.name === "Premium" ? "border-dream-purple relative overflow-hidden" : ""
    }`}
  >
    {product.name === "Premium" && (
      <div className="absolute top-2 right-2 bg-dream-purple text-white text-xs py-1 px-2 rounded-full">
        Popular
      </div>
    )}
    <h4 className="text-lg font-medium">{product.name}</h4>
    <p className="text-2xl font-bold">{product.price}</p>
    <ul className="space-y-2 text-sm">
      {product.features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <span className="mr-2">•</span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Button 
      className={`w-full ${
        product.name === "Premium" ? "bg-dream-purple hover:bg-dream-purple/90" : ""
      }`}
      onClick={() => handleSubscribe(product.id)}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      Subscribe
    </Button>
  </div>
);

export default StripeSubscriptionManager;
