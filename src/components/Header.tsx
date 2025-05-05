
import React from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("w-full py-4 border-b", className)}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="font-semibold text-xl">YourBrand</div>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            Home
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            About
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            Services
          </a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
            Contact
          </a>
        </nav>
        <div className="md:hidden">
          <button className="p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
