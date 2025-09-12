import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LearningDashboard } from '@/components/learning/LearningDashboard';
import { useAuth } from '@/contexts/AuthContext';

const Learn = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(true);

  const handleCloseComingSoon = () => {
    setShowComingSoon(false);
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
          <p className="text-muted-foreground">Please sign in to access the learning system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-background pt-safe-top pl-safe-left pr-safe-right">
      {/* Darkened background when coming soon is active */}
      <div className={`${showComingSoon ? 'opacity-30 pointer-events-none' : ''} flex flex-col min-h-screen bg-background`}>
        <LearningDashboard userId={user.id} />
      </div>

      {/* Coming Soon Modal */}
      <Dialog open={showComingSoon} onOpenChange={handleCloseComingSoon}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white gradient-text text-center">
              🚀 Coming Soon!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-white/80">
              The learning system is currently under development. Stay tuned for an amazing lucid dreaming education experience!
            </p>
            <Button 
              onClick={handleCloseComingSoon}
              className="glass-button"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Learn;