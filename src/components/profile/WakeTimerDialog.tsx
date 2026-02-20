
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";
import { AlarmClock, Bell, MessageSquare } from "lucide-react";

const WAKE_TIMER_ID = 200;

interface WakeTimerSettings {
  enabled: boolean;
  time: string; // "HH:MM"
  message: string;
}

const DEFAULT_WAKE_SETTINGS: WakeTimerSettings = {
  enabled: false,
  time: "07:00",
  message: "Time to record your dreams!",
};

interface WakeTimerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const WakeTimerDialog = ({ isOpen, onOpenChange }: WakeTimerDialogProps) => {
  const [settings, setSettings] = useState<WakeTimerSettings>(DEFAULT_WAKE_SETTINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) loadSavedTimer();
  }, [isOpen]);

  const loadSavedTimer = async () => {
    try {
      const { value } = await Preferences.get({ key: "wakeTimer" });
      if (value) {
        const parsed = JSON.parse(value);
        // Migrate from old format (hours/minutes fields)
        if (parsed.hours !== undefined) {
          setSettings({
            enabled: parsed.enabled || false,
            time: `${String(parsed.hours).padStart(2, "0")}:${String(parsed.minutes).padStart(2, "0")}`,
            message: parsed.message || DEFAULT_WAKE_SETTINGS.message,
          });
        } else {
          setSettings({ ...DEFAULT_WAKE_SETTINGS, ...parsed });
        }
      }
    } catch (error) {
      console.error("Error loading wake timer:", error);
    }
  };

  const saveTimer = async () => {
    setLoading(true);
    try {
      const updated = { ...settings, enabled: true };
      await Preferences.set({ key: "wakeTimer", value: JSON.stringify(updated) });
      setSettings(updated);
      await scheduleWakeNotification(updated);
      toast.success("Wake timer set successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving timer:", error);
      toast.error("Failed to set wake timer");
    } finally {
      setLoading(false);
    }
  };

  const disableTimer = async () => {
    setLoading(true);
    try {
      const updated = { ...settings, enabled: false };
      await Preferences.set({ key: "wakeTimer", value: JSON.stringify(updated) });
      setSettings(updated);
      await cancelWakeNotification();
      toast.success("Wake timer disabled");
    } catch (error) {
      console.error("Error disabling timer:", error);
      toast.error("Failed to disable wake timer");
    } finally {
      setLoading(false);
    }
  };

  const scheduleWakeNotification = async (s: WakeTimerSettings) => {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          const [h, m] = s.time.split(":").map(Number);
          const target = new Date();
          target.setHours(h, m, 0, 0);
          if (target <= new Date()) target.setDate(target.getDate() + 1);
          const delay = target.getTime() - Date.now();
          setTimeout(() => {
            new Notification("Dream Journal Reminder", { body: s.message, icon: "/favicon.ico" });
          }, delay);
        }
      }
      return;
    }

    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== "granted") {
        toast.error("Notification permissions not granted");
        return;
      }

      await LocalNotifications.cancel({ notifications: [{ id: WAKE_TIMER_ID }] });

      const [hours, minutes] = s.time.split(":").map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);
      if (targetTime <= new Date()) targetTime.setDate(targetTime.getDate() + 1);

      const isIOS = Capacitor.getPlatform() === "ios";

      await LocalNotifications.schedule({
        notifications: [
          {
            id: WAKE_TIMER_ID,
            title: "Dream Journal Reminder",
            body: s.message || DEFAULT_WAKE_SETTINGS.message,
            schedule: {
              at: targetTime,
              repeats: !isIOS,
              every: isIOS ? undefined : "day",
              allowWhileIdle: true,
            },
            sound: "default",
            actionTypeId: "OPEN_APP",
            autoCancel: true,
            ongoing: false,
            extra: { type: "wake_timer", isRecurring: true },
          },
        ],
      });

      if (isIOS) {
        setupWakeTimerListener(s);
      }
    } catch (error) {
      console.error("Error scheduling wake notification:", error);
      toast.error("Failed to schedule notification");
    }
  };

  const setupWakeTimerListener = (s: WakeTimerSettings) => {
    LocalNotifications.addListener("localNotificationReceived", async (notification) => {
      if (notification.extra?.type === "wake_timer") {
        setTimeout(async () => {
          const { value } = await Preferences.get({ key: "wakeTimer" });
          if (value) {
            const current: WakeTimerSettings = JSON.parse(value);
            if (current.enabled) {
              const [h, m] = current.time.split(":").map(Number);
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(h, m, 0, 0);
              await LocalNotifications.schedule({
                notifications: [
                  {
                    id: WAKE_TIMER_ID,
                    title: "Dream Journal Reminder",
                    body: current.message || DEFAULT_WAKE_SETTINGS.message,
                    schedule: { at: tomorrow, allowWhileIdle: true },
                    sound: "default",
                    actionTypeId: "OPEN_APP",
                    autoCancel: true,
                    ongoing: false,
                    extra: { type: "wake_timer", isRecurring: true },
                  },
                ],
              });
            }
          }
        }, 1000);
      }
    });
  };

  const cancelWakeNotification = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await LocalNotifications.cancel({ notifications: [{ id: WAKE_TIMER_ID }] });
    } catch (error) {
      console.error("Error canceling wake notification:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[400px] bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2">
            <AlarmClock className="h-5 w-5" /> Wake Timer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-3">
          <p className="text-sm text-muted-foreground">
            Set a daily reminder to record your dreams when you wake up.
          </p>

          <div className="flex items-center justify-between">
            <span>
              <Label className="text-base font-medium">Enable Wake Timer</Label>
              <p className="text-xs text-muted-foreground">Get a daily wake-up reminder</p>
            </span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => {
                if (!checked) {
                  disableTimer();
                } else {
                  setSettings((prev) => ({ ...prev, enabled: true }));
                }
              }}
              disabled={loading}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="space-y-1">
                <Label htmlFor="wake-time" className="text-sm font-medium">Wake Time</Label>
                <Input
                  id="wake-time"
                  type="time"
                  value={settings.time}
                  onChange={(e) => setSettings((prev) => ({ ...prev, time: e.target.value }))}
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="wake-message" className="text-sm font-medium flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Custom Message
                </Label>
                <Textarea
                  id="wake-message"
                  value={settings.message}
                  onChange={(e) => setSettings((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Time to record your dreams!"
                  className="resize-none min-h-[60px]"
                  disabled={loading}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">{settings.message.length}/200</p>
              </div>

              {settings.enabled && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 text-primary">
                    <Bell className="h-4 w-4" />
                    <span className="font-medium text-sm">Timer active</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Daily reminder at {settings.time}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          {settings.enabled && (
            <Button onClick={saveTimer} disabled={loading || !settings.time}>
              {loading ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WakeTimerDialog;
