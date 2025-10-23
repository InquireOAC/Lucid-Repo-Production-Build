import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface JournalSetupWizardProps {
  onComplete: () => void;
}

export const JournalSetupWizard: React.FC<JournalSetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [wakeUpTime, setWakeUpTime] = useState("07:00");
  const [journalingMethod, setJournalingMethod] = useState("typing");

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      toast.success("Journal setup complete! +5 XP earned");
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <CardTitle>Dream Journal Setup Wizard - Step {step} of 3</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Welcome to Your Dream Journal Setup!</h3>
            <p className="text-muted-foreground">
              Let's set up your dream journal for optimal recall. This will only take a minute.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm">
                💡 <strong>Tip:</strong> Consistency is key! Writing your dreams immediately upon waking dramatically improves recall.
              </p>
            </div>
            <Button onClick={handleNext} className="w-full">
              Get Started →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Set Your Morning Wake-Up Time</h3>
            <p className="text-muted-foreground">
              We'll send you a gentle reminder to journal your dreams each morning.
            </p>
            <div className="space-y-2">
              <Label htmlFor="wake-time">Wake-Up Time</Label>
              <Input
                id="wake-time"
                type="time"
                value={wakeUpTime}
                onChange={(e) => setWakeUpTime(e.target.value)}
                className="glass-card"
              />
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm">
                📅 <strong>Optimal Timing:</strong> Your best dream recall happens within 5-10 minutes of waking.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Choose Your Journaling Method</h3>
            <p className="text-muted-foreground">
              How would you like to capture your dreams?
            </p>
            <RadioGroup value={journalingMethod} onValueChange={setJournalingMethod}>
              <div className="flex items-center space-x-2 p-4 glass-card rounded-lg cursor-pointer hover:bg-white/5">
                <RadioGroupItem value="typing" id="typing" />
                <Label htmlFor="typing" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-semibold">✍️ Typing in app</p>
                    <p className="text-sm text-muted-foreground">Fastest and most organized</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 glass-card rounded-lg cursor-pointer hover:bg-white/5">
                <RadioGroupItem value="voice" id="voice" />
                <Label htmlFor="voice" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-semibold">🎤 Voice recording</p>
                    <p className="text-sm text-muted-foreground">Capture more details quickly</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 glass-card rounded-lg cursor-pointer hover:bg-white/5">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-semibold">🎯 Mix of both</p>
                    <p className="text-sm text-muted-foreground">Maximum flexibility</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Complete Setup ✓
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
