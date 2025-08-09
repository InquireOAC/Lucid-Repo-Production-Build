import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Play, Volume2, Book, ArrowRight } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { PracticeTimer } from './PracticeTimer';
import { RealityCheckReminder } from './RealityCheckReminder';
import { DreamJournalGuide } from './DreamJournalGuide';
import { useLearningLevels } from '@/hooks/useLearningLevels';
import { usePracticeSessions } from '@/hooks/usePracticeSessions';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const level = levels.find(l => l.level_number === levelNumber);

  if (!level) return null;

  const handleStartPractice = async (practiceType: string, duration?: number) => {
    if (!userId) {
      console.error('No user ID available for practice session');
      return;
    }

    try {
      console.log('Creating practice session:', { userId, practiceType, levelId: level.id });
      
      const session = await createSession({
        user_id: userId,
        session_type: practiceType,
        level_id: level.id,
        duration_minutes: duration,
        xp_earned: 10 // Base XP for practice
      });

      if (session) {
        console.log('Practice session created successfully:', session);
      }
    } catch (error) {
      console.error('Failed to create practice session:', error);
    }
  };

  const renderLevelContent = () => {
    const content = level.content as any;
    
    switch (levelNumber) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Book className="h-5 w-5 text-primary" />
                  </div>
                  Dream Journal Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <p className="text-muted-foreground">Learn how to set up and maintain an effective dream journal:</p>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                    onClick={() => setActiveComponent('journal-guide')}
                  >
                    <Book className="h-4 w-4 mr-2" />
                    Start Journal Setup Guide
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-primary/30 hover:border-primary hover:bg-primary/10"
                    onClick={() => {
                      navigate('/journal');
                      onClose();
                    }}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Go to Dream Journal
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Show the journal guide if active */}
            {activeComponent === 'journal-guide' && (
              <DreamJournalGuide 
                onComplete={() => handleStartPractice('dream_journal_setup')}
                onClose={() => setActiveComponent(null)}
              />
            )}
          </div>
        );

      case 2:
        return (
          <RealityCheckReminder 
            onComplete={() => handleStartPractice('reality_check')}
          />
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  Intention Setting
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <p className="text-muted-foreground">Program your mind for lucid dreaming:</p>
                <Button 
                  className="w-full mb-4 bg-primary hover:bg-primary/90 text-primary-foreground" 
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
          <div className="space-y-6">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                  Meditation & Relaxation
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <p className="text-muted-foreground">Develop mindfulness and body awareness:</p>
                <div className="space-y-3">
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
          <div className="space-y-6">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  WBTB & MILD Techniques
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <p className="text-muted-foreground">Advanced induction methods:</p>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/30 hover:border-primary hover:bg-primary/10"
                    onClick={() => setActiveComponent('wbtb')}
                  >
                    Set WBTB Alarm
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/30 hover:border-primary hover:bg-primary/10"
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
          <div className="space-y-6">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Volume2 className="h-5 w-5 text-primary" />
                  </div>
                  Binaural Beats & Audio
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <p className="text-muted-foreground">Enhance your practice with sound:</p>
                <AudioPlayer 
                  onSessionComplete={(duration) => handleStartPractice('audio_session', duration)}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  Advanced Dream Control
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <p className="text-muted-foreground">Master your lucid dreams:</p>
                <div className="grid gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                    <h4 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                      🤲 Stabilization Techniques
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                        Rub your hands together
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                        Touch objects in the dream
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                        Spin around slowly
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                    <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                      🎮 Control Exercises
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Start with small objects
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Practice flying gradually
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                        Summon dream characters
                      </li>
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg" />
        
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Level {levelNumber}: {level.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 relative">
          <p className="text-muted-foreground text-lg">{level.description}</p>
          
          {renderLevelContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};