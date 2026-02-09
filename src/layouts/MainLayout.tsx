import React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Book, Moon, User, MessageCircle, GraduationCap, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { cn } from "@/lib/utils";

const MainLayout = () => {
  const { user, loading } = useAuth();
  const { unreadCount: notificationCount } = useNotifications();
  const { unreadCount: messageCount } = useUnreadMessages();
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    // Only redirect to auth for pages that require authentication
    // Journal page should work without authentication
    const publicRoutes = ["/", "/journal", "/auth"];
    const isPublicRoute = publicRoutes.includes(location.pathname);
    
    if (!loading && !user && !isPublicRoute) {
      console.log("Redirecting to auth - user not authenticated");
      navigate("/auth", { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <div className="flex flex-col min-h-screen starry-background">
      {/* Fixed opaque overlay for status bar safe area */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background safe-area-overlay" />
      
      {/* Main content - scrollable area with proper bottom padding for tab bar + safe area */}
      <div className="flex-1 overflow-y-auto ios-scroll-fix" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </div>
      
      {/* Fixed tab bar positioned at the bottom with safe area padding */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 backdrop-blur-xl z-50 pb-safe-bottom pl-safe-left pr-safe-right">
        <div className="flex justify-around items-center h-16">
          <NavTab to="/" icon={<Book />} label="Journal" />
          <NavTab to="/lucid-repo" icon={<Moon />} label="Lucid Repo" />
          <NavTab to="/learn" icon={<GraduationCap />} label="Learn" />
          <NavTab 
            to="/chat" 
            icon={<MessageCircle />} 
            label="AI Chat" 
          />
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
  badge?: number;
}

const NavTab = ({ to, icon, label, badge }: NavTabProps) => {
  const location = useLocation();
  
  // Special handling for journal route - both "/" and "/journal" should be active
  const isActive = to === "/" 
    ? (location.pathname === "/" || location.pathname === "/journal")
    : location.pathname === to;
  
  return (
    <NavLink 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center w-full py-2 transition-all duration-300 rounded-lg mx-1 relative",
        isActive 
          ? "text-purple-300 bg-purple-500/20 shadow-md shadow-purple-500/30" 
          : "text-white/60 hover:text-white/80 hover:bg-white/5"
      )}
    >
      <div className={cn(
        "p-2 rounded-full transition-all duration-300 relative",
        isActive 
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" 
          : "text-white/60"
      )}>
        {icon}
        {badge && badge > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {badge > 99 ? '99+' : badge}
            </span>
          </div>
        )}
      </div>
      <span className={cn(
        "text-xs mt-1 font-medium",
        isActive ? "text-white" : "text-white/60"
      )}>{label}</span>
    </NavLink>
  );
};

export default MainLayout;
