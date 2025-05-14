
import React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Book, Moon, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const MainLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    // Only redirect to auth if not logged in and not on the root or journal path
    if (!loading && !user && location.pathname !== "/" && location.pathname !== "/journal") {
      navigate("/auth");
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main content - scrollable area with bottom padding to account for tab bar */}
      <div className="flex-1 overflow-y-auto pt-0 pb-16">
        <Outlet />
      </div>
      
      {/* Fixed tab bar positioned at the bottom with safe area insets */}
      <div className="fixed bottom-0 left-0 right-0 bg-card shadow-lg border-t z-50 pb-safe-bottom">
        <div className="flex justify-around items-center h-16 pb-0">
          <NavTab to="/journal" icon={<Book />} label="Journal" />
          <NavTab to="/lucid-repo" icon={<Moon />} label="Lucid Repo" />
          <NavTab to="/profile" icon={<User />} label="Profile" />
        </div>
      </div>
    </div>
  );
};

interface NavTabProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavTab = ({ to, icon, label }: NavTabProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to === "/journal" && location.pathname === "/");
  
  return (
    <NavLink 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center w-full py-1",
        isActive ? "text-dream-purple" : "text-gray-500"
      )}
    >
      <div className={cn(
        "p-1 rounded-full",
        isActive ? "bg-dream-purple/10" : ""
      )}>
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
};

export default MainLayout;
