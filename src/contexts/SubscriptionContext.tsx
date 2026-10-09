
import React, { createContext, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { revenueCatManager } from '@/utils/revenueCatManager';
import { Capacitor } from "@capacitor/core";
import { resolveTierId, TIER_DEFINITIONS, type LucidTierId, type TierDefinition } from '@/lib/stripe';

interface SubscriptionContextType {
  subscription: any;
  isLoading: boolean;
  refreshSubscription: () => void;
  forceRefreshSubscription: () => void;
  /** Lucid Engine shared tier identifier */
  tierId: LucidTierId;
  /** Full tier definition with feature flags and limits */
  tierDef: TierDefinition;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { subscription, isLoading, refreshSubscription: baseRefreshSubscription } = useSubscription(user);
  const revenueCatInitialized = useRef<string | null>(null);

  // Initialize RevenueCat only once per user and only on native platforms
  useEffect(() => {
    if (user?.id && Capacitor.isNativePlatform() && revenueCatInitialized.current !== user.id) {
      initializeRevenueCat();
      revenueCatInitialized.current = user.id;
    }
  }, [user?.id]);

  const initializeRevenueCat = async () => {
    try {
      console.log('Initializing RevenueCat for SubscriptionContext...');
      await revenueCatManager.initialize(user?.id);
      console.log('RevenueCat initialized successfully in SubscriptionContext');
    } catch (error) {
      console.error('Failed to initialize RevenueCat in SubscriptionContext:', error);
    }
  };

  // Enhanced refresh function with forced update capability
  const refreshSubscription = useCallback(() => {
    console.log('Refreshing subscription from context...');
    baseRefreshSubscription();
  }, [baseRefreshSubscription]);

  // Force refresh that also re-initializes RevenueCat if needed
  const forceRefreshSubscription = useCallback(async () => {
    console.log('Force refreshing subscription...');
    
    if (user && Capacitor.isNativePlatform()) {
      try {
        // Re-initialize RevenueCat to ensure fresh data
        await revenueCatManager.initialize(user?.id);
        console.log('RevenueCat re-initialized for force refresh');
        revenueCatInitialized.current = user.id; // Update ref
      } catch (error) {
        console.error('Failed to re-initialize RevenueCat during force refresh:', error);
      }
    }
    
    baseRefreshSubscription();
  }, [user, baseRefreshSubscription]);

  const tierId = resolveTierId(subscription?.price_id);
  const tierDef = TIER_DEFINITIONS[tierId];

  const value = useMemo(() => ({
    subscription,
    isLoading,
    refreshSubscription,
    forceRefreshSubscription,
    tierId,
    tierDef,
  }), [subscription, isLoading, refreshSubscription, forceRefreshSubscription, tierId, tierDef]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};
