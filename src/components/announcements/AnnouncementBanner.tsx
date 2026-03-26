import React, { useState } from "react";
import { X, Megaphone, Bell, PartyPopper, AlertTriangle, ExternalLink, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const typeConfig: Record<string, { icon: React.ReactNode; gradient: string; glow: string; label: string; emoji: string }> = {
  announcement: {
    icon: <Megaphone className="h-4 w-4" />,
    gradient: "from-primary/20 via-primary/10 to-transparent",
    glow: "shadow-[0_0_20px_-4px_hsl(var(--primary)/0.3)]",
    label: "Announcement",
    emoji: "📢",
  },
  reminder: {
    icon: <Bell className="h-4 w-4" />,
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    glow: "shadow-[0_0_20px_-4px_rgba(245,158,11,0.3)]",
    label: "Reminder",
    emoji: "🔔",
  },
  celebration: {
    icon: <PartyPopper className="h-4 w-4" />,
    gradient: "from-yellow-500/20 via-amber-500/10 to-transparent",
    glow: "shadow-[0_0_20px_-4px_rgba(234,179,8,0.3)]",
    label: "Celebration",
    emoji: "🎉",
  },
  poll: {
    icon: <AlertTriangle className="h-4 w-4" />,
    gradient: "from-indigo-500/20 via-indigo-500/10 to-transparent",
    glow: "shadow-[0_0_20px_-4px_rgba(99,102,241,0.3)]",
    label: "Poll",
    emoji: "📊",
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
          initial={{ height: 0, opacity: 0, scale: 0.95 }}
          animate={{ height: "auto", opacity: 1, scale: 1 }}
          exit={{ height: 0, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div
            className={cn(
              "relative rounded-2xl border border-primary/15 overflow-hidden cursor-pointer",
              "bg-gradient-to-r",
              config.gradient,
              config.glow,
              "backdrop-blur-sm",
              "hover:border-primary/30 transition-all duration-300"
            )}
            onClick={() => setModalOpen(true)}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-pulse" />

            <div className="relative flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-sm">{config.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 mb-0.5">
                  {config.label}
                </p>
                <p className="text-sm font-medium text-foreground truncate">
                  {currentAnnouncement.title}
                </p>
              </div>
              <ChevronRight size={16} className="text-primary/50 shrink-0" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Detail Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-primary/15 bg-[#0a0f1e]">
          {/* Header gradient strip */}
          <div className={cn("relative px-6 pt-8 pb-6 bg-gradient-to-b", config.gradient)}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0f1e]" />
            <div className="relative space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <span className="text-2xl">{config.emoji}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">
                  {config.label}
                </p>
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {currentAnnouncement.title}
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground/50">
                {format(new Date(currentAnnouncement.created_at), "MMM d, yyyy · h:mm a")}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {currentAnnouncement.content}
            </p>

            <div className="space-y-2.5">
              {currentAnnouncement.link_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                  onClick={() => window.open(currentAnnouncement.link_url!, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-4 w-4 text-primary" />
                  <span className="text-primary">Learn more</span>
                </Button>
              )}

              <Button
                size="sm"
                className="w-full bg-primary/15 hover:bg-primary/25 text-primary border border-primary/20"
                onClick={handleDismiss}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnouncementBanner;
