import React from 'react';
import { LearningDashboard } from '@/components/learning/LearningDashboard';
import { useAuth } from '@/contexts/AuthContext';

const Learn = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LearningDashboard userId={user?.id} />
    </div>
  );
};

export default Learn;