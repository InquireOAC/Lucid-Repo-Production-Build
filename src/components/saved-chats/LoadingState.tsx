
import React from 'react';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Loading saved chats...</p>
      </div>
    </div>
  );
};

export default LoadingState;
