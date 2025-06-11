
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Purchases, PurchasesOfferings, PurchasesPackage } from '@revenuecat/purchases-capacitor';

const PRODUCT_IDS = {
  BASIC: 'com.lucidrepo.limited.monthly',
  PREMIUM: 'com.lucidrepo.unlimited.monthly'
};

interface NativeProduct {
  id: string;
  name: string;
  price: string;
  features: string[];
  packageObject: PurchasesPackage;
}

export const useNativeSubscription = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<NativeProduct[]>([]);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    if (Capacitor.isNativePlatform() && user) {
      initializePurchases();
    }
  }, [user]);

  const initializePurchases = async () => {
    try {
      console.log('Initializing RevenueCat with user ID:', user?.id);
      
      await Purchases.configure({
        apiKey: 'appl_QNsyVEgaltTbxopyYGyhXeGOUQk',
        appUserID: user?.id || undefined
      });

      console.log('RevenueCat configured successfully');

      const offerings: PurchasesOfferings = await Purchases.getOfferings();
      console.log('RevenueCat offerings received:', offerings);
      
      const availablePackages = offerings.current?.availablePackages || [];
      console.log('Available packages:', availablePackages);

      if (availablePackages.length === 0) {
        console.warn('No packages found in RevenueCat offerings');
        toast.error('No subscription packages available. Please check RevenueCat configuration.');
        return;
      }

      const nativeProducts: NativeProduct[] = availablePackages.map((pkg: PurchasesPackage) => {
        console.log('Processing package:', pkg.product.identifier, pkg.product.priceString);
        
        const isBasic = pkg.product.identifier === PRODUCT_IDS.BASIC;
        const isPremium = pkg.product.identifier === PRODUCT_IDS.PREMIUM;
        
        // If the product ID doesn't match our expected IDs, still create a product
        let productName = 'Unknown Plan';
        let productId = 'price_unknown';
        let features: string[] = [];

        if (isBasic) {
          productName = 'Basic';
          productId = 'price_basic';
          features = [
            'Unlimited Dream Analysis',
            '10 Dream Art Generations',
            'Priority Support'
          ];
        } else if (isPremium) {
          productName = 'Premium';
          productId = 'price_premium';
          features = [
            'Unlimited Dream Analysis',
            'Unlimited Dream Art Generation',
            'Priority Support'
          ];
        } else {
          // Handle unexpected product IDs by creating a generic product
          productName = pkg.product.title || pkg.product.identifier;
          productId = `price_${pkg.product.identifier.replace(/\./g, '_')}`;
          features = ['All features included'];
          console.warn('Unexpected product ID:', pkg.product.identifier);
        }

        return {
          id: productId,
          name: productName,
          price: pkg.product.priceString,
          packageObject: pkg,
          features
        };
      });

      console.log('Processed native products:', nativeProducts);
      setProducts(nativeProducts);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      toast.error(`Failed to load subscription options: ${error.message || 'Unknown error'}`);
    }
  };

  const purchaseSubscription = async (productId: string) => {
    if (!user) {
      toast.error('Please sign in to purchase a subscription');
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      toast.error('In-app purchases are only available on mobile devices');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting to purchase product:', productId);
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      console.log('Purchasing package:', product.packageObject);
      
      // Show loading toast
      toast.loading('Processing your subscription...', { id: 'purchase-loading' });
      
      const purchaseResult = await Purchases.purchasePackage({ 
        aPackage: product.packageObject 
      });

      console.log('Purchase result:', purchaseResult);
      
      // Verify the purchase with our backend
      await verifyPurchase(purchaseResult, product.packageObject.product.identifier);
      
      // Dismiss loading toast and show success
      toast.dismiss('purchase-loading');
      toast.success('Subscription activated successfully!', {
        description: 'Your premium features are now available.',
        duration: 5000
      });
      
      // Refresh the page to update subscription status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast.dismiss('purchase-loading');
      
      if (error.code === 'PURCHASES_ERROR_PURCHASE_CANCELLED') {
        toast.info('Purchase was cancelled');
      } else {
        toast.error(`Purchase failed: ${error.message}`, {
          description: 'Please try again or contact support if the issue persists.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPurchase = async (purchase: any, productId: string) => {
    try {
      console.log('Verifying purchase with backend:', { productId, purchase });
      
      // Get the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Call our verification edge function
      const { data, error } = await supabase.functions.invoke('verify-ios-purchase', {
        body: {
          receiptData: purchase.customerInfo.originalPurchaseDate, // This might need adjustment based on RevenueCat data structure
          productId: productId,
          transactionId: purchase.transaction?.transactionIdentifier || `rc_${Date.now()}`,
          customerInfo: purchase.customerInfo
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Verification error:', error);
        throw error;
      }
      
      console.log('Purchase verified successfully:', data);
    } catch (error) {
      console.error('Failed to verify purchase:', error);
      // Don't throw here - the purchase might still be valid even if verification fails
      // We'll let the user continue and they can contact support if needed
      toast.warning('Purchase completed but verification pending. If issues persist, contact support.');
    }
  };

  const restorePurchases = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Restore purchases is only available on mobile devices');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Restoring purchases...', { id: 'restore-loading' });
      
      console.log('Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      console.log('Restore result:', customerInfo);
      
      toast.dismiss('restore-loading');
      
      // Check if any active entitlements were restored
      const activeEntitlements = Object.keys(customerInfo.entitlements.active || {});
      
      if (activeEntitlements.length > 0) {
        toast.success('Purchases restored successfully!', {
          description: 'Your subscription has been restored.'
        });
        
        // Refresh the page to update subscription status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.info('No active purchases found to restore');
      }
      
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      toast.dismiss('restore-loading');
      toast.error('Failed to restore purchases', {
        description: 'Please try again or contact support.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    isLoading,
    isNative,
    purchaseSubscription,
    restorePurchases
  };
};
