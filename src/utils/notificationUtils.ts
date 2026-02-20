
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const NOTIFICATION_SETTINGS_KEY = 'dreamjournal_notification_settings';

const MORNING_REMINDER_ID = 100;

export interface NotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM"
  message: string; // custom notification body
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  time: "08:00",
  message: "Remember to log your dream from last night!"
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const { value } = await Preferences.get({ key: NOTIFICATION_SETTINGS_KEY });
    if (value) {
      const parsed = JSON.parse(value);
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...parsed,
        message: parsed.message || DEFAULT_NOTIFICATION_SETTINGS.message
      };
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await Preferences.set({
      key: NOTIFICATION_SETTINGS_KEY,
      value: JSON.stringify(settings)
    });

    if (!Capacitor.isNativePlatform()) {
      console.log('Web platform: skipping native notification scheduling');
      return;
    }

    if (settings.enabled) {
      await scheduleMorningReminder(settings);
    } else {
      await cancelMorningReminder();
    }
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

export async function scheduleMorningReminder(settings: NotificationSettings): Promise<void> {
  await cancelMorningReminder();

  if (!settings.enabled) return;
  if (!Capacitor.isNativePlatform()) return;

  try {
    const permissionStatus = await LocalNotifications.checkPermissions();
    if (permissionStatus.display !== 'granted') {
      const requestResult = await LocalNotifications.requestPermissions();
      if (requestResult.display !== 'granted') {
        console.log('Notification permission not granted');
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

    const isIOS = Capacitor.getPlatform() === 'ios';

    await LocalNotifications.schedule({
      notifications: [
        {
          id: MORNING_REMINDER_ID,
          title: 'Dream Journal Reminder',
          body: settings.message || DEFAULT_NOTIFICATION_SETTINGS.message,
          schedule: {
            at: notificationDate,
            repeats: !isIOS,
            every: isIOS ? undefined : 'day',
            allowWhileIdle: true
          },
          sound: 'default',
          actionTypeId: 'OPEN_APP',
          autoCancel: true,
          ongoing: false,
          extra: {
            scheduledFor: notificationDate.toISOString(),
            isRecurring: true,
            type: 'morning_reminder'
          }
        }
      ]
    });

    console.log('Morning reminder scheduled for:', notificationDate.toLocaleString());

    if (isIOS) {
      setupMorningReminderListener();
    }
  } catch (error) {
    console.error('Error scheduling morning reminder:', error);
  }
}

function setupMorningReminderListener() {
  LocalNotifications.addListener('localNotificationActionPerformed', async (notification) => {
    if (notification.notification.extra?.type === 'morning_reminder') {
      await rescheduleForNextDay();
    }
  });

  LocalNotifications.addListener('localNotificationReceived', async (notification) => {
    if (notification.extra?.type === 'morning_reminder') {
      setTimeout(() => rescheduleForNextDay(), 1000);
    }
  });
}

async function rescheduleForNextDay() {
  try {
    const settings = await getNotificationSettings();
    if (!settings.enabled) return;

    const [hours, minutes] = settings.time.split(':').map(Number);
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDate.setHours(hours, minutes, 0, 0);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: MORNING_REMINDER_ID,
          title: 'Dream Journal Reminder',
          body: settings.message || DEFAULT_NOTIFICATION_SETTINGS.message,
          schedule: { at: tomorrowDate, allowWhileIdle: true },
          sound: 'default',
          actionTypeId: 'OPEN_APP',
          autoCancel: true,
          ongoing: false,
          extra: {
            scheduledFor: tomorrowDate.toISOString(),
            isRecurring: true,
            type: 'morning_reminder'
          }
        }
      ]
    });
    console.log('Morning reminder rescheduled for:', tomorrowDate.toLocaleString());
  } catch (error) {
    console.error('Error rescheduling morning reminder:', error);
  }
}

export async function cancelMorningReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: MORNING_REMINDER_ID }] });
    console.log('Morning reminder cancelled (ID:', MORNING_REMINDER_ID, ')');
  } catch (error) {
    console.error('Error canceling morning reminder:', error);
  }
}

// Legacy alias
export const cancelAllNotifications = cancelMorningReminder;
export const scheduleNotification = scheduleMorningReminder;

export async function initializeNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const settings = await getNotificationSettings();
    if (settings.enabled) {
      await scheduleMorningReminder(settings);
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}
