
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationPreferences {
  daily_reminder_enabled: boolean;
  daily_reminder_time: string;
  message_notifications_enabled: boolean;
  comment_notifications_enabled: boolean;
}

export const useNotificationPreferences = (userId?: string) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    daily_reminder_enabled: true,
    daily_reminder_time: '08:00',
    message_notifications_enabled: true,
    comment_notifications_enabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          daily_reminder_enabled: data.daily_reminder_enabled,
          daily_reminder_time: data.daily_reminder_time,
          message_notifications_enabled: data.message_notifications_enabled,
          comment_notifications_enabled: data.comment_notifications_enabled,
        });
      } else {
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: userId,
          daily_reminder_enabled: true,
          daily_reminder_time: '08:00:00',
          message_notifications_enabled: true,
          comment_notifications_enabled: true,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPreferences({
          daily_reminder_enabled: data.daily_reminder_enabled,
          daily_reminder_time: data.daily_reminder_time,
          message_notifications_enabled: data.message_notifications_enabled,
          comment_notifications_enabled: data.comment_notifications_enabled,
        });
      }
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      setLoading(true);
      
      // Convert time format if needed
      const timeValue = newPreferences.daily_reminder_time 
        ? `${newPreferences.daily_reminder_time}:00`
        : undefined;

      const updateData = {
        ...newPreferences,
        ...(timeValue && { daily_reminder_time: timeValue }),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('notification_preferences')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;

      setPreferences(prev => ({
        ...prev,
        ...newPreferences,
      }));

      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences,
  };
};
