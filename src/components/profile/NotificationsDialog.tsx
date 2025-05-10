
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Calendar } from "lucide-react";
import { 
  NotificationSettings, 
  setupMorningNotification, 
  cancelMorningNotifications,
  loadNotificationSettings,
  saveNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS
} from "@/utils/notificationUtils";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsDialog = ({ open, onOpenChange }: NotificationsDialogProps) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [timeDisplay, setTimeDisplay] = useState("8:00 AM");
  
  // Load saved settings on open
  useEffect(() => {
    if (open) {
      const savedSettings = loadNotificationSettings();
      setSettings(savedSettings);
      updateTimeDisplay(savedSettings.hour, savedSettings.minute);
    }
  }, [open]);
  
  const updateTimeDisplay = (hour: number, minute: number) => {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    setTimeDisplay(`${h}:${m} ${period}`);
  };

  const handleTimeSelect = () => {
    // Create input element
    const input = document.createElement('input');
    input.type = 'time';
    
    // Set current time
    const currentHour = settings.hour.toString().padStart(2, '0');
    const currentMinute = settings.minute.toString().padStart(2, '0');
    input.value = `${currentHour}:${currentMinute}`;
    
    // Handle time selection
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const [hours, minutes] = target.value.split(':').map(Number);
      
      setSettings(prev => ({
        ...prev,
        hour: hours,
        minute: minutes
      }));
      
      updateTimeDisplay(hours, minutes);
    };
    
    // Trigger click
    input.click();
  };
  
  const handleEnableChange = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, enabled }));
  };
  
  const handleSave = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        toast.error("Notifications are only available on mobile devices");
        return;
      }
      
      // Save settings to local storage
      saveNotificationSettings(settings);
      
      if (settings.enabled) {
        // Setup notification
        await setupMorningNotification(settings);
        toast.success("Morning notifications enabled");
      } else {
        // Cancel notifications
        await cancelMorningNotifications();
        toast.success("Morning notifications disabled");
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to save notification settings");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <span>Notification Settings</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Morning Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get a notification to record your dream
              </p>
            </div>
            <Switch 
              checked={settings.enabled}
              onCheckedChange={handleEnableChange}
            />
          </div>
          
          {settings.enabled && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <Label>Reminder Time</Label>
                <Button
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  onClick={handleTimeSelect}
                >
                  <span>{timeDisplay}</span>
                  <Calendar className="h-4 w-4 opacity-70" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  Choose when you want to be reminded to record your dreams
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
