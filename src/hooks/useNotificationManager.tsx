import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

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
        return;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const scheduleRealityCheckReminders = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback - use browser notifications
      scheduleWebNotifications();
      return;
    }

    try {
      // Cancel existing notifications
      await LocalNotifications.cancel({
        notifications: [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
          { id: 5 }
        ]
      });

      const now = new Date();
      const notifications = [];

      // Schedule 5 random notifications throughout the day
      for (let i = 0; i < 5; i++) {
        const hour = 8 + Math.floor(Math.random() * 12); // Between 8 AM and 8 PM
        const minute = Math.floor(Math.random() * 60);
        
        const notificationTime = new Date(now);
        notificationTime.setHours(hour, minute, 0, 0);
        
        // If the time has passed today, schedule for tomorrow
        if (notificationTime <= now) {
          notificationTime.setDate(notificationTime.getDate() + 1);
        }

        notifications.push({
          id: i + 1,
          title: 'Reality Check! 👁️',
          body: 'Am I dreaming right now? Check your hands!',
          schedule: { at: notificationTime },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null
        });
      }

      await LocalNotifications.schedule({
        notifications
      });

      console.log('Reality check notifications scheduled');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const scheduleWebNotifications = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Schedule web notifications using setTimeout
      const scheduleNext = () => {
        const delay = (2 + Math.random() * 4) * 60 * 60 * 1000; // 2-6 hours
        setTimeout(() => {
          new Notification('Reality Check! 👁️', {
            body: 'Am I dreaming right now? Check your hands!',
            icon: '/favicon.ico'
          });
          scheduleNext(); // Schedule the next one
        }, delay);
      };
      scheduleNext();
    }
  };

  const scheduleWBTBAlarm = async (wakeUpTime: Date) => {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback
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
          extra: null
        }]
      });
    } catch (error) {
      console.error('Error scheduling WBTB alarm:', error);
    }
  };

  const scheduleAchievementNotification = async (achievementName: string, icon: string) => {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback
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
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second delay
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null
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
      // Request web notification permission
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