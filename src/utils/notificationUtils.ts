
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

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
    
    // For iOS, schedule a single notification without repeats to avoid multiple notifications
    // We'll reschedule after the notification is delivered
    const isIOS = Capacitor.getPlatform() === 'ios';
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: 'Dream Journal Reminder',
          body: 'Remember to log your dream from last night!',
          schedule: {
            at: notificationDate,
            repeats: !isIOS, // Only repeat on non-iOS platforms
            every: isIOS ? undefined : 'day',
            allowWhileIdle: true
          },
          sound: 'default',
          actionTypeId: 'OPEN_APP',
          autoCancel: true,
          ongoing: false,
          extra: {
            scheduledFor: notificationDate.toISOString(),
            isRecurring: true
          }
        }
      ]
    });
    
    console.log('Notification scheduled for:', notificationDate.toLocaleString());
    console.log('Platform:', Capacitor.getPlatform());
    console.log('Repeats enabled:', !isIOS);
    
    // Set up listener for iOS to reschedule after notification is delivered
    if (isIOS) {
      setupNotificationListener();
    }
    
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
    console.error('Error scheduling notification:', error);
  }
}

// Set up notification listener for iOS to reschedule after delivery
function setupNotificationListener() {
  // Remove any existing listeners first
  LocalNotifications.removeAllListeners();
  
  // Listen for notification actions (when user taps notification)
  LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
    console.log('Notification action performed:', notification);
    if (notification.notification.extra?.isRecurring) {
      await rescheduleForNextDay();
    }
  });
  
  // Listen for notification received (when notification is delivered)
  LocalNotifications.addListener('localNotificationReceived', async (notification) => {
    console.log('Notification received:', notification);
    if (notification.extra?.isRecurring) {
      // Wait a bit to ensure the notification is fully processed
      setTimeout(() => {
        rescheduleForNextDay();
      }, 1000);
    }
  });
}

// Reschedule notification for the next day (iOS only)
async function rescheduleForNextDay() {
  try {
    const settings = await getNotificationSettings();
    if (settings.enabled) {
      console.log('Rescheduling notification for next day');
      
      // Parse the time
      const [hours, minutes] = settings.time.split(':').map(Number);
      
      // Schedule for tomorrow at the same time
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      tomorrowDate.setHours(hours, minutes, 0, 0);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 1,
            title: 'Dream Journal Reminder',
            body: 'Remember to log your dream from last night!',
            schedule: {
              at: tomorrowDate,
              allowWhileIdle: true
            },
            sound: 'default',
            actionTypeId: 'OPEN_APP',
            autoCancel: true,
            ongoing: false,
            extra: {
              scheduledFor: tomorrowDate.toISOString(),
              isRecurring: true
            }
          }
        ]
      });
      
      console.log('Notification rescheduled for:', tomorrowDate.toLocaleString());
    }
  } catch (error) {
    console.error('Error rescheduling notification:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    // Remove listeners first
    LocalNotifications.removeAllListeners();
    
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
