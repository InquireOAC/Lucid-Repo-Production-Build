
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
    if (Capacitor.isNativePlatform()) {
      initializePurchases();
    }
  }, []);

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

  const showPaywall = async () => {
    if (!user) {
      toast.error('Please sign in to access subscriptions');
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      toast.error('Paywall is only available on mobile devices');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Showing RevenueCat paywall...');
      
      // Get current offerings
      const offerings: PurchasesOfferings = await Purchases.getOfferings();
      
      if (!offerings.current || offerings.current.availablePackages.length === 0) {
        throw new Error('No subscription packages available');
      }

      // Use presentPaywallIfNeeded or show packages manually
      try {
        const result = await Purchases.presentPaywallIfNeeded({
          offering: offerings.current
        });
        
        if (result?.customerInfo) {
          console.log('Paywall completed with result:', result);
          await verifyPurchase(result);
          toast.success('Subscription activated successfully!');
        } else {
          console.log('User dismissed paywall without purchasing');
        }
      } catch (paywallError: any) {
        // If presentPaywallIfNeeded doesn't exist, fall back to purchasing the first package
        console.log('Paywall method not available, showing first package:', paywallError);
        
        const firstPackage = offerings.current.availablePackages[0];
        if (firstPackage) {
          const purchaseResult = await Purchases.purchasePackage({ 
            aPackage: firstPackage 
          });
          
          console.log('Purchase result:', purchaseResult);
          await verifyPurchase(purchaseResult);
          toast.success('Subscription activated successfully!');
        } else {
          throw new Error('No packages available for purchase');
        }
      }
    } catch (error: any) {
      console.error('Paywall error:', error);
      if (error.message?.includes('dismissed') || error.message?.includes('cancelled')) {
        console.log('User cancelled subscription flow');
      } else {
        toast.error(`Subscription error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
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
      const purchaseResult = await Purchases.purchasePackage({ 
        aPackage: product.packageObject 
      });

      console.log('Purchase result:', purchaseResult);
      await verifyPurchase(purchaseResult);
      toast.success('Subscription activated successfully!');
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast.error(`Purchase failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPurchase = async (purchase: any) => {
    try {
      console.log('Verifying purchase:', purchase);
      const { error } = await supabase.functions.invoke('verify-ios-purchase', {
        body: {
          receiptData: purchase.customerInfo.entitlements.active,
          productId: purchase.product.identifier,
          transactionId: purchase.transaction.transactionIdentifier
        }
      });

      if (error) throw error;
      console.log('Purchase verified successfully');
    } catch (error) {
      console.error('Failed to verify purchase:', error);
      toast.error('Failed to verify purchase');
    }
  };

  const restorePurchases = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Restore purchases is only available on mobile devices');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Restoring purchases...');
      await Purchases.restorePurchases();
      console.log('Purchases restored successfully');
      toast.success('Purchases restored successfully');
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      toast.error('Failed to restore purchases');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products,
    isLoading,
    isNative,
    showPaywall,
    purchaseSubscription,
    restorePurchases
  };
};
