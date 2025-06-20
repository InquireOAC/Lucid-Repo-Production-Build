
import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { revenueCatManager } from '@/utils/revenueCatManager';

interface SubscriptionContextType {
  subscription: any;
  isLoading: boolean;
  refreshSubscription: () => void;
  forceRefreshSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { subscription, isLoading, refreshSubscription: baseRefreshSubscription } = useSubscription(user);

  // Initialize RevenueCat when user is available
  useEffect(() => {
    if (user) {
      initializeRevenueCat();
    }
  }, [user]);

  const initializeRevenueCat = async () => {
    try {
      console.log('Initializing RevenueCat for SubscriptionContext...');
      await revenueCatManager.initialize(user?.id);
      console.log('RevenueCat initialized successfully in SubscriptionContext');
      
      // Immediately check for subscription updates after initialization
      setTimeout(() => {
        console.log('Checking for subscription updates after RevenueCat initialization...');
        baseRefreshSubscription();
      }, 1000);
      
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
    
    if (user) {
      try {
        // Re-initialize RevenueCat to ensure fresh data
        await revenueCatManager.initialize(user?.id);
        console.log('RevenueCat re-initialized for force refresh');
      } catch (error) {
        console.error('Failed to re-initialize RevenueCat during force refresh:', error);
      }
    }
    
    // Wait a moment then refresh
    setTimeout(() => {
      baseRefreshSubscription();
    }, 500);
  }, [user, baseRefreshSubscription]);

  const value = {
    subscription,
    isLoading,
    refreshSubscription,
    forceRefreshSubscription
  };

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
