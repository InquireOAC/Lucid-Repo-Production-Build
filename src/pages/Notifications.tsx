import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationCard from "@/components/notifications/NotificationCard";
import BroadcastsSection from "@/components/notifications/BroadcastsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<"all" | "dreams" | "community">("all");
  const visibleNotifications = notifications.filter((item) => filter === "all" || (filter === "dreams" ? ["like", "comment", "share"].includes(item.type) : ["follow", "message"].includes(item.type)));

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-safe-top pl-safe-left pr-safe-right">
        <p className="text-muted-foreground">Please sign in to view notifications</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-safe-top pb-20 md:pb-8 px-4 md:px-8 pl-safe-left pr-safe-right">
      <div className="max-w-2xl lg:max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div><p className="lucid-overline mb-1">From your dream world</p><h1 className="lucid-display text-3xl md:text-4xl">Activity</h1></div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/15 text-primary border border-primary/20">
                {unreadCount}
              </span>
            )}
          </div>
          {notifications.length > 0 && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div role="tablist" aria-label="Activity filter" className="lucid-panel mb-5 grid grid-cols-3 gap-1 p-1">
          {(["all", "dreams", "community"] as const).map((item) => <button key={item} role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} className={`rounded-xl px-2 py-2 text-sm font-medium capitalize ${filter === item ? "bg-blue-500 text-white" : "text-slate-400 hover:text-white"}`}>{item}</button>)}
        </div>
        <BroadcastsSection />

        {/* Loading State */}
        {loading && (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && visibleNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lucid-panel text-center py-16 px-6"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-4">
              <Bell className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="lucid-display text-2xl text-foreground mb-1">No activity yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              When someone likes, comments, or follows you, it'll show up here.
            </p>
          </motion.div>
        )}

        {/* Notifications List */}
        {!loading && visibleNotifications.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence>
              {visibleNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.25 }}
                >
                  <NotificationCard
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
