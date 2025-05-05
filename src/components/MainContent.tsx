
import React from "react";
import { cn } from "@/lib/utils";

interface MainContentProps {
  className?: string;
}

const MainContent: React.FC<MainContentProps> = ({ className }) => {
  return (
    <main className={cn("flex-1 py-12", className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to Your Blank Page</h1>
          <p className="text-xl text-gray-600 mb-8">
            This is a clean starting point for your next amazing project.
          </p>
          <div className="inline-flex space-x-4">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
