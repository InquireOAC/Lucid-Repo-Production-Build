
import React from "react";
import { Moon } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen dream-background flex items-center justify-center safe-area-inset-top">
      <div className="text-center px-4">
        <Moon size={48} className="mx-auto animate-pulse text-dream-purple" />
        <p className="mt-4">Loading profile...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
