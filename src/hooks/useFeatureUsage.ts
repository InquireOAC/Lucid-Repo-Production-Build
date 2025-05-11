
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type FeatureType = 'analysis' | 'image';

export const useFeatureUsage = () => {
  const { user } = useAuth();
  const [usageState, setUsageState] = useState<Record<FeatureType, boolean>>({
    analysis: false,
    image: false
  });

  // Load usage state from localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedUsage = localStorage.getItem(`feature_usage_${user.id}`);
      if (savedUsage) {
        setUsageState(JSON.parse(savedUsage));
      }
    }
  }, [user]);

  const hasUsedFeature = (featureType: FeatureType): boolean => {
    if (!user) return false;
    
    // Special case for app creator - always return false to indicate feature has not been used
    if (user.email === "inquireoac@gmail.com") {
      return false;
    }
    
    return usageState[featureType];
  };

  const markFeatureAsUsed = (featureType: FeatureType): void => {
    if (!user) return;
    
    // Special case for app creator - don't mark features as used
    if (user.email === "inquireoac@gmail.com") {
      return;
    }
    
    const newUsageState = {
      ...usageState,
      [featureType]: true
    };
    
    setUsageState(newUsageState);
    localStorage.setItem(`feature_usage_${user.id}`, JSON.stringify(newUsageState));
  };

  // Function to check if user can use the feature (free trial or subscription)
  const canUseFeature = async (featureType: FeatureType): Promise<boolean> => {
    if (!user) return false;
    
    // Special case for app creator - always return true
    if (user.email === "inquireoac@gmail.com") {
      return true;
    }
    
    // Check if user has already used their free trial
    const hasUsed = hasUsedFeature(featureType);
    
    if (!hasUsed) {
      // User hasn't used their free trial yet
      return true;
    }
    
    // User has used their free trial, check for subscription
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (customerError || !customerData?.customer_id) {
      return false;
    }
    
    // Check if user has subscription credits
    const { data: hasAccess, error: accessError } = await supabase.rpc(
      'check_subscription_credits',
      { 
        customer_id: customerData.customer_id,
        credit_type: featureType
      }
    );
    
    if (accessError) {
      console.error('Credit check error:', accessError);
      return false;
    }
    
    return !!hasAccess;
  };

  return {
    hasUsedFeature,
    markFeatureAsUsed,
    canUseFeature
  };
};
