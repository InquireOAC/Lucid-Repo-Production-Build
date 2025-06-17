
import React from "react";
import { Capacitor } from '@capacitor/core';
import NativeSubscriptionManager from "./NativeSubscriptionManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, AlertCircle } from "lucide-react";

interface SubscriptionManagerProps {
  currentPlan?: string;
}

const SubscriptionManager = ({ currentPlan }: SubscriptionManagerProps) => {
  // Always use native subscriptions for mobile, show info for web
  if (Capacitor.isNativePlatform()) {
    return <NativeSubscriptionManager currentPlan={currentPlan} />;
  }

  // For web users, show information about mobile app requirement
  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <Smartphone className="h-12 w-12 mx-auto text-dream-purple mb-4" />
        <h3 className="text-lg font-medium mb-2">Mobile App Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Subscriptions are only available through our mobile app via the App Store.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          To subscribe to premium features, please download our mobile app from the App Store. 
          All subscription management is handled through Apple's secure payment system.
        </AlertDescription>
      </Alert>

      <div className="bg-card/50 border rounded-lg p-4 space-y-4">
        <h4 className="font-medium">Available Plans:</h4>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Basic Plan</h5>
            <p className="text-sm text-muted-foreground">$4.99/month</p>
            <ul className="text-sm space-y-1">
              <li>• Unlimited Dream Analysis</li>
              <li>• 25 Dream Art Generations</li>
              <li>• Priority Support</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 space-y-2 border-dream-purple">
            <div className="flex justify-between items-start">
              <h5 className="font-medium">Premium Plan</h5>
              <span className="bg-dream-purple text-white text-xs py-1 px-2 rounded-full">
                Popular
              </span>
            </div>
            <p className="text-sm text-muted-foreground">$9.99/month</p>
            <ul className="text-sm space-y-1">
              <li>• Unlimited Dream Analysis</li>
              <li>• Unlimited Dream Art Generation</li>
              <li>• Priority Support</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Download the mobile app to access these premium features and manage your subscription.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionManager;
