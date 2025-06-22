
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';

// Key for storing notification settings
const NOTIFICATION_SETTINGS_KEY = 'dreamjournal_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM"
}

// Default notification settings
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  time: "08:00"
};

// Get notification settings from storage
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const { value } = await Preferences.get({ key: NOTIFICATION_SETTINGS_KEY });
    return value ? JSON.parse(value) : DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

// Save notification settings to storage
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await Preferences.set({
      key: NOTIFICATION_SETTINGS_KEY,
      value: JSON.stringify(settings)
    });
    
    if (settings.enabled) {
      await scheduleNotification(settings);
    } else {
      await cancelAllNotifications();
    }
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

// Schedule the dream reminder notification
export async function scheduleNotification(settings: NotificationSettings): Promise<void> {
  // First cancel any existing notifications
  await cancelAllNotifications();
  
  if (!settings.enabled) return;
  
  try {
    // Check permission first
    const permissionStatus = await LocalNotifications.checkPermissions();
    
    if (permissionStatus.display !== 'granted') {
      const requestResult = await LocalNotifications.requestPermissions();
      if (requestResult.display !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }
    }
    
    // Parse the time
    const [hours, minutes] = settings.time.split(':').map(Number);
    
    // Create a Date object for today with the specified time
    const currentDate = new Date();
    let notificationDate = new Date();
    notificationDate.setHours(hours, minutes, 0, 0);
    
    // If the time is already past for today, schedule for tomorrow
    if (notificationDate <= currentDate) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }
    
    // Schedule a single daily notification with iOS-optimized configuration
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: 'Dream Journal Reminder',
          body: 'Remember to log your dream from last night!',
          schedule: {
            at: notificationDate,
            repeats: true,
            every: 'day',
            // iOS specific: ensure proper daily scheduling
            allowWhileIdle: true
          },
          sound: 'default',
          actionTypeId: 'OPEN_APP',
          // iOS specific: prevent notification stacking
          autoCancel: true,
          ongoing: false,
          // iOS specific: add thread identifier to group notifications
          threadId: 'dream-reminder',
          // iOS specific: set category for proper handling
          attachments: [],
          extra: {
            scheduledFor: notificationDate.toISOString()
          }
        }
      ]
    });
    
    console.log('iOS notification scheduled for:', notificationDate.toLocaleString());
    console.log('Notification will repeat daily at:', settings.time);
    
    // Verify the notification was scheduled correctly
    const pending = await LocalNotifications.getPending();
    console.log('Pending notifications count:', pending.notifications.length);
    pending.notifications.forEach(notification => {
      console.log('Scheduled notification:', {
        id: notification.id,
        title: notification.title,
        schedule: notification.schedule
      });
    });
    
  } catch (error) {
    console.error('Error scheduling iOS notification:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    // Get all pending notifications
    const pendingNotifications = await LocalNotifications.getPending();
    console.log('Canceling pending notifications:', pendingNotifications.notifications.length);
    
    // Cancel all pending notifications
    if (pendingNotifications.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pendingNotifications.notifications });
    }
    
    // Clear any delivered notifications from notification center
    await LocalNotifications.removeAllDeliveredNotifications();
    
    // Verify cancellation
    const remainingNotifications = await LocalNotifications.getPending();
    console.log('Remaining notifications after cancellation:', remainingNotifications.notifications.length);
    
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

// Initialize notifications on app startup
export async function initializeNotifications(): Promise<void> {
  try {
    const settings = await getNotificationSettings();
    
    if (settings.enabled) {
      // Always reschedule on app startup to ensure correct timing
      await scheduleNotification(settings);
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}
