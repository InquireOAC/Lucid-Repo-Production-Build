
import { LocalNotifications } from '@capacitor/local-notifications';

export interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  hour: 8, // 8:00 AM default
  minute: 0,
};

export const setupMorningNotification = async (settings: NotificationSettings): Promise<void> => {
  try {
    // Request permission first
    const permissionStatus = await LocalNotifications.requestPermissions();

    if (permissionStatus.display !== 'granted') {
      console.error('Notification permission not granted');
      return;
    }

    // Cancel any existing notifications with this ID
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

    if (!settings.enabled) {
      console.log('Morning notifications disabled');
      return;
    }

    // Calculate when the notification should fire next
    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      settings.hour,
      settings.minute
    );

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Schedule the notification to repeat daily
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: 'Dream Journal Reminder',
          body: 'Remember to record your dream from last night!',
          schedule: {
            at: scheduledTime,
            repeats: true,
            every: 'day',
          },
          actionTypeId: 'OPEN_APP',
        },
      ],
    });

    console.log('Morning notification scheduled for', scheduledTime);
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
};

export const cancelMorningNotifications = async (): Promise<void> => {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
    console.log('Morning notifications canceled');
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  localStorage.setItem('notificationSettings', JSON.stringify(settings));
};

export const loadNotificationSettings = (): NotificationSettings => {
  const savedSettings = localStorage.getItem('notificationSettings');
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
};
