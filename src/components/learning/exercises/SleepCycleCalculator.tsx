import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun } from "lucide-react";

interface SleepCycleCalculatorProps {
  onComplete: () => void;
}

export const SleepCycleCalculator: React.FC<SleepCycleCalculatorProps> = ({ onComplete }) => {
  const [bedTime, setBedTime] = useState("22:30");
  const [wakeUpTimes, setWakeUpTimes] = useState<string[]>([]);

  const calculateWakeUpTimes = () => {
    const [hours, minutes] = bedTime.split(":").map(Number);
    const bedTimeDate = new Date();
    bedTimeDate.setHours(hours, minutes, 0);

    // Add 15 minutes to fall asleep
    bedTimeDate.setMinutes(bedTimeDate.getMinutes() + 15);

    const times: string[] = [];
    // Calculate 6 REM cycles (90 minutes each)
    for (let cycle = 1; cycle <= 6; cycle++) {
      const wakeTime = new Date(bedTimeDate);
      wakeTime.setMinutes(wakeTime.getMinutes() + cycle * 90);
      
      const hoursStr = wakeTime.getHours().toString().padStart(2, "0");
      const minutesStr = wakeTime.getMinutes().toString().padStart(2, "0");
      times.push(`${hoursStr}:${minutesStr}`);
    }

    setWakeUpTimes(times);
  };

  const getCycleInfo = (index: number) => {
    const totalHours = ((index + 1) * 90 + 15) / 60;
    return {
      cycle: index + 1,
      hours: Math.floor(totalHours),
      minutes: Math.round((totalHours % 1) * 60),
      recommended: index >= 3 && index <= 5, // Cycles 4-6 are best
    };
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Sleep Cycle Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm">
            💤 <strong>How it works:</strong> Sleep occurs in 90-minute cycles. Waking up at the end of a cycle (not in the middle) helps you feel more refreshed and remember dreams better.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bed-time">What time do you plan to go to bed?</Label>
          <Input
            id="bed-time"
            type="time"
            value={bedTime}
            onChange={(e) => setBedTime(e.target.value)}
            className="glass-card"
          />
        </div>

        <Button onClick={calculateWakeUpTimes} className="w-full">
          Calculate Best Wake-Up Times
        </Button>

        {wakeUpTimes.length > 0 && (
          <div className="space-y-3 mt-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Sun className="w-5 h-5 text-yellow-500" />
              Your Optimal Wake-Up Times:
            </h3>
            {wakeUpTimes.map((time, index) => {
              const info = getCycleInfo(index);
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg glass-card flex items-center justify-between ${
                    info.recommended ? "border-2 border-green-500/50 bg-green-500/5" : ""
                  }`}
                >
                  <div>
                    <p className="font-semibold text-lg">{time}</p>
                    <p className="text-sm text-muted-foreground">
                      After {info.cycle} cycle{info.cycle > 1 ? "s" : ""} ({info.hours}h {info.minutes}m of sleep)
                    </p>
                  </div>
                  {info.recommended && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      ✓ Recommended
                    </Badge>
                  )}
                </div>
              );
            })}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
              <p className="text-sm">
                🎯 <strong>Best for Dream Recall:</strong> Cycles 4-6 (6-9 hours) have the longest REM periods with the most vivid dreams.
              </p>
            </div>
            <Button onClick={onComplete} className="w-full">
              Save & Complete Exercise +10 XP
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
