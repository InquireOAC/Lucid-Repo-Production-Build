
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { supabase } from '@/integrations/supabase/client';

const NOTIFICATION_SETTINGS_KEY = 'dreamjournal_enhanced_notification_settings';

export interface EnhancedNotificationSettings {
  enabled: boolean;
  time: string;
  userId?: string;
}

export const DEFAULT_ENHANCED_NOTIFICATION_SETTINGS: EnhancedNotificationSettings = {
  enabled: false,
  time: "08:00"
};

export async function getEnhancedNotificationSettings(): Promise<EnhancedNotificationSettings> {
  try {
    const { value } = await Preferences.get({ key: NOTIFICATION_SETTINGS_KEY });
    return value ? JSON.parse(value) : DEFAULT_ENHANCED_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error('Error getting enhanced notification settings:', error);
    return DEFAULT_ENHANCED_NOTIFICATION_SETTINGS;
  }
}

export async function saveEnhancedNotificationSettings(settings: EnhancedNotificationSettings): Promise<void> {
  try {
    await Preferences.set({
      key: NOTIFICATION_SETTINGS_KEY,
      value: JSON.stringify(settings)
    });
    
    if (settings.enabled && settings.userId) {
      await scheduleEnhancedNotification(settings);
      // Also update database preferences
      await updateDatabaseNotificationSettings(settings.userId, settings);
    } else {
      await cancelAllEnhancedNotifications();
    }
  } catch (error) {
    console.error('Error saving enhanced notification settings:', error);
  }
}

async function updateDatabaseNotificationSettings(userId: string, settings: EnhancedNotificationSettings): Promise<void> {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        daily_reminder_enabled: settings.enabled,
        daily_reminder_time: `${settings.time}:00`,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating database notification settings:', error);
    }
  } catch (error) {
    console.error('Error updating database notification settings:', error);
  }
}

export async function scheduleEnhancedNotification(settings: EnhancedNotificationSettings): Promise<void> {
  await cancelAllEnhancedNotifications();
  
  if (!settings.enabled) return;
  
  try {
    const permissionStatus = await LocalNotifications.checkPermissions();
    
    if (permissionStatus.display !== 'granted') {
      const requestResult = await LocalNotifications.requestPermissions();
      if (requestResult.display !== 'granted') {
        console.log('Enhanced notification permission not granted');
        return;
      }
    }
    
    const [hours, minutes] = settings.time.split(':').map(Number);
    const currentDate = new Date();
    let notificationDate = new Date();
    notificationDate.setHours(hours, minutes, 0, 0);
    
    if (notificationDate <= currentDate) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: "Time to log your dream ✨",
          body: "Don't let those magical dream memories slip away!",
          schedule: {
            at: notificationDate,
            repeats: true,
            every: 'day'
          },
          sound: 'default',
          actionTypeId: 'OPEN_DREAM_JOURNAL',
          extra: {
            type: 'daily_reminder'
          }
        }
      ]
    });
    
    console.log('Enhanced notification scheduled for:', notificationDate);
  } catch (error) {
    console.error('Error scheduling enhanced notification:', error);
  }
}

export async function cancelAllEnhancedNotifications(): Promise<void> {
  try {
    const pendingNotifications = await LocalNotifications.getPending();
    
    if (pendingNotifications.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pendingNotifications.notifications });
    }
  } catch (error) {
    console.error('Error canceling enhanced notifications:', error);
  }
}

export async function initializeEnhancedNotifications(userId?: string): Promise<void> {
  try {
    const settings = await getEnhancedNotificationSettings();
    
    if (settings.enabled && userId) {
      settings.userId = userId;
      await scheduleEnhancedNotification(settings);
    }
  } catch (error) {
    console.error('Error initializing enhanced notifications:', error);
  }
}
