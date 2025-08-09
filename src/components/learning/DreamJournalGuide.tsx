import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Book, Lightbulb, Moon, ArrowRight, ArrowLeft } from 'lucide-react';

interface DreamJournalGuideProps {
  onComplete: () => void;
  onClose: () => void;
}

export const DreamJournalGuide = ({ onComplete, onClose }: DreamJournalGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      title: "Why Keep a Dream Journal?",
      icon: <Lightbulb className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p>Dream journaling is the foundation of lucid dreaming. Here's why it works:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <span><strong>Improves recall:</strong> Regular writing trains your brain to remember dreams</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <span><strong>Identifies patterns:</strong> Recurring themes become dream signs</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <span><strong>Builds awareness:</strong> Connecting with dreams during the day</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Setting Up Your Journal",
      icon: <Book className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p>Choose your journaling method:</p>
          <div className="grid gap-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold text-green-600">✅ Digital Journal (Recommended)</h4>
              <p className="text-sm text-muted-foreground">Use this app's journal feature - it's always with you and easy to search</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold">📓 Physical Notebook</h4>
              <p className="text-sm text-muted-foreground">Keep by your bed with a pen for immediate recording</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold">🎙️ Voice Recorder</h4>
              <p className="text-sm text-muted-foreground">Quick voice notes that you can transcribe later</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What to Record",
      icon: <Moon className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p>Capture these key elements in every dream entry:</p>
          <div className="space-y-3">
            <div className="p-3 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-1">📅 Date & Time</h4>
              <p className="text-sm">When you went to sleep and woke up</p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-1">📝 Dream Content</h4>
              <p className="text-sm">People, places, events - even fragments matter</p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-1">🎭 Emotions</h4>
              <p className="text-sm">How you felt during and after the dream</p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-1">🔍 Unusual Elements</h4>
              <p className="text-sm">Things that seemed strange or impossible</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Best Practices",
      icon: <CheckCircle className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p>Follow these tips for maximum effectiveness:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold">Write Immediately</h4>
                <p className="text-sm">Record as soon as you wake up, even if it's 3 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold">Don't Move First</h4>
                <p className="text-sm">Stay in the same position and recall before getting up</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold">Record Everything</h4>
                <p className="text-sm">Even tiny fragments can trigger more memories</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed all steps
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const allStepsCompleted = completedSteps.length === steps.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {currentStepData.icon}
            Dream Journal Guide
          </CardTitle>
          <Badge variant="outline">
            {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <div className="flex gap-1 mt-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded ${
                index <= currentStep
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">{currentStepData.title}</h3>
          {currentStepData.content}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onClose : handlePrevious}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? 'Close' : 'Previous'}
          </Button>
          
          <Button onClick={handleNext}>
            {isLastStep ? 'Complete Guide' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};