import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Purchases } from '@revenuecat/purchases-capacitor';

const PRODUCT_IDS = {
  BASIC: 'com.lucidrepo.limited.monthly',
  PREMIUM: 'com.lucidrepo.unlimited.monthly.'
};

interface NativeProduct {
  id: string;
  name: string;
  price: string;
  features: string[];
  packageObject: any; // Store the full package object
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
      await Purchases.configure({
        apiKey: 'appl_QNsyVEgaltTbxopyYGyhXeGOUQk', // replace this with your actual public SDK key
        appUserID: user?.id || undefined
      });

      const offerings = await Purchases.getOfferings();
      const availablePackages = offerings.current?.availablePackages || [];

      const nativeProducts: NativeProduct[] = availablePackages.map((pkg: any) => {
        const isBasic = pkg.product.identifier === PRODUCT_IDS.BASIC;
        return {
          id: isBasic ? 'price_basic' : 'price_premium',
          name: isBasic ? 'Basic' : 'Premium',
          price: pkg.product.priceString,
          packageObject: pkg, // Store the full package object
          features: isBasic ? [
            'Unlimited Dream Analysis',
            '10 Dream Art Generations',
            'Priority Support'
          ] : [
            'Unlimited Dream Analysis',
            'Unlimited Dream Art Generation',
            'Priority Support'
          ]
        };
      });

      setProducts(nativeProducts);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      toast.error('Failed to load subscription options');
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
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error('Product not found');

      const purchaseResult = await Purchases.purchasePackage({ 
        aPackage: product.packageObject 
      });

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
      await Purchases.restorePurchases();
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
    purchaseSubscription,
    restorePurchases
  };
};
