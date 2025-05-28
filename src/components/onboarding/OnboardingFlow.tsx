
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Preferences } from "@capacitor/preferences";

const OnboardingFlow = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const screens = [{
    image: "/lovable-uploads/d077a453-8943-4e04-b7a7-a87dbcd89bb6.png",
    alt: "Welcome to Lucid Repo"
  }, {
    image: "/lovable-uploads/4102df71-b053-41ec-8755-568a0d56e141.png",
    alt: "Log Your Dreams"
  }, {
    image: "/lovable-uploads/1f6f4a74-2368-46c6-a836-b0cf4eca5d27.png",
    alt: "Unlock Deeper Insight"
  }, {
    image: "/lovable-uploads/f13ed434-e02c-4a2a-91c6-ec46399be11d.png",
    alt: "Dream Together"
  }, {
    image: "/lovable-uploads/50708464-3597-4dee-8b0e-940d33ed33e0.png",
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
