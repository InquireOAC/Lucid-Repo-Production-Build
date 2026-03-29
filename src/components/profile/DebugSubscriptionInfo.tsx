
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { revenueCatManager } from '@/utils/revenueCatManager';

export const DebugSubscriptionInfo = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkRevenueCatDebug = async () => {
    if (!Capacitor.isNativePlatform()) {
      setDebugInfo({ error: 'Not on native platform' });
      return;
    }

    setIsLoading(true);
    try {
      // Use the already-initialized SDK instance instead of re-configuring with hardcoded key
      if (!revenueCatManager.isInitialized()) {
        await revenueCatManager.initialize(user?.id);
      }

      const result = await revenueCatManager.getCustomerInfo();
      const customerInfo = result.customerInfo;

      // Also check Supabase for this user
      const { data: supabaseSubscriptions } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('user_id', user?.id);

      setDebugInfo({
        revenueCat: {
          originalAppUserId: customerInfo.originalAppUserId,
          originalPurchaseDate: customerInfo.originalPurchaseDate,
          activeEntitlements: Object.keys(customerInfo.entitlements.active),
          allEntitlements: Object.keys(customerInfo.entitlements.all),
          entitlementDetails: customerInfo.entitlements.active
        },
        supabase: {
          subscriptions: supabaseSubscriptions,
          userIdUsed: user?.id
        },
        user: {
          id: user?.id,
          email: user?.email
        }
      });
    } catch (error: any) {
      setDebugInfo({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!Capacitor.isNativePlatform()) {
    return (
      <Card className="p-4 mt-4">
        <p className="text-sm text-muted-foreground">
          Debug info only available on mobile devices
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mt-4">
      <div className="space-y-4">
        <Button 
          onClick={checkRevenueCatDebug} 
          disabled={isLoading}
          size="sm"
          variant="outline"
        >
          {isLoading ? 'Checking...' : 'Debug Subscription Info'}
        </Button>
        
        {debugInfo && (
          <div className="space-y-2">
            <div className="text-xs">
              <strong>Debug Information:</strong>
            </div>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};
