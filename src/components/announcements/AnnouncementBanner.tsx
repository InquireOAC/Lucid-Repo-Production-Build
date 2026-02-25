import React from "react";
import { X, Megaphone, Bell, PartyPopper, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { icon: React.ReactNode; className: string }> = {
  announcement: {
    icon: <Megaphone className="h-4 w-4 shrink-0" />,
    className: "bg-primary/90 text-primary-foreground",
  },
  reminder: {
    icon: <Bell className="h-4 w-4 shrink-0" />,
    className: "bg-amber-500/90 text-white",
  },
  celebration: {
    icon: <PartyPopper className="h-4 w-4 shrink-0" />,
    className: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white",
  },
  poll: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
    className: "bg-indigo-500/90 text-white",
  },
};

const AnnouncementBanner = () => {
  const { currentAnnouncement, dismissAnnouncement } = useAnnouncements();

  if (!currentAnnouncement) return null;

  const config = typeConfig[currentAnnouncement.type] || typeConfig.announcement;

  const handleClick = () => {
    if (!currentAnnouncement.link_url) return;
    window.open(currentAnnouncement.link_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <motion.div
        key={currentAnnouncement.id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div
          className={cn(
            "relative flex items-center gap-2 px-4 py-2.5",
            currentAnnouncement.link_url ? "cursor-pointer" : "cursor-default",
            config.className
          )}
          onClick={currentAnnouncement.link_url ? handleClick : undefined}
        >
          {config.icon}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold mr-1">{currentAnnouncement.title}:</span>
            <span className="text-sm opacity-90 line-clamp-1">{currentAnnouncement.content}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissAnnouncement(currentAnnouncement.id);
            }}
            className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBanner;
