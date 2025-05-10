
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  NotificationSettings, 
  DEFAULT_NOTIFICATION_SETTINGS, 
  setupMorningNotification, 
  saveNotificationSettings,
  loadNotificationSettings 
} from "@/utils/notificationUtils";
import { Capacitor } from "@capacitor/core";

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsDialog = ({ open, onOpenChange }: NotificationsDialogProps) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    const savedSettings = loadNotificationSettings();
    setSettings(savedSettings);
  }, [open]);

  const handleToggleNotifications = (enabled: boolean) => {
    setSettings((prev) => ({ ...prev, enabled }));
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLSelectElement>, type: 'hour' | 'minute') => {
    const value = parseInt(event.target.value, 10);
    setSettings((prev) => ({ ...prev, [type]: value }));
  };

  const handleSave = async () => {
    try {
      saveNotificationSettings(settings);
      
      if (isNative) {
        await setupMorningNotification(settings);
        if (settings.enabled) {
          toast.success("Morning notifications enabled");
        } else {
          toast.success("Morning notifications disabled");
        }
      } else {
        // In web browser we just save the settings
        if (settings.enabled) {
          toast.info("Notifications will be shown when using the mobile app");
        }
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to save notification settings");
    }
  };

  // Generate hour options (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => (
    <option key={i} value={i}>
      {i.toString().padStart(2, '0')}
    </option>
  ));

  // Generate minute options (0-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => (
    <option key={i} value={i}>
      {i.toString().padStart(2, '0')}
    </option>
  ));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            Configure your morning dream journal reminders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="flex flex-col gap-1">
              <span>Enable daily reminders</span>
              <span className="text-sm text-muted-foreground">
                Receive a notification to record your dreams
              </span>
            </Label>
            <Switch
              id="notifications"
              checked={settings.enabled}
              onCheckedChange={handleToggleNotifications}
            />
          </div>

          {settings.enabled && (
            <div className="space-y-4">
              <Label className="block">
                Reminder time
                <div className="flex items-center space-x-2 mt-2">
                  <select
                    value={settings.hour}
                    onChange={(e) => handleTimeChange(e, 'hour')}
                    className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {hourOptions}
                  </select>
                  <span>:</span>
                  <select
                    value={settings.minute}
                    onChange={(e) => handleTimeChange(e, 'minute')}
                    className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {minuteOptions}
                  </select>
                </div>
              </Label>

              {!isNative && (
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                  <div className="flex">
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      Notifications will only be delivered when using the mobile app.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
