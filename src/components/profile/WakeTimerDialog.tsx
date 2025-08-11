import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";
import { AlarmClock, Bell } from "lucide-react";

interface WakeTimerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const WakeTimerDialog = ({ isOpen, onOpenChange }: WakeTimerDialogProps) => {
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    loadSavedTimer();
  }, []);

  const loadSavedTimer = async () => {
    try {
      const { value: savedTimer } = await Preferences.get({ key: 'wakeTimer' });
      if (savedTimer) {
        const timer = JSON.parse(savedTimer);
        setHours(timer.hours || "");
        setMinutes(timer.minutes || "");
        setIsEnabled(timer.enabled || false);
      }
    } catch (error) {
      console.error('Error loading saved timer:', error);
    }
  };

  const saveTimer = async () => {
    try {
      const timer = {
        hours: hours,
        minutes: minutes,
        enabled: true
      };
      
      await Preferences.set({
        key: 'wakeTimer',
        value: JSON.stringify(timer)
      });
      
      setIsEnabled(true);
      scheduleNotification();
      toast.success("Wake timer set successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving timer:', error);
      toast.error("Failed to set wake timer");
    }
  };

  const disableTimer = async () => {
    try {
      const timer = {
        hours: hours,
        minutes: minutes,
        enabled: false
      };
      
      await Preferences.set({
        key: 'wakeTimer',
        value: JSON.stringify(timer)
      });
      
      setIsEnabled(false);
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      toast.success("Wake timer disabled");
    } catch (error) {
      console.error('Error disabling timer:', error);
      toast.error("Failed to disable wake timer");
    }
  };

  const scheduleNotification = async () => {
    try {
      // Request permission first
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        toast.error("Notification permissions not granted");
        return;
      }

      // Cancel any existing notifications
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(parseInt(hours) || 0);
      targetTime.setMinutes(parseInt(minutes) || 0);
      targetTime.setSeconds(0);

      // If the time has passed today, schedule for tomorrow
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Dream Journal Reminder",
            body: "Time to record your dreams!",
            id: 1,
            schedule: { at: targetTime, repeats: true },
            sound: "default",
            actionTypeId: "",
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      toast.error("Failed to schedule notification");
    }
  };

  const formatTime = () => {
    if (!hours || !minutes) return "";
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlarmClock className="h-5 w-5" />
            Wake Timer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Set a daily reminder to record your dreams when you wake up.
          </div>

          {isEnabled && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Bell className="h-4 w-4" />
                <span className="font-medium">Wake timer is active</span>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                Daily reminder set for {formatTime()}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours (24h)</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="07"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="00"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={saveTimer}
              disabled={!hours || !minutes}
              className="flex-1"
            >
              {isEnabled ? "Update Timer" : "Set Timer"}
            </Button>
            {isEnabled && (
              <Button 
                variant="outline" 
                onClick={disableTimer}
                className="flex-1"
              >
                Disable
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WakeTimerDialog;