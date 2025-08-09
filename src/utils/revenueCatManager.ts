
import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

class RevenueCatManager {
  private isConfigured = false;
  private currentUserId: string | null = null;
  private apiKey: string | null = null;

  async initialize(userId?: string) {
    if (!Capacitor.isNativePlatform()) {
      console.log('RevenueCat: Not on native platform, skipping initialization');
      return;
    }

    try {
      // Only configure once per app session to prevent transfers
      if (!this.isConfigured) {
        console.log('RevenueCat: Initial configuration with user:', userId || 'anonymous');
        
        // Get API key from server if not already fetched
        if (!this.apiKey) {
          await this.fetchApiKey();
        }
        
        if (!this.apiKey) {
          throw new Error('Failed to retrieve RevenueCat API key');
        }
        
        await Purchases.configure({
          apiKey: this.apiKey,
          appUserID: userId || undefined
        });
        this.isConfigured = true;
        this.currentUserId = userId || null;
        console.log('RevenueCat: Successfully configured');
      } else if (userId && userId !== this.currentUserId) {
        // CRITICAL: Never use logIn() as it transfers purchases
        // Instead, warn and maintain the original user to prevent transfers
        console.warn('RevenueCat: Attempt to switch user detected. This would transfer purchases.');
        console.warn('RevenueCat: Keeping original user:', this.currentUserId, 'Ignoring new user:', userId);
        console.warn('RevenueCat: To prevent purchase transfers, user must restart the app to switch accounts.');
        
        // Don't update currentUserId to maintain the original user
        // This prevents any accidental purchase transfers
      }
    } catch (error) {
      console.error('RevenueCat: Configuration failed:', error);
      throw error;
    }
  }

  async getCustomerInfo() {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }
    return await Purchases.getCustomerInfo();
  }

  async getOfferings() {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }
    return await Purchases.getOfferings();
  }

  async purchasePackage(packageToPurchase: any) {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }
    return await Purchases.purchasePackage(packageToPurchase);
  }

  async restorePurchases() {
    if (!this.isConfigured) {
      throw new Error('RevenueCat not configured');
    }
    return await Purchases.restorePurchases();
  }

  private async fetchApiKey() {
    try {
      const { data, error } = await supabase.functions.invoke('get-revenuecat-key');
      
      if (error) {
        console.error('RevenueCat: Error fetching API key:', error);
        throw error;
      }
      
      if (!data?.apiKey) {
        throw new Error('RevenueCat API key not found in response');
      }
      
      this.apiKey = data.apiKey;
      console.log('RevenueCat: API key fetched successfully');
    } catch (error) {
      console.error('RevenueCat: Failed to fetch API key:', error);
      throw error;
    }
  }

  getCurrentUserId() {
    return this.currentUserId;
  }

  isInitialized() {
    return this.isConfigured;
  }

  // Method to reset the manager (only for app restart scenarios)
  reset() {
    this.isConfigured = false;
    this.currentUserId = null;
    this.apiKey = null; // Clear the cached API key
    console.log('RevenueCat: Manager reset - requires app restart to switch users safely');
  }
}

export const revenueCatManager = new RevenueCatManager();
