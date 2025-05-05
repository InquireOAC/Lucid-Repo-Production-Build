
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession, createPortalSession, getStripePrices } from "@/lib/stripe";
import { toast } from "sonner";
import { Brain, Image, CreditCard, Loader2, Check, Star, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
    analysisCredits: {
      used: number;
      total: number;
    };
    imageCredits: {
      used: number;
      total: number;
    };
  };
}

interface ProductInfo {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
}

const SubscriptionDialog = ({
  isOpen,
  onOpenChange,
  subscription
}: SubscriptionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchProducts = async () => {
      try {
        setError(null);
        setLoadingProducts(true);
        console.log("Fetching Stripe products...");
        const productsData = await getStripePrices();
        console.log("Products data received:", productsData);
        setProducts(productsData);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        setError(error?.message || "Failed to load subscription options");
        toast.error("Failed to load subscription options", {
          description: "Please try again later. If this problem persists, please contact support."
        });
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [isOpen]);

  const handleSubscribe = async (productId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Creating checkout session for product:", productId);
      await createCheckoutSession(productId);
      // Success case is handled by redirect to Stripe
    } catch (error: any) {
      console.error("Subscription error:", error);
      setError(error?.message || "Failed to start subscription");
      toast.error("Unable to start subscription process", {
        description: "Please try again later. If this problem persists, please contact support."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Creating portal session...");
      await createPortalSession();
      // Success case is handled by redirect to Stripe Portal
    } catch (error: any) {
      console.error("Portal error:", error);
      setError(error?.message || "Failed to open subscription portal");
      toast.error("Unable to open subscription portal", {
        description: "Please try again later. If this problem persists, please contact support."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="gradient-text">Subscription</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="space-y-6 py-4">
            {error && (
              <div className="p-4 border border-destructive/50 rounded-lg text-destructive">
                <p className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </p>
              </div>
            )}

            {subscription && (
              <div className="space-y-4 p-4 border rounded-lg bg-card/50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Star className="text-yellow-400" size={20} />
                    {subscription.plan}
                  </h3>
                  <Badge 
                    variant={subscription.status === "active" ? "default" : "outline"}
                    className={subscription.status === "active" ? "bg-green-600" : ""}
                  >
                    {subscription.status === "active" ? "Active" : subscription.status}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current period ends: <span className="text-foreground">{subscription.currentPeriodEnd}</span>
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Brain size={16} className="text-dream-purple" />
                        <span>Dream Analysis Credits</span>
                      </div>
                      <span>
                        {subscription.analysisCredits.used}/{subscription.analysisCredits.total}
                      </span>
                    </div>
                    <Progress 
                      value={(subscription.analysisCredits.used / subscription.analysisCredits.total) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Image size={16} className="text-dream-purple" />
                        <span>Image Generation Credits</span>
                      </div>
                      <span>
                        {subscription.imageCredits.used}/{subscription.imageCredits.total}
                      </span>
                    </div>
                    <Progress 
                      value={(subscription.imageCredits.used / subscription.imageCredits.total) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={handleManageSubscription}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CreditCard size={16} />
                    )}
                    <span>Manage Subscription</span>
                  </Button>
                </div>
              </div>
            )}
            
            {loadingProducts ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-dream-purple" />
                <span className="ml-2 text-muted-foreground">Loading subscription options...</span>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {products.length > 0 ? (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className={cn(
                        "rounded-lg border p-4 space-y-4",
                        subscription?.plan === product.name ? "border-primary border-2" : ""
                      )}
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-medium">{product.name}</h4>
                          {subscription?.plan === product.name && (
                            <Badge variant="outline" className="bg-primary/20 text-primary-foreground">
                              Current Plan
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold gradient-text">{product.price}</p>
                        <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        onClick={() => handleSubscribe(product.id)}
                        disabled={loading || subscription?.plan === product.name}
                        variant={subscription?.plan === product.name ? "outline" : "default"}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {subscription?.plan === product.name ? "Current Plan" : "Subscribe"}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-6 text-center border rounded-lg">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No subscription plans available at the moment.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
