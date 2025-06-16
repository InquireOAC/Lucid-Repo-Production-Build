
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Info, Loader2, MessageCircle, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { pushNotificationService } from "@/services/pushNotificationService";
import {
  getEnhancedNotificationSettings,
  saveEnhancedNotificationSettings,
  EnhancedNotificationSettings,
} from "@/utils/enhancedNotificationUtils";

interface EnhancedNotificationsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnhancedNotificationsDialog = ({ isOpen, onOpenChange }: EnhancedNotificationsDialogProps) => {
  const { user } = useAuth();
  const { preferences, loading: prefsLoading, updatePreferences } = useNotificationPreferences(user?.id);
  
  const [localSettings, setLocalSettings] = useState<EnhancedNotificationSettings>({
    enabled: false,
    time: "08:00",
  });
  const [loading, setLoading] = useState(false);
  const [pushInitialized, setPushInitialized] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadSettings();
      initializePushNotifications();
    }
  }, [isOpen, user]);

  const loadSettings = async () => {
    try {
      const settings = await getEnhancedNotificationSettings();
      setLocalSettings({
        ...settings,
        userId: user?.id,
        time: preferences.daily_reminder_time || settings.time,
        enabled: preferences.daily_reminder_enabled && settings.enabled,
      });
    } catch (error) {
      toast({
        title: "Failed to load settings",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const initializePushNotifications = async () => {
    if (!user || pushInitialized) return;
    
    try {
      await pushNotificationService.initialize(user.id);
      setPushInitialized(true);
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      toast({
        title: "Push notification setup failed",
        description: "Some features may not work properly.",
        variant: "destructive"
      });
    }
  };

  const handleDailyReminderToggle = (enabled: boolean) => {
    setLocalSettings(prev => ({ ...prev, enabled }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSettings(prev => ({ ...prev, time: e.target.value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Save local notification settings
      await saveEnhancedNotificationSettings({
        ...localSettings,
        userId: user.id
      });

      // Update database preferences for push notifications
      await updatePreferences({
        daily_reminder_enabled: localSettings.enabled,
        daily_reminder_time: localSettings.time,
      });

      toast({ 
        title: "Settings saved successfully!",
        description: "Your notification preferences have been updated.",
        variant: "default" 
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePushToggle = async (type: 'message_notifications_enabled' | 'comment_notifications_enabled', enabled: boolean) => {
    try {
      await updatePreferences({ [type]: enabled });
      
      if (enabled && !pushInitialized) {
        await initializePushNotifications();
      }
    } catch (error) {
      toast({
        title: "Failed to update setting",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2">
            <Bell className="w-5 h-5" /> Enhanced Notification Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-3">
          {/* Daily Reminder Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="daily-reminder-toggle" className="text-base font-medium">
                  Daily Dream Reminder
                </Label>
                <p className="text-xs text-muted-foreground">
                  Local notification to remind you to log your dreams
                </p>
              </div>
              <Switch
                id="daily-reminder-toggle"
                checked={localSettings.enabled}
                onCheckedChange={handleDailyReminderToggle}
                disabled={loading || prefsLoading}
              />
            </div>
            
            {localSettings.enabled && (
              <div className="space-y-1 ml-4">
                <Label htmlFor="reminder-time" className="text-sm font-medium">
                  Reminder Time
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={localSettings.time}
                  onChange={handleTimeChange}
                  className="w-full"
                  disabled={loading || prefsLoading}
                />
              </div>
            )}
          </div>

          {/* Push Notification Section */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Push Notifications</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  New Messages
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when you receive new messages
                </p>
              </div>
              <Switch
                checked={preferences.message_notifications_enabled}
                onCheckedChange={(checked) => handlePushToggle('message_notifications_enabled', checked)}
                disabled={loading || prefsLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Dream Comments
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when someone comments on your dreams
                </p>
              </div>
              <Switch
                checked={preferences.comment_notifications_enabled}
                onCheckedChange={(checked) => handlePushToggle('comment_notifications_enabled', checked)}
                disabled={loading || prefsLoading}
              />
            </div>
          </div>

          <div className="flex gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 items-center">
            <Info className="text-blue-600 dark:text-blue-400 w-5 h-5 shrink-0" />
            <span className="text-xs text-blue-800 dark:text-blue-300">
              You may need to grant notification permissions when prompted. Push notifications require an internet connection.
            </span>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={loading || prefsLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || prefsLoading}
          >
            {loading || prefsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedNotificationsDialog;
