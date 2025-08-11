import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationCard from "@/components/notifications/NotificationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell } from "lucide-react";

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white/60">Please sign in to view notifications</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Notifications</h1>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-purple-300 hover:text-white transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card p-4 rounded-xl border-white/10">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
            <p className="text-white/60">When someone interacts with your dreams, you'll see notifications here</p>
          </div>
        )}

        {/* Notifications List */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;