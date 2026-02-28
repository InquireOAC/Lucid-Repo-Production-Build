import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Mail, UserPlus, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import SymbolAvatar from "@/components/profile/SymbolAvatar";

interface NotificationCardProps {
  notification: {
    id: string;
    type: string;
    user_id: string;
    target_user_id: string;
    dream_id?: string;
    created_at: string;
    read?: boolean;
    user?: {
      display_name?: string;
      username?: string;
      avatar_symbol?: string;
      avatar_color?: string;
      avatar_url?: string;
    };
    dream?: {
      title?: string;
      content?: string;
    };
    comment_text?: string;
    message_content?: string;
  };
  onMarkAsRead: (id: string) => void;
}

const iconConfig: Record<string, { icon: typeof Heart; color: string; bg: string }> = {
  like: { icon: Heart, color: "text-red-400", bg: "bg-red-500/10" },
  comment: { icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
  message: { icon: Mail, color: "text-accent-foreground", bg: "bg-accent" },
  follow: { icon: UserPlus, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  share: { icon: Share2, color: "text-amber-400", bg: "bg-amber-500/10" },
};

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();

  const config = iconConfig[notification.type] || iconConfig.like;
  const Icon = config.icon;

  const userName = notification.user?.display_name || notification.user?.username || "Someone";

  const getText = () => {
    switch (notification.type) {
      case "like": return <><strong>{userName}</strong> liked your dream</>;
      case "comment": return <><strong>{userName}</strong> commented on your dream</>;
      case "message": return <><strong>{userName}</strong> sent you a message</>;
      case "follow": return <><strong>{userName}</strong> started following you</>;
      case "share": return <><strong>{userName}</strong> shared your dream</>;
      default: return <><strong>{userName}</strong> interacted with your content</>;
    }
  };

  const getSnippet = () => {
    // Comment notifications: show comment text
    if (notification.type === "comment" && notification.comment_text) {
      const text = notification.comment_text.slice(0, 100);
      return `"${text}${notification.comment_text.length > 100 ? "…" : ""}"`;
    }
    // Message notifications: show message content
    if (notification.type === "message" && notification.message_content) {
      return notification.message_content.slice(0, 80) + (notification.message_content.length > 80 ? "…" : "");
    }
    // Like/share: show dream title
    if ((notification.type === "like" || notification.type === "share") && notification.dream?.title) {
      return `"${notification.dream.title}"`;
    }
    return null;
  };

  const handleClick = () => {
    if (!notification.read) onMarkAsRead(notification.id);
    if (notification.type === "message") navigate("/profile");
    else if (notification.dream_id) navigate(`/lucid-repo/${notification.dream_id}`);
    else if (notification.user?.username) navigate(`/profile/${notification.user.username}`);
  };

  const snippet = getSnippet();

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
        "hover:bg-muted/40 active:scale-[0.99]",
        !notification.read
          ? "bg-primary/[0.04] border border-primary/10"
          : "border border-transparent"
      )}
    >
      {/* Avatar with type badge */}
      <div className="flex-shrink-0">
        <SymbolAvatar
          symbol={notification.user?.avatar_symbol}
          color={notification.user?.avatar_color}
          avatarUrl={notification.user?.avatar_url}
          fallbackLetter={(notification.user?.display_name || notification.user?.username || "U").charAt(0).toUpperCase()}
          size={40}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          {getText()}
        </p>
        {snippet && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate italic">{snippet}</p>
        )}
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
      )}
    </button>
  );
};

export default NotificationCard;
