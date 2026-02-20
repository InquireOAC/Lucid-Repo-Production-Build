
import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

const REALITY_CHECK_BASE_ID = 300;

export const useNotificationManager = () => {
  const initializeNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('Running on web, using browser notifications');
      return;
    }

    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.warn('Notification permission not granted');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const scheduleRealityCheckReminders = async () => {
    if (!Capacitor.isNativePlatform()) {
      scheduleWebNotifications();
      return;
    }

    try {
      // Cancel existing reality check notifications only
      const idsToCancel = Array.from({ length: 5 }, (_, i) => ({ id: REALITY_CHECK_BASE_ID + i }));
      await LocalNotifications.cancel({ notifications: idsToCancel });

      const now = new Date();
      const notifications = [];

      for (let i = 0; i < 5; i++) {
        const hour = 8 + Math.floor(Math.random() * 12);
        const minute = Math.floor(Math.random() * 60);

        const notificationTime = new Date(now);
        notificationTime.setHours(hour, minute, 0, 0);

        if (notificationTime <= now) {
          notificationTime.setDate(notificationTime.getDate() + 1);
        }

        notifications.push({
          id: REALITY_CHECK_BASE_ID + i,
          title: 'Reality Check! 👁️',
          body: 'Am I dreaming right now? Check your hands!',
          schedule: { at: notificationTime },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: { type: 'reality_check' }
        });
      }

      await LocalNotifications.schedule({ notifications });
      console.log('Reality check notifications scheduled (IDs:', REALITY_CHECK_BASE_ID, '-', REALITY_CHECK_BASE_ID + 4, ')');
    } catch (error) {
      console.error('Error scheduling reality check notifications:', error);
    }
  };

  const scheduleWebNotifications = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const scheduleNext = () => {
        const delay = (2 + Math.random() * 4) * 60 * 60 * 1000;
        setTimeout(() => {
          new Notification('Reality Check! 👁️', {
            body: 'Am I dreaming right now? Check your hands!',
            icon: '/favicon.ico'
          });
          scheduleNext();
        }, delay);
      };
      scheduleNext();
    }
  };

  const scheduleWBTBAlarm = async (wakeUpTime: Date) => {
    if (!Capacitor.isNativePlatform()) {
      const now = new Date();
      const delay = wakeUpTime.getTime() - now.getTime();
      if (delay > 0) {
        setTimeout(() => {
          new Notification('WBTB Wake Up! 🌙', {
            body: 'Time for your Wake-Back-to-Bed practice',
            icon: '/favicon.ico'
          });
        }, delay);
      }
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: Math.floor(Math.random() * 1000000),
          title: 'WBTB Wake Up! 🌙',
          body: 'Time for your Wake-Back-to-Bed practice',
          schedule: { at: wakeUpTime },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: { type: 'wbtb' }
        }]
      });
    } catch (error) {
      console.error('Error scheduling WBTB alarm:', error);
    }
  };

  const scheduleAchievementNotification = async (achievementName: string, icon: string) => {
    if (!Capacitor.isNativePlatform()) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Achievement Unlocked! 🏆', {
          body: `${icon} ${achievementName}`,
          icon: '/favicon.ico'
        });
      }
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: Math.floor(Date.now() / 1000),
          title: 'Achievement Unlocked! 🏆',
          body: `${icon} ${achievementName}`,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: { type: 'achievement' }
        }]
      });
    } catch (error) {
      console.error('Error scheduling achievement notification:', error);
    }
  };

  const requestWebNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      requestWebNotificationPermission();
    }
  }, []);

  return {
    initializeNotifications,
    scheduleRealityCheckReminders,
    scheduleWBTBAlarm,
    scheduleAchievementNotification,
    requestWebNotificationPermission
  };
};
