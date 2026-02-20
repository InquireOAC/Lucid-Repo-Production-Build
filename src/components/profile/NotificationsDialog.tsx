
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Info, Loader2, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getNotificationSettings,
  saveNotificationSettings,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/utils/notificationUtils";

interface NotificationsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsDialog = ({ isOpen, onOpenChange }: NotificationsDialogProps) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getNotificationSettings()
        .then((saved) => setSettings(saved))
        .catch(() => {
          toast({ title: "Failed to load notification settings.", description: "Please try again.", variant: "destructive" });
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const onToggle = (enabled: boolean) => setSettings((prev) => ({ ...prev, enabled }));
  const onTimeChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((prev) => ({ ...prev, time: e.target.value }));
  const onMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setSettings((prev) => ({ ...prev, message: e.target.value }));

  const onSave = async () => {
    setLoading(true);
    try {
      await saveNotificationSettings(settings);
      toast({ title: "Notification settings saved!", variant: "default" });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Failed to save.", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[400px] bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2">
            <Bell className="w-5 h-5" /> Morning Reminder
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-3">
          <div className="flex items-center justify-between">
            <span>
              <Label htmlFor="notifications-toggle" className="text-base font-medium">Enable Reminder</Label>
              <p className="text-xs text-muted-foreground">Wake up gently with a dream journaling nudge</p>
            </span>
            <Switch id="notifications-toggle" checked={settings.enabled} onCheckedChange={onToggle} disabled={loading} />
          </div>
          {settings.enabled && (
            <>
              <div className="space-y-1">
                <Label htmlFor="notification-time" className="text-sm font-medium">Reminder Time</Label>
                <Input id="notification-time" type="time" value={settings.time} onChange={onTimeChange} className="w-full" disabled={loading} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="notification-message" className="text-sm font-medium flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Custom Message
                </Label>
                <Textarea
                  id="notification-message"
                  value={settings.message}
                  onChange={onMessageChange}
                  placeholder="Remember to log your dream from last night!"
                  className="resize-none min-h-[60px]"
                  disabled={loading}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">{settings.message.length}/200</p>
              </div>
            </>
          )}
          <div className="flex gap-2 bg-primary/5 border border-primary/20 rounded-md p-3 items-center">
            <Info className="text-primary w-5 h-5 shrink-0" />
            <span className="text-xs text-muted-foreground">
              You may need to grant notification permissions when prompted by your device.
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;
