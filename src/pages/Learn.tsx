import React from 'react';
import { LearningDashboard } from '@/components/learning/LearningDashboard';
import { useAuth } from '@/contexts/AuthContext';

const Learn = () => {
  const { user, loading } = useAuth();

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
    <div className="flex flex-col min-h-screen bg-background">
      <LearningDashboard userId={user.id} />
    </div>
  );
};

export default Learn;