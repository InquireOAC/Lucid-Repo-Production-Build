
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Preferences } from "@capacitor/preferences";

const OnboardingFlow = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  const screens = [
    {
      image: "/lovable-uploads/3b6fe48c-0ad9-49d4-bc11-901c8c7bd57b.png",
      alt: "Welcome to Lucid Repo"
    },
    {
      image: "/lovable-uploads/8d08f66c-0358-4384-82fb-adb26473741b.png",
      alt: "Log Your Dreams"
    },
    {
      image: "/lovable-uploads/4b346888-9d0c-4bc6-8f9f-62b1a0bf8a0e.png",
      alt: "Unlock Deeper Insight"
    },
    {
      image: "/lovable-uploads/7abcdec8-4162-4366-b826-766a32ca41bc.png",
      alt: "Dream Together"
    },
    {
      image: "/lovable-uploads/de95dbab-4d1b-4a35-ae65-787330f14e2d.png",
      alt: "Ready to Join"
    }
  ];

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
      
      // Navigate to the Journal page
      navigate('/');
    } catch (error) {
      console.error('Error setting onboarding preference:', error);
      // Still navigate even if storage fails
      navigate('/');
    }
  };

  const isLastScreen = currentScreen === screens.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Full screen image */}
      <div className="flex-1 relative">
        <img
          src={screens[currentScreen].image}
          alt={screens[currentScreen].alt}
          className="w-full h-full object-cover"
        />
        
        {/* Button overlay positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-20 flex justify-center">
          <Button
            onClick={isLastScreen ? handleStart : handleNext}
            className="w-full max-w-sm h-16 text-lg font-medium bg-[#4A4063] hover:bg-[#5A5073] text-white rounded-2xl"
          >
            {isLastScreen ? "Start" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
