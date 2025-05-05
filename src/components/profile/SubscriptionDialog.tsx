import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createCheckoutSession, createPortalSession, getStripePrices } from "@/lib/stripe";
import { toast } from "sonner";
import { Brain, Image, CreditCard, Loader2 } from "lucide-react";

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
        const productsData = await getStripePrices();
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
                <p className="text-sm">{error}</p>
              </div>
            )}

            {subscription && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Current Plan: {subscription.plan}</h3>
                  <Badge variant="outline">{subscription.status}</Badge>
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
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border p-4 space-y-4"
                  >
                    <div>
                      <h4 className="text-lg font-medium">{product.name}</h4>
                      <p className="text-2xl font-bold gradient-text">{product.price}</p>
                      <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <span className="mr-2">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(product.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Subscribe
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;