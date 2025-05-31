
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define your App Store product IDs (these need to match what you configure in App Store Connect)
const PRODUCT_IDS = {
  BASIC: 'com.lucidrepo.basic.monthly',
  PREMIUM: 'com.lucidrepo.premium.monthly'
};

interface NativeProduct {
  id: string;
  name: string;
  price: string;
  features: string[];
  nativeProductId: string;
}

export const useNativeSubscription = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<NativeProduct[]>([]);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Check if we're running on a native platform
    setIsNative(Capacitor.isNativePlatform());
    
    if (Capacitor.isNativePlatform()) {
      initializeInAppPurchases();
    } else {
      // Set fallback products for web/development
      setProducts([
        {
          id: 'price_basic',
          name: 'Basic',
          price: '$4.99/month',
          nativeProductId: PRODUCT_IDS.BASIC,
          features: [
            'Unlimited Dream Analysis',
            '10 Dream Art Generations',
            'Priority Support'
          ]
        },
        {
          id: 'price_premium',
          name: 'Premium',
          price: '$15.99/month',
          nativeProductId: PRODUCT_IDS.PREMIUM,
          features: [
            'Unlimited Dream Analysis',
            'Unlimited Dream Art Generation',
            'Priority Support'
          ]
        }
      ]);
    }
  }, []);

  const initializeInAppPurchases = async () => {
    try {
      // Only try to import and use the plugin on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('Not on native platform, skipping in-app purchase initialization');
        return;
      }

      // Dynamic import with proper error handling using string path
      let InAppPurchase2;
      try {
        const moduleName = '@capacitor-community/in-app-purchases';
        const module = await import(/* @vite-ignore */ moduleName);
        InAppPurchase2 = module.InAppPurchase2;
      } catch (importError) {
        console.error('In-app purchases plugin not available:', importError);
        // Fallback to mock data for development/web
        setProducts([
          {
            id: 'price_basic',
            name: 'Basic',
            price: '$4.99/month',
            nativeProductId: PRODUCT_IDS.BASIC,
            features: [
              'Unlimited Dream Analysis',
              '10 Dream Art Generations',
              'Priority Support'
            ]
          },
          {
            id: 'price_premium',
            name: 'Premium',
            price: '$15.99/month',
            nativeProductId: PRODUCT_IDS.PREMIUM,
            features: [
              'Unlimited Dream Analysis',
              'Unlimited Dream Art Generation',
              'Priority Support'
            ]
          }
        ]);
        return;
      }

      // Initialize the plugin
      await InAppPurchase2.initialize({
        products: [
          {
            id: PRODUCT_IDS.BASIC,
            type: 'PAID_SUBSCRIPTION'
          },
          {
            id: PRODUCT_IDS.PREMIUM,
            type: 'PAID_SUBSCRIPTION'
          }
        ]
      });

      // Get product information from the App Store
      const result = await InAppPurchase2.getProducts({
        productIdentifiers: [PRODUCT_IDS.BASIC, PRODUCT_IDS.PREMIUM]
      });

      // Convert App Store products to our format
      const nativeProducts: NativeProduct[] = result.products.map((product: any) => {
        const isBasic = product.productIdentifier === PRODUCT_IDS.BASIC;
        return {
          id: isBasic ? 'price_basic' : 'price_premium',
          name: isBasic ? 'Basic' : 'Premium',
          price: product.localizedPrice || (isBasic ? '$4.99/month' : '$15.99/month'),
          nativeProductId: product.productIdentifier,
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

      // Set up purchase listeners
      InAppPurchase2.addListener('purchaseUpdated', handlePurchaseUpdate);
      InAppPurchase2.addListener('purchaseFailed', handlePurchaseFailure);

    } catch (error) {
      console.error('Failed to initialize in-app purchases:', error);
      toast.error('Failed to load subscription options');
    }
  };

  const handlePurchaseUpdate = async (purchase: any) => {
    console.log('Purchase updated:', purchase);
    
    if (purchase.transactionState === 'purchased') {
      // Verify the purchase with your backend
      await verifyPurchase(purchase);
      toast.success('Subscription activated successfully!');
    }
  };

  const handlePurchaseFailure = (error: any) => {
    console.error('Purchase failed:', error);
    toast.error('Purchase failed. Please try again.');
    setIsLoading(false);
  };

  const verifyPurchase = async (purchase: any) => {
    try {
      // Send the receipt to your backend for verification
      const { error } = await supabase.functions.invoke('verify-ios-purchase', {
        body: {
          receiptData: purchase.transactionReceipt,
          productId: purchase.productIdentifier,
          transactionId: purchase.transactionIdentifier
        }
      });

      if (error) {
        throw error;
      }

      // Purchase verified successfully
      console.log('Purchase verified successfully');
    } catch (error) {
      console.error('Failed to verify purchase:', error);
      toast.error('Failed to verify purchase');
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
      // Dynamic import with proper error handling using string path
      let InAppPurchase2;
      try {
        const moduleName = '@capacitor-community/in-app-purchases';
        const module = await import(/* @vite-ignore */ moduleName);
        InAppPurchase2 = module.InAppPurchase2;
      } catch (importError) {
        console.error('In-app purchases plugin not available:', importError);
        toast.error('In-app purchases not available');
        setIsLoading(false);
        return;
      }
      
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      console.log('Purchasing product:', product.nativeProductId);
      
      // Initiate the purchase
      await InAppPurchase2.purchase({
        productIdentifier: product.nativeProductId
      });

      // The purchase will be handled by the purchaseUpdated listener
    } catch (error: any) {
      console.error('Purchase initiation failed:', error);
      toast.error(`Purchase failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Restore purchases is only available on mobile devices');
      return;
    }

    try {
      setIsLoading(true);
      
      // Dynamic import with proper error handling using string path
      let InAppPurchase2;
      try {
        const moduleName = '@capacitor-community/in-app-purchases';
        const module = await import(/* @vite-ignore */ moduleName);
        InAppPurchase2 = module.InAppPurchase2;
      } catch (importError) {
        console.error('In-app purchases plugin not available:', importError);
        toast.error('In-app purchases not available');
        setIsLoading(false);
        return;
      }

      await InAppPurchase2.restorePurchases();
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
