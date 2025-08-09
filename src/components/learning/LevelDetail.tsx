import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Play, Volume2 } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { PracticeTimer } from './PracticeTimer';
import { RealityCheckReminder } from './RealityCheckReminder';
import { useLearningLevels } from '@/hooks/useLearningLevels';
import { usePracticeSessions } from '@/hooks/usePracticeSessions';

interface LevelDetailProps {
  levelNumber: number;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const LevelDetail = ({ levelNumber, isOpen, onClose, userId }: LevelDetailProps) => {
  const { levels } = useLearningLevels();
  const { createSession } = usePracticeSessions(userId);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const level = levels.find(l => l.level_number === levelNumber);

  if (!level) return null;

  const handleStartPractice = async (practiceType: string, duration?: number) => {
    if (userId) {
      await createSession({
        user_id: userId,
        session_type: practiceType,
        level_id: level.id,
        duration_minutes: duration,
        xp_earned: 10 // Base XP for practice
      });
    }
  };

  const renderLevelContent = () => {
    const content = level.content as any;
    
    switch (levelNumber) {
      case 1:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dream Journal Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Set up your dream journal for optimal recall:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Keep journal by your bed
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Record immediately upon waking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Include emotions and colors
                  </li>
                </ul>
                <Button 
                  className="mt-4" 
                  onClick={() => handleStartPractice('dream_journal_setup')}
                >
                  Start Dream Logging
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reality Check Training</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Learn to question reality throughout the day:</p>
                <RealityCheckReminder 
                  onComplete={() => handleStartPractice('reality_check')}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Intention Setting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Program your mind for lucid dreaming:</p>
                <Button 
                  className="w-full mb-4" 
                  onClick={() => setActiveComponent('intention')}
                >
                  Set Tonight's Intention
                </Button>
                <PracticeTimer
                  duration={10}
                  title="Affirmation Practice"
                  onComplete={() => handleStartPractice('affirmation', 10)}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meditation & Relaxation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Develop mindfulness and body awareness:</p>
                <div className="space-y-2">
                  <PracticeTimer
                    duration={5}
                    title="5-Minute Breathing"
                    onComplete={() => handleStartPractice('breathing', 5)}
                  />
                  <PracticeTimer
                    duration={10}
                    title="Progressive Relaxation"
                    onComplete={() => handleStartPractice('relaxation', 10)}
                  />
                  <PracticeTimer
                    duration={15}
                    title="Mindfulness Meditation"
                    onComplete={() => handleStartPractice('meditation', 15)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>WBTB & MILD Techniques</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Advanced induction methods:</p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setActiveComponent('wbtb')}
                  >
                    Set WBTB Alarm
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleStartPractice('mild_practice')}
                  >
                    Practice MILD Technique
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Binaural Beats & Audio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Enhance your practice with sound:</p>
                <AudioPlayer 
                  onSessionComplete={(duration) => handleStartPractice('audio_session', duration)}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Dream Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Master your lucid dreams:</p>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <strong>Stabilization Techniques:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• Rub your hands together</li>
                      <li>• Touch objects in the dream</li>
                      <li>• Spin around slowly</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <strong>Control Exercises:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>• Start with small objects</li>
                      <li>• Practice flying gradually</li>
                      <li>• Summon dream characters</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Level content not available</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Level {levelNumber}: {level.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">{level.description}</p>
          
          {renderLevelContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};