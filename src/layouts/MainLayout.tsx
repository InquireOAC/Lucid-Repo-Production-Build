import React from "react";
import { motion } from "framer-motion";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Book, Moon, User, Compass } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import { AnimatePresence } from "framer-motion";

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
      {/* Fixed opaque overlay for status bar safe area + notification bell */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background safe-area-overlay">
        {user && (
          <div className="absolute right-3 bottom-1">
            <NotificationBell />
          </div>
        )}
      </div>
      
      {/* Announcement banner - fixed overlay on community pages */}
      {!(location.pathname === "/" || location.pathname === "/journal" || location.pathname.startsWith("/journal/")) && (
        <div className="fixed top-0 left-0 right-0 z-50 pt-safe-top">
          <AnnouncementBanner />
        </div>
      )}
      
      {/* Main content - scrollable area with proper bottom padding for tab bar + safe area */}
      <div className="flex-1 overflow-y-auto ios-scroll-fix" style={{ paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </div>
      
      {/* Fixed tab bar positioned at the bottom with safe area padding */}
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-0 left-0 right-0 glass-card border-t border-primary/10 backdrop-blur-xl z-50 pb-safe-bottom pl-safe-left pr-safe-right"
      >
        <div className="flex justify-around items-center h-14">
          <NavTab to="/" icon={<Book />} label="Journal" />
          <NavTab to="/lucid-repo" icon={<Moon />} label="Lucid Repo" />
          <NavTab to="/explore" icon={<Compass />} label="Explore" />
          <NavTab to="/profile" icon={<User />} label="Profile" />
        </div>
      </motion.div>
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
        "p-1.5 rounded-full transition-all duration-300 relative",
        isActive 
          ? "text-primary" 
          : "text-white/50"
      )}>
        {isActive && (
          <motion.div
            layoutId="nav-tab-glow"
            className="absolute inset-0 bg-primary/15 rounded-full"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <span className="relative z-10">{icon}</span>
        {badge && badge > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-aurora-gold rounded-full flex items-center justify-center">
            <span className="text-cosmic-black text-xs font-bold">
              {badge > 99 ? '99+' : badge}
            </span>
          </div>
        )}
      </div>
    </NavLink>
  );
};

export default MainLayout;
