import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, XCircle, RefreshCw, ShieldAlert, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  cancelAtPeriodEnd?: boolean;
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
  const [configError, setConfigError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Check if we just returned from a checkout session
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');
    
    if (sessionId) {
      toast.success("Subscription activated!", {
        description: "Your subscription has been successfully activated.",
      });
      checkSubscriptionStatus();
    } else if (canceled) {
      toast.info("Subscription process canceled", {
        description: "You canceled the subscription process.",
      });
    }
  }, [searchParams]);

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
      setConfigError(null);
      setApiError(null);

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { action: 'getProducts' }
      });

      if (error) {
        console.error("Error fetching products:", error);
        setConfigError("Unable to fetch subscription plans. Using default plans.");
        setApiError(error.message || "API call failed");
        throw error;
      }

      if (data?.error) {
        console.warn("API returned an error:", data.error);
        setConfigError("Stripe API error. Using default plans.");
        setApiError(data.errorDetails || data.error);
        throw new Error(data.error);
      }

      // FORCE: Always use hardcoded features for Basic and Premium, IGNORE what stripe returns
      if (data?.products && Array.isArray(data.products)) {
        const normalizedProducts = data.products.map((product: any) => {
          let features: string[] = [];
          // Decide based on plan name, ignoring any features Stripe sends back
          if (product.name && product.name.toLowerCase().includes('premium')) {
            features = [
              'Unlimited Dream Analysis',
              'Unlimited Dream Art Generation',
              'Priority Support'
            ];
          } else {
            features = [
              '10 Dream Analysis',
              '10 Dream Art Generations',
              'Priority Support'
            ];
          }
          return {
            ...product,
            features, // OVERRIDE!
          };
        });
        setProducts(normalizedProducts);
      } else {
        throw new Error("Invalid products data");
      }
    } catch (error) {
      setProducts([
        {
          id: 'price_basic',
          name: 'Basic',
          price: '$4.99/month',
          features: ['10 Dream Analysis', '10 Dream Art Generations', 'Priority Support'],
        },
        {
          id: 'price_premium',
          name: 'Premium',
          price: '$15.99/month',
          features: ['Unlimited Dream Analysis', 'Unlimited Dream Art Generation', 'Priority Support'],
        }
      ]);
      toast.error("Failed to load subscription plans", {
        description: "Using default plans. Please try again later.",
      });
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
      
      if (customerError) {
        console.error("Error fetching customer:", customerError);
        throw customerError;
      }
      
      if (!customerData?.customer_id) {
        console.log("No customer record found");
        setSubscriptionStatus({ subscribed: false });
        return;
      }
      
      console.log("Found customer ID:", customerData.customer_id);
      
      // Get the subscription details
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("stripe_subscriptions")
        .select("*")
        .eq("customer_id", customerData.customer_id)
        .eq("status", "active")
        .maybeSingle();
      
      if (subscriptionError) {
        console.error("Error fetching subscription:", subscriptionError);
        throw subscriptionError;
      }
      
      if (subscriptionData) {
        console.log("Active subscription found:", subscriptionData);
        // Get plans info to determine credit limits
        const analysisLimit = subscriptionData.price_id === "price_premium" ? 999999 : 10;
        const imageLimit = subscriptionData.price_id === "price_premium" ? 20 : 5;
        
        setSubscriptionStatus({
          subscribed: true,
          subscription_tier: subscriptionData.price_id === "price_premium" ? "Premium" : "Basic",
          subscription_end: new Date(subscriptionData.current_period_end * 1000).toLocaleDateString(),
          cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
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
        console.log("No active subscription found");
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
      setApiError(null);
      
      console.log("Creating checkout session for price:", priceId);
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { action: 'createSession', priceId }
      });
      
      if (error) {
        console.error("Error creating checkout session:", error);
        setApiError(error.message);
        throw error;
      }
      
      if (data?.url) {
        console.log("Redirecting to checkout:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start subscription process", {
        description: error.message || "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle managing subscription
  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      console.log("Creating portal session");
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {}
      });
      
      if (error) {
        console.error("Error opening customer portal:", error);
        throw error;
      }
      
      if (data?.url) {
        console.log("Redirecting to portal:", data.url);
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
      {configError && (
        <Alert variant="destructive" className="mb-4 bg-amber-50">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Configuration Issue</AlertTitle>
          <AlertDescription>
            {configError}
          </AlertDescription>
        </Alert>
      )}
      
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Error</AlertTitle>
          <AlertDescription>
            {apiError}
          </AlertDescription>
        </Alert>
      )}
    
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            fetchProducts();
            checkSubscriptionStatus();
          }}
          disabled={loading}
          className="text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
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
    
    {subscriptionStatus.cancelAtPeriodEnd && (
      <div className="bg-amber-500/10 text-amber-600 rounded-md p-3 text-sm">
        Your subscription will end on {subscriptionStatus.subscription_end}. 
        You can renew your subscription in the subscription management portal.
      </div>
    )}
    
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

const ProductCard = ({ product, handleSubscribe, loading }: ProductCardProps) => {
  const [localLoading, setLocalLoading] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const onSubscribeClick = async () => {
    setLocalError(null);
    setLocalLoading(true);
    try {
      await handleSubscribe(product.id);
    } catch (err: any) {
      setLocalError(err?.message || "Unable to start subscription.");
      console.error("Subscription error", err);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 space-y-4 ${
        product.name.toLowerCase().includes("premium") ? "border-dream-purple relative overflow-hidden" : ""
      }`}
    >
      {product.name.toLowerCase().includes("premium") && (
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
          product.name.toLowerCase().includes("premium")
            ? "bg-dream-purple hover:bg-dream-purple/90"
            : ""
        } flex justify-center items-center relative`}
        onClick={onSubscribeClick}
        disabled={loading || localLoading}
        style={{ zIndex: 10 }}
      >
        {(loading || localLoading) && (
          <span className="absolute left-2 animate-spin w-4 h-4 border-2 border-t-transparent border-white rounded-full" />
        )}
        <span className={loading || localLoading ? "ml-5" : ""}>Subscribe</span>
      </Button>
      {localError && (
        <div className="text-red-500 text-xs text-center">{localError}</div>
      )}
    </div>
  );
};

export default StripeSubscriptionManager;
