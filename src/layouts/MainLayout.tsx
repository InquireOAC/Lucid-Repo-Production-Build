import React from "react";
import { motion } from "framer-motion";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Book, Moon, User, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import SymbolAvatar from "@/components/profile/SymbolAvatar";
import lucidRepoLogo from "@/assets/lucid-repo-logo.png";

const MainLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [location.pathname]);
  
  React.useEffect(() => {
    const publicRoutes = ["/", "/journal", "/journal/new", "/auth"];
    const isPublicRoute = publicRoutes.includes(location.pathname);
    
    if (!loading && !user && !isPublicRoute) {
      console.log("Redirecting to auth - user not authenticated");
      navigate("/auth", { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <div className="flex h-screen overflow-hidden cosmic-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Fixed opaque overlay for status bar safe area */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-background safe-area-overlay md:hidden" />
        
        {/* Announcement banner - fixed overlay on community pages */}
        {!(location.pathname === "/" || location.pathname === "/journal" || location.pathname.startsWith("/journal/")) && (
          <div className="fixed top-0 left-0 right-0 z-50 pt-safe-top md:hidden">
            <AnnouncementBanner />
          </div>
        )}
        
        {/* Main content - scrollable area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto ios-scroll-fix scrollbar-none"
          style={isMobile ? { paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))' } : undefined}
        >
          <div className="md:pb-0" style={{ ['--mobile-pb' as string]: 'calc(3.5rem + env(safe-area-inset-bottom))' }}>
            <Outlet />
          </div>
        </div>
        
        {/* Mobile bottom tab bar */}
        <motion.div
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 glass-card border-t border-primary/10 backdrop-blur-xl z-50 pb-safe-bottom pl-safe-left pr-safe-right md:hidden"
        >
          <div className="flex justify-around items-center h-14">
            <NavTab to="/" icon={<Book />} label="Journal" />
            <NavTab to="/lucid-repo" icon={<Moon />} label="Lucid Repo" />
            <NavTab to="/lucid-stats" icon={<Sparkles />} label="Stats" />
            <NavTab to="/profile" icon={<User />} label="Profile" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ========== Desktop Sidebar ========== */

const navItems = [
  { to: "/", icon: Book, label: "Journal" },
  { to: "/lucid-repo", icon: Moon, label: "Lucid Repo" },
  { to: "/lucid-stats", icon: Sparkles, label: "Stats" },
  { to: "/profile", icon: User, label: "Profile" },
];

const DesktopSidebar = () => {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === "/") {
      return location.pathname === "/" || location.pathname === "/journal" || location.pathname === "/journal/new";
    }
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-primary/10 glass-card z-30 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-primary/10">
        <img src={lucidRepoLogo} alt="Lucid Repo" className="h-8 w-8 rounded-lg" />
        <span className="text-lg font-bold text-foreground tracking-tight">Lucid Repo</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
              {active && (
                <motion.div
                  layoutId="desktop-nav-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-primary/10">
        <div className="px-4 py-2 text-xs text-muted-foreground/60">
          © Lucid Repo
        </div>
      </div>
    </aside>
  );
};

/* ========== Mobile Nav Tab ========== */

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
