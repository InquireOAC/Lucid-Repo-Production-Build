
import React, { createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionContextType {
  subscription: any;
  isLoading: boolean;
  refreshSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { subscription, isLoading, refreshSubscription } = useSubscription(user);

  const value = {
    subscription,
    isLoading,
    refreshSubscription
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
