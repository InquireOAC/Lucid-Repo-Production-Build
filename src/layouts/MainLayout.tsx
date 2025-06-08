
import React, { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Users, User, Brain } from "lucide-react";
import PullToRefresh from "@/components/ui/PullToRefresh";

interface MainLayoutProps {
  children: ReactNode;
  onRefresh?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onRefresh = () => {} }) => {
  const location = useLocation();

  const handleRefresh = () => {
    onRefresh();
  };

  const isTabActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="pb-16">
          {children}
        </div>
      </PullToRefresh>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
        <div className="grid grid-cols-5 h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center space-y-1 ${
              isTabActive("/") && location.pathname === "/" ? "text-dream-purple" : "text-muted-foreground"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          
          <Link
            to="/journal"
            className={`flex flex-col items-center justify-center space-y-1 ${
              isTabActive("/journal") ? "text-dream-purple" : "text-muted-foreground"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">Journal</span>
          </Link>
          
          <Link
            to="/therapy"
            className={`flex flex-col items-center justify-center space-y-1 ${
              isTabActive("/therapy") ? "text-dream-purple" : "text-muted-foreground"
            }`}
          >
            <Brain className="h-5 w-5" />
            <span className="text-xs">Therapy</span>
          </Link>
          
          <Link
            to="/lucid-repo"
            className={`flex flex-col items-center justify-center space-y-1 ${
              isTabActive("/lucid-repo") ? "text-dream-purple" : "text-muted-foreground"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Repo</span>
          </Link>
          
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center space-y-1 ${
              isTabActive("/profile") ? "text-dream-purple" : "text-muted-foreground"
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
