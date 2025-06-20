
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';

interface SubscriptionContextType {
  subscription: any;
  isLoading: boolean;
  refreshSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { subscription, isLoading, refreshSubscription } = useSubscription(user);

  // Initialize RevenueCat when user is available
  useEffect(() => {
    if (user && Capacitor.isNativePlatform()) {
      initializeRevenueCat();
    }
  }, [user]);

  const initializeRevenueCat = async () => {
    try {
      console.log('Initializing RevenueCat for SubscriptionContext...');
      await Purchases.configure({
        apiKey: 'appl_QNsyVEgaltTbxopyYGyhXeGOUQk',
        appUserID: user?.id || undefined
      });
      console.log('RevenueCat initialized successfully in SubscriptionContext');
    } catch (error) {
      console.error('Failed to initialize RevenueCat in SubscriptionContext:', error);
    }
  };

  const value = {
    subscription,
    isLoading,
    refreshSubscription: () => {
      console.log('Refreshing subscription from context...');
      refreshSubscription();
    }
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
