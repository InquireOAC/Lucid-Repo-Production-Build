import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { PurchasesOfferings, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { revenueCatManager } from '@/utils/revenueCatManager';

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
  const { refreshSubscription } = useSubscriptionContext();
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
      
      await revenueCatManager.initialize(user?.id);
      console.log('RevenueCat configured successfully');

      const offerings: PurchasesOfferings = await revenueCatManager.getOfferings();
      console.log('RevenueCat offerings received:', offerings);
      
      const availablePackages = offerings.current?.availablePackages || [];
      console.log('Available packages:', availablePackages);

      if (availablePackages.length === 0) {
        console.warn('No packages found in RevenueCat offerings');
        console.warn('Expected product IDs:', PRODUCT_IDS.BASIC, PRODUCT_IDS.PREMIUM);
        toast.error('No subscription packages available. Please check RevenueCat configuration.');
        return;
      }

      // Log detailed package information for debugging
      availablePackages.forEach((pkg: PurchasesPackage) => {
        console.log('Found package:', {
          identifier: pkg.product.identifier,
          priceString: pkg.product.priceString,
          title: pkg.product.title,
          description: pkg.product.description
        });
      });

      // Deduplicate packages by product identifier
      const seen = new Set<string>();
      const uniquePackages = availablePackages.filter((pkg: PurchasesPackage) => {
        const id = pkg.product.identifier;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      // Sort by price ascending so we can assign tiers by price
      const sorted = [...uniquePackages].sort((a: PurchasesPackage, b: PurchasesPackage) => {
        const priceA = a.product.price ?? 0;
        const priceB = b.product.price ?? 0;
        return priceA - priceB;
      });

      const nativeProducts: NativeProduct[] = sorted.map((pkg: PurchasesPackage, index: number) => {
        console.log('Processing package:', pkg.product.identifier, pkg.product.priceString, 'price:', pkg.product.price);
        
        const identifier = pkg.product.identifier.toLowerCase();
        const title = (pkg.product.title || '').toLowerCase();
        
        let isBasic = identifier === PRODUCT_IDS.BASIC
          || identifier.includes('limited')
          || identifier.includes('dreamer')
          || title.includes('dreamer')
          || title.includes('basic');
        
        let isPremium = identifier === PRODUCT_IDS.PREMIUM
          || identifier.includes('unlimited')
          || identifier.includes('mystic')
          || title.includes('mystic')
          || title.includes('premium')
          || title.includes('unlimited');

        // If both or neither matched, fall back to price-based tier assignment
        if ((isBasic && isPremium) || (!isBasic && !isPremium)) {
          if (sorted.length >= 2) {
            isBasic = index === 0;
            isPremium = index === sorted.length - 1;
          } else {
            isBasic = true;
            isPremium = false;
          }
        }
        
        let productName: string;
        let productId: string;
        let features: string[];

        if (isPremium) {
          productName = 'Premium';
          productId = 'price_premium';
          features = [
            'Unlimited Dream Analysis',
            'Unlimited Dream Art Generation',
            'Dream Video Generation',
            'Voice-to-Text Journaling',
            'Priority Support'
          ];
        } else {
          productName = 'Basic';
          productId = 'price_basic';
          features = [
            'Unlimited Dream Analysis',
            '10 Dream Art Generations',
            'Dream Video Generation',
            'Voice-to-Text Journaling',
            'Priority Support'
          ];
        }

        return {
          id: productId,
          name: productName,
          price: pkg.product.priceString,
          packageObject: pkg,
          features
        };
      });

      // Keep only one Basic and one Premium (cheapest basic, most expensive premium)
      const basicProduct = nativeProducts.find(p => p.id === 'price_basic');
      const premiumProduct = nativeProducts.find(p => p.id === 'price_premium');
      const finalProducts = [basicProduct, premiumProduct].filter(Boolean) as NativeProduct[];

      console.log('Final native products:', finalProducts);
      setProducts(finalProducts);
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      toast.error(`Failed to load subscription options: ${error.message || 'Unknown error'}`);
    }
  };

  const syncSubscriptionWithSupabase = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      console.log(`Syncing subscription with Supabase (attempt ${retryCount + 1}/${maxRetries})...`);
      
      const result = await revenueCatManager.getCustomerInfo();
      const customerInfo = result.customerInfo;
      
      console.log('Customer info for sync:', customerInfo);
      
      // Get the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      // Call our sync function with enhanced error handling
      const { data, error } = await supabase.functions.invoke('sync-revenuecat-subscription', {
        body: {
          customerInfo: customerInfo
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Sync error:', error);
        throw error;
      }
      
      console.log('Subscription synced successfully:', data);
      
      // Immediate refresh of subscription context
      refreshSubscription();
      
      // Additional refresh after a short delay to ensure propagation
      setTimeout(() => {
        console.log('Secondary refresh of subscription context...');
        refreshSubscription();
      }, 2000);
      
      return true;
      
    } catch (error) {
      console.error(`Failed to sync subscription (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries - 1) {
        console.log(`Retrying sync in ${(retryCount + 1) * 2} seconds...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
        return syncSubscriptionWithSupabase(retryCount + 1);
      } else {
        // Final attempt failed
        toast.warning('Purchase completed but sync pending. Please restart the app if features don\'t appear immediately.');
        return false;
      }
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
      
      const purchaseResult = await revenueCatManager.purchasePackage({ 
        aPackage: product.packageObject 
      });

      console.log('Purchase result:', purchaseResult);
      
      // Sync the subscription with Supabase with retry logic
      const syncSuccess = await syncSubscriptionWithSupabase();
      
      // Dismiss loading toast and show success
      toast.dismiss('purchase-loading');
      
      if (syncSuccess) {
        toast.success('Subscription activated successfully!', {
          description: 'Your premium features are now available.',
          duration: 5000
        });
      } else {
        toast.success('Purchase completed!', {
          description: 'If features don\'t appear, please restart the app.',
          duration: 5000
        });
      }
      
      console.log('Purchase completed successfully - subscription context should be updated');
      
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

  const restorePurchases = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Restore purchases is only available on mobile devices');
      return;
    }

    try {
      setIsLoading(true);
      toast.loading('Restoring purchases...', { id: 'restore-loading' });
      
      console.log('Restoring purchases...');
      const restoreResult = await revenueCatManager.restorePurchases();
      console.log('Restore result:', restoreResult);
      
      // Sync with Supabase after restore with retry logic
      const syncSuccess = await syncSubscriptionWithSupabase();
      
      toast.dismiss('restore-loading');
      
      // Check if any active entitlements were restored
      const activeEntitlements = Object.keys(restoreResult.customerInfo.entitlements?.active || {});
      
      if (activeEntitlements.length > 0) {
        if (syncSuccess) {
          toast.success('Purchases restored successfully!', {
            description: 'Your subscription has been restored.'
          });
        } else {
          toast.success('Purchases found!', {
            description: 'If features don\'t appear, please restart the app.'
          });
        }
        
        console.log('Purchases restored successfully - subscription context should be updated');
      } else {
        const accountType = Capacitor.getPlatform() === 'ios' ? 'Apple ID' : 'Google account';
        toast.info('No active purchases found to restore', {
          description: `Make sure you're signed in with the same ${accountType} used for the original purchase.`
        });
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
