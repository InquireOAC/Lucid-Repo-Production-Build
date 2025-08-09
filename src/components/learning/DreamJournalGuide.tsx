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
          <p className="text-foreground">Dream journaling is the foundation of lucid dreaming. Here's why it works:</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-green-400">Improves recall:</span>
                <span className="ml-1 text-foreground">Regular writing trains your brain to remember dreams</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-blue-400">Identifies patterns:</span>
                <span className="ml-1 text-foreground">Recurring themes become dream signs</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-purple-400">Builds awareness:</span>
                <span className="ml-1 text-foreground">Connecting with dreams during the day</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Setting Up Your Journal",
      icon: <Book className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-foreground">Choose your journaling method:</p>
          <div className="grid gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                ✅ Digital Journal (Recommended)
              </h4>
              <p className="text-sm text-muted-foreground">Use this app's journal feature - it's always with you and easy to search</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <h4 className="font-bold text-accent mb-2 flex items-center gap-2">
                📓 Physical Notebook
              </h4>
              <p className="text-sm text-muted-foreground">Keep by your bed with a pen for immediate recording</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                🎙️ Voice Recorder
              </h4>
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
          <p className="text-foreground">Capture these key elements in every dream entry:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <h4 className="font-bold mb-2 text-primary flex items-center gap-2">
                📅 Date & Time
              </h4>
              <p className="text-sm text-muted-foreground">When you went to sleep and woke up</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
              <h4 className="font-bold mb-2 text-accent flex items-center gap-2">
                📝 Dream Content
              </h4>
              <p className="text-sm text-muted-foreground">People, places, events - even fragments matter</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
              <h4 className="font-bold mb-2 text-yellow-400 flex items-center gap-2">
                🎭 Emotions
              </h4>
              <p className="text-sm text-muted-foreground">How you felt during and after the dream</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <h4 className="font-bold mb-2 text-blue-400 flex items-center gap-2">
                🔍 Unusual Elements
              </h4>
              <p className="text-sm text-muted-foreground">Things that seemed strange or impossible</p>
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
          <p className="text-foreground">Follow these tips for maximum effectiveness:</p>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-green-400 mb-1">Write Immediately</h4>
                <p className="text-sm text-muted-foreground">Record as soon as you wake up, even if it's 3 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-blue-400 mb-1">Don't Move First</h4>
                <p className="text-sm text-muted-foreground">Stay in the same position and recall before getting up</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-purple-400 mb-1">Record Everything</h4>
                <p className="text-sm text-muted-foreground">Even tiny fragments can trigger more memories</p>
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
    <div className="relative">
      <Card className="learning-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl text-high-contrast">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 shadow-sm">
                {currentStepData.icon}
              </div>
              Dream Journal Guide
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/25 text-primary border-primary/40 px-3 py-1">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <div className="flex gap-2 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-3 flex-1 rounded-full transition-all duration-300 shadow-sm ${
                  index <= currentStep
                    ? 'bg-gradient-to-r from-primary to-primary/80'
                    : 'bg-muted/50'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-high-contrast">{currentStepData.title}</h3>
            <div className="prose prose-lg max-w-none text-high-contrast">
              {currentStepData.content}
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-border/60">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onClose : handlePrevious}
              className="border-primary/40 hover:border-primary hover:bg-primary/15 text-high-contrast font-semibold px-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Close' : 'Previous'}
            </Button>
            
            <Button 
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-lg"
            >
              {isLastStep ? 'Complete Guide' : 'Next Step'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};