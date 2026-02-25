import React, { useState } from "react";
import { X, Megaphone, Bell, PartyPopper, AlertTriangle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const typeConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
  announcement: {
    icon: <Megaphone className="h-4 w-4 shrink-0" />,
    className: "bg-primary/90 text-primary-foreground",
    label: "Announcement",
  },
  reminder: {
    icon: <Bell className="h-4 w-4 shrink-0" />,
    className: "bg-amber-500/90 text-white",
    label: "Reminder",
  },
  celebration: {
    icon: <PartyPopper className="h-4 w-4 shrink-0" />,
    className: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white",
    label: "Celebration",
  },
  poll: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
    className: "bg-indigo-500/90 text-white",
    label: "Poll",
  },
};

const AnnouncementBanner = () => {
  const { currentAnnouncement, dismissAnnouncement } = useAnnouncements();
  const [modalOpen, setModalOpen] = useState(false);

  if (!currentAnnouncement) return null;

  const config = typeConfig[currentAnnouncement.type] || typeConfig.announcement;

  const handleDismiss = () => {
    setModalOpen(false);
    dismissAnnouncement(currentAnnouncement.id);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          key={currentAnnouncement.id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div
            className={cn("relative flex items-center gap-2 px-4 py-2.5 cursor-pointer", config.className)}
            onClick={() => setModalOpen(true)}
          >
            {config.icon}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold mr-1">{currentAnnouncement.title}:</span>
              <span className="text-sm opacity-90 line-clamp-1">{currentAnnouncement.content}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {config.icon}
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {config.label}
              </span>
            </div>
            <DialogTitle className="text-lg">{currentAnnouncement.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {currentAnnouncement.content}
            </p>

            <p className="text-xs text-muted-foreground/60">
              {format(new Date(currentAnnouncement.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>

            {currentAnnouncement.link_url && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => window.open(currentAnnouncement.link_url!, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-4 w-4" />
                Learn more
              </Button>
            )}

            <Button variant="destructive" size="sm" className="w-full" onClick={handleDismiss}>
              Dismiss
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnouncementBanner;
