import React from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Book, Moon, User, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const MainLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    const publicRoutes = ["/", "/journal", "/journal/new", "/auth"];
    const isPublicRoute = publicRoutes.includes(location.pathname);
    
    if (!loading && !user && !isPublicRoute) {
      console.log("Redirecting to auth - user not authenticated");
      navigate("/auth", { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <div className="flex flex-col min-h-screen cosmic-background">
      {/* Fixed opaque overlay for status bar safe area */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background safe-area-overlay" />
      
      {/* Main content - scrollable area with proper bottom padding for tab bar + safe area */}
      <div className="flex-1 overflow-y-auto ios-scroll-fix" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </div>
      
      {/* Fixed tab bar positioned at the bottom with safe area padding */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-primary/10 backdrop-blur-xl z-50 pb-safe-bottom pl-safe-left pr-safe-right">
        <div className="flex justify-around items-center h-16">
          <NavTab to="/" icon={<Book />} label="Journal" />
          <NavTab to="/lucid-repo" icon={<Moon />} label="Lucid Repo" />
          <NavTab to="/insights" icon={<Sparkles />} label="Insights" />
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
    ? (location.pathname === "/" || location.pathname === "/journal" || location.pathname === "/journal/new")
    : location.pathname === to || location.pathname.startsWith(to + "/");
  
  return (
    <NavLink 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center w-full py-2 transition-all duration-300 rounded-lg mx-1 relative",
        isActive 
          ? "text-primary" 
          : "text-white/50 hover:text-white/70 hover:bg-white/5"
      )}
    >
      <div className={cn(
        "p-2 rounded-full transition-all duration-300 relative",
        isActive 
          ? "bg-[hsl(270,70%,50%)] text-white shadow-lg shadow-purple-500/40" 
          : "text-white/50"
      )}>
        {icon}
        {badge && badge > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-aurora-gold rounded-full flex items-center justify-center">
            <span className="text-cosmic-black text-xs font-bold">
              {badge > 99 ? '99+' : badge}
            </span>
          </div>
        )}
      </div>
      <span className={cn(
        "text-xs mt-1 font-medium",
        isActive ? "text-white" : "text-white/50"
      )}>{label}</span>
    </NavLink>
  );
};

export default MainLayout;
