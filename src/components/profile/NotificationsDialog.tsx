
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Info, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getNotificationSettings,
  saveNotificationSettings,
  NotificationSettings,
} from "@/utils/notificationUtils";

interface NotificationsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  time: "08:00",
};

const NotificationsDialog = ({ isOpen, onOpenChange }: NotificationsDialogProps) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(false);

  // Load settings every time dialog is opened
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getNotificationSettings()
        .then((saved) => setSettings(saved))
        .catch(() => {
          toast({
            title: "Failed to load notification settings.",
            description: "Please try again.",
            variant: "destructive"
          });
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Handlers
  const onToggle = (enabled: boolean) => setSettings((prev) => ({ ...prev, enabled }));
  const onTimeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((prev) => ({ ...prev, time: e.target.value }));

  // Save settings and schedule notification if enabled
  const onSave = async () => {
    setLoading(true);
    try {
      await saveNotificationSettings(settings);
      toast({ title: "Notification settings saved!", variant: "default" });
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Failed to save.",
        description: e?.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notification Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-3">
          <div className="flex items-center justify-between">
            <span>
              <Label htmlFor="notifications-toggle" className="text-base font-medium">Morning Reminder</Label>
              <p className="text-xs text-muted-foreground">Wake up gently with a dream journaling nudge</p>
            </span>
            <Switch
              id="notifications-toggle"
              checked={settings.enabled}
              onCheckedChange={onToggle}
              disabled={loading}
            />
          </div>
          {settings.enabled && (
            <div className="space-y-1">
              <Label htmlFor="notification-time" className="text-sm font-medium">
                Reminder Time
              </Label>
              <Input
                id="notification-time"
                type="time"
                value={settings.time}
                onChange={onTimeChange}
                className="w-full"
                disabled={loading}
              />
            </div>
          )}
          <div className="flex gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 items-center">
            <Info className="text-blue-600 dark:text-blue-400 w-5 h-5 shrink-0" />
            <span className="text-xs text-blue-800 dark:text-blue-300">
              You may need to grant notification permissions when prompted by the browser or your device.
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
