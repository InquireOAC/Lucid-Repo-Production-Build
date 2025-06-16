
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, MessageCircle, MessageSquare, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

const NotificationSettings = () => {
  const { user } = useAuth();
  const { preferences, loading, updatePreferences } = useNotificationPreferences(user?.id);

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleTimeChange = (time: string) => {
    updatePreferences({ daily_reminder_time: time });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading notification settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Daily Dream Reminder
          </CardTitle>
          <CardDescription>
            Get a gentle reminder to log your dreams at your preferred time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-reminder">Enable daily reminders</Label>
            <Switch
              id="daily-reminder"
              checked={preferences.daily_reminder_enabled}
              onCheckedChange={(checked) => handleToggle('daily_reminder_enabled', checked)}
            />
          </div>
          
          {preferences.daily_reminder_enabled && (
            <div className="space-y-2">
              <Label htmlFor="reminder-time">Reminder time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={preferences.daily_reminder_time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Message Notifications
          </CardTitle>
          <CardDescription>
            Get notified when you receive new messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="message-notifications">Enable message notifications</Label>
            <Switch
              id="message-notifications"
              checked={preferences.message_notifications_enabled}
              onCheckedChange={(checked) => handleToggle('message_notifications_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comment Notifications
          </CardTitle>
          <CardDescription>
            Get notified when someone comments on your dreams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="comment-notifications">Enable comment notifications</Label>
            <Switch
              id="comment-notifications"
              checked={preferences.comment_notifications_enabled}
              onCheckedChange={(checked) => handleToggle('comment_notifications_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
