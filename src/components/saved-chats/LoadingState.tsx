
import React from 'react';

const LoadingState = () => {
  return (
    <div className="min-h-screen starry-background p-4 flex items-center justify-center">
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-300 rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <p className="text-white/80 font-medium">Loading saved chats...</p>
      </div>
    </div>
  );
};

export default LoadingState;
