
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class PushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized = false;
  private currentToken: string | null = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(userId?: string): Promise<void> {
    if (this.isInitialized || !Capacitor.isPluginAvailable('PushNotifications')) {
      return;
    }

    try {
      // Request permission to use push notifications
      const permResult = await PushNotifications.requestPermissions();
      
      if (permResult.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();

        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration', async (token: Token) => {
          console.log('Push registration success, token: ' + token.value);
          this.currentToken = token.value;
          
          if (userId) {
            await this.saveDeviceToken(userId, token.value);
          }
        });

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration: ' + JSON.stringify(error));
          toast.error('Failed to register for push notifications');
        });

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push notification received: ', notification);
          // Show local notification when app is in foreground
          toast.success(notification.title || 'New notification', {
            description: notification.body
          });
        });

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
          // Handle notification tap - navigate to relevant screen
          this.handleNotificationTap(notification);
        });

        this.isInitialized = true;
      } else {
        console.log('Push notification permission denied');
        toast.error('Push notifications are disabled. You can enable them in your device settings.');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private async saveDeviceToken(userId: string, token: string): Promise<void> {
    try {
      const platform = Capacitor.getPlatform();
      
      // First, deactivate any existing tokens for this user
      await supabase
        .from('device_tokens')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Insert the new token
      const { error } = await supabase
        .from('device_tokens')
        .insert({
          user_id: userId,
          token,
          platform,
          is_active: true
        });

      if (error) {
        console.error('Error saving device token:', error);
      } else {
        console.log('Device token saved successfully');
      }
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  }

  private handleNotificationTap(notification: ActionPerformed): void {
    const data = notification.notification.data;
    
    // Navigate based on notification type
    if (data?.type === 'message') {
      // Navigate to messages/chat
      window.location.hash = '/profile';
    } else if (data?.type === 'comment') {
      // Navigate to the specific dream
      if (data?.dreamId) {
        window.location.hash = `/lucidrepo`;
      }
    } else if (data?.type === 'daily_reminder') {
      // Navigate to journal to add new dream
      window.location.hash = '/';
    }
  }

  async updateDeviceToken(userId: string): Promise<void> {
    if (this.currentToken) {
      await this.saveDeviceToken(userId, this.currentToken);
    }
  }

  async removeDeviceToken(userId: string): Promise<void> {
    try {
      await supabase
        .from('device_tokens')
        .update({ is_active: false })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error removing device token:', error);
    }
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
