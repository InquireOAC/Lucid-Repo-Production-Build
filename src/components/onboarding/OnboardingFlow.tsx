

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Preferences } from "@capacitor/preferences";

const OnboardingFlow = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const screens = [{
    image: "/lovable-uploads/0b968cd8-c33c-4ad9-a5c0-cdc574165296.png",
    alt: "Welcome to Lucid Repo"
  }, {
    image: "/lovable-uploads/acff2ade-cf80-4a75-8ac3-212eba1cb9e5.png",
    alt: "Log Your Dreams"
  }, {
    image: "/lovable-uploads/7c380809-f6e4-4e75-8d2c-aecbf2b82be1.png",
    alt: "Unlock Deeper Insight"
  }, {
    image: "/lovable-uploads/31d4b740-9af8-41ab-ab9c-b009b40d0e0a.png",
    alt: "Dream Together"
  }, {
    image: "/lovable-uploads/d479f36b-5afa-4ac7-8b6b-52b7d3b59d71.png",
    alt: "Ready to Join"
  }];

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleStart = async () => {
    try {
      // Set the persistent flag to indicate onboarding has been completed
      await Preferences.set({
        key: 'hasSeenOnboarding',
        value: 'true'
      });

      // Navigate to the Journal page using window.location
      window.location.href = '/';
      window.location.reload();
    } catch (error) {
      console.error('Error setting onboarding preference:', error);
      // Still navigate even if storage fails
      window.location.href = '/';
      window.location.reload();
    }
  };

  const isLastScreen = currentScreen === screens.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Full screen image */}
      <div className="flex-1 relative">
        <img src={screens[currentScreen].image} alt={screens[currentScreen].alt} className="w-full h-full object-cover" />
        
        {/* Button overlay positioned to cover the static nav buttons in the images - moved up 10px from previous position */}
        <div className="absolute bottom-[132px] left-1/2 transform -translate-x-1/2">
          <Button onClick={isLastScreen ? handleStart : handleNext} className="w-60 h-14 text-lg font-semibold border-0 py-0 my-[5px] text-black rounded-full bg-white opacity-100">
            {isLastScreen ? "Start" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;

