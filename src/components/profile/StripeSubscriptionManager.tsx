
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

const StripeSubscriptionManager = () => {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    try {
      setCheckingStatus(true);
      
      // Get subscription status from Supabase
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from("stripe_subscriptions")
        .select("*")
        .eq("status", "active")
        .maybeSingle();
      
      if (subscriptionError) throw subscriptionError;
      
      if (subscriptionData) {
        // Get plans info to determine credit limits
        let analysisLimit = 10;
        let imageLimit = 5;
        
        if (subscriptionData.price_id === "price_premium") {
          analysisLimit = 999999; // Unlimited
          imageLimit = 20;
        }
        
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
        setSubscriptionStatus({
          subscribed: false
        });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast.error("Failed to check subscription status");
    } finally {
      setCheckingStatus(false);
    }
  };

  // Handle subscription checkout
  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { action: 'createSession', productId: planId }
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
      
      const { data, error } = await supabase.functions.invoke('create-portal-session');
      
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

  if (checkingStatus) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
        <span className="ml-2">Checking subscription status...</span>
      </div>
    );
  }

  if (subscriptionStatus?.subscribed) {
    return (
      <div className="bg-card/50 border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {subscriptionStatus.subscription_tier} Plan
          </h3>
          <span className="text-sm text-muted-foreground">
            Renews: {subscriptionStatus.subscription_end}
          </span>
        </div>
        
        {subscriptionStatus.analysisCredits && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Dream Analysis</span>
              <span>
                {subscriptionStatus.analysisCredits.used}/{subscriptionStatus.analysisCredits.total === 999999 ? '∞' : subscriptionStatus.analysisCredits.total}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-dream-purple" 
                style={{ 
                  width: `${subscriptionStatus.analysisCredits.total === 999999 
                    ? 100 
                    : Math.min(100, (subscriptionStatus.analysisCredits.used / subscriptionStatus.analysisCredits.total) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}
        
        {subscriptionStatus.imageCredits && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Image Generation</span>
              <span>
                {subscriptionStatus.imageCredits.used}/{subscriptionStatus.imageCredits.total}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-dream-purple" 
                style={{ 
                  width: `${Math.min(100, (subscriptionStatus.imageCredits.used / subscriptionStatus.imageCredits.total) * 100)}%` 
                }}
              />
            </div>
          </div>
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
  }

  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No Active Subscription</h3>
        <p className="text-sm text-muted-foreground">
          Subscribe to access premium dream analysis and image generation features.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="text-lg font-medium">Basic</h4>
          <p className="text-2xl font-bold">$4.99<span className="text-sm text-muted-foreground">/month</span></p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>10 Dream analyses per month</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>5 Image generations per month</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Dream journal backup</span>
            </li>
          </ul>
          <Button 
            className="w-full" 
            onClick={() => handleSubscribe('price_basic')}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Subscribe
          </Button>
        </div>
        
        <div className="border rounded-lg border-dream-purple p-4 space-y-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-dream-purple text-white text-xs py-1 px-2 rounded-full">
            Popular
          </div>
          <h4 className="text-lg font-medium">Premium</h4>
          <p className="text-2xl font-bold">$9.99<span className="text-sm text-muted-foreground">/month</span></p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Unlimited dream analyses</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>20 Image generations per month</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Advanced dream patterns detection</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Priority support</span>
            </li>
          </ul>
          <Button 
            className="w-full bg-dream-purple hover:bg-dream-purple/90" 
            onClick={() => handleSubscribe('price_premium')}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StripeSubscriptionManager;
