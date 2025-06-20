
import { Purchases } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

class RevenueCatManager {
  private isConfigured = false;
  private currentUserId: string | null = null;

  async initialize(userId?: string) {
    if (!Capacitor.isNativePlatform()) {
      console.log('RevenueCat: Not on native platform, skipping initialization');
      return;
    }

    try {
      if (!this.isConfigured) {
        console.log('RevenueCat: Initial configuration with user:', userId || 'anonymous');
        await Purchases.configure({
          apiKey: 'appl_QNsyVEgaltTbxopyYGyhXeGOUQk',
          appUserID: userId || undefined
        });
        this.isConfigured = true;
        this.currentUserId = userId || null;
        console.log('RevenueCat: Successfully configured');
      } else if (userId && userId !== this.currentUserId) {
        // Use logIn instead of reconfiguring to avoid transfers
        console.log('RevenueCat: Logging in user:', userId, 'from:', this.currentUserId);
        await Purchases.logIn({ appUserID: userId });
        this.currentUserId = userId;
        console.log('RevenueCat: Successfully logged in user');
      }
    } catch (error) {
      console.error('RevenueCat: Configuration/login failed:', error);
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

  getCurrentUserId() {
    return this.currentUserId;
  }

  isInitialized() {
    return this.isConfigured;
  }
}

export const revenueCatManager = new RevenueCatManager();
