
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getNotificationSettings, saveNotificationSettings, NotificationSettings } from "@/utils/notificationUtils";
import { toast } from "sonner";

interface NotificationsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsDialog = ({ isOpen, onOpenChange }: NotificationsDialogProps) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    time: "08:00"
  });
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);
  
  const loadSettings = async () => {
    try {
      const savedSettings = await getNotificationSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };
  
  const handleToggle = (checked: boolean) => {
    setSettings(prev => ({ ...prev, enabled: checked }));
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, time: e.target.value }));
  };
  
  const handleSave = async () => {
    setLoading(true);
    try {
      await saveNotificationSettings(settings);
      toast.success("Notification settings saved");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to save notification settings");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="gradient-text">Notification Settings</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-toggle" className="text-base">Morning Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified to log your dream each morning
              </p>
            </div>
            <Switch 
              id="notifications-toggle"
              checked={settings.enabled} 
              onCheckedChange={handleToggle}
            />
          </div>
          
          {settings.enabled && (
            <div className="space-y-2">
              <Label htmlFor="notification-time">Reminder Time</Label>
              <Input 
                id="notification-time"
                type="time" 
                value={settings.time} 
                onChange={handleTimeChange}
                className="w-full"
              />
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 flex items-start gap-3">
            <Info size={18} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-300">
              You may need to grant notification permissions to the app when prompted.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
