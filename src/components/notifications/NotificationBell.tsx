import React from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative p-2 rounded-full transition-colors hover:bg-white/10"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5 text-foreground/70" />
      {unreadCount > 0 && (
        <span className={cn(
          "absolute top-0.5 right-0.5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold",
          unreadCount > 9 ? "min-w-[18px] h-[18px] px-1" : "w-[16px] h-[16px]"
        )}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
