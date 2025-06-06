
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
    // Redirect to auth if not logged in (except for journal which works without auth)
    if (!loading && !user && location.pathname !== "/") {
      navigate("/auth");
    }
  }, [user, loading, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main content - scrollable area with bottom padding to account for tab bar */}
      <div className="flex-1 overflow-y-auto pt-0 pb-16">
        <Outlet />
      </div>
      
      {/* Fixed tab bar positioned at the bottom with safe area insets */}
      <div className="fixed bottom-0 left-0 right-0 bg-card shadow-lg border-t z-50">
        {/* Removed pb-safe-bottom so the tab bar always reaches the very bottom */}
        <div className="flex justify-around items-center h-16 pb-0">
          <NavTab to="/" icon={<Book />} label="Journal" />
          <NavTab to="/lucidrepo" icon={<Moon />} label="Lucid Repo" />
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
  const isActive = location.pathname === to;
  
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
