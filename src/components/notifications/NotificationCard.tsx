import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

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
    };
    dream?: {
      title?: string;
      content?: string;
    };
    message_content?: string;
  };
  onMarkAsRead: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-400" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-400" />;
      case 'message':
        return <Mail className="h-5 w-5 text-blue-400" />;
      case 'follow':
        return <User className="h-5 w-5 text-green-400" />;
      default:
        return <Heart className="h-5 w-5 text-gray-400" />;
    }
  };

  const getNotificationText = () => {
    const userName = notification.user?.display_name || notification.user?.username || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${userName} liked your dream`;
      case 'comment':
        return `${userName} commented on your dream`;
      case 'message':
        return `${userName} sent you a message`;
      case 'follow':
        return `${userName} started following you`;
      default:
        return `${userName} interacted with your content`;
    }
  };

  const getContentSnippet = () => {
    if (notification.type === 'message' && notification.message_content) {
      return notification.message_content.slice(0, 80) + (notification.message_content.length > 80 ? '...' : '');
    }
    
    if (notification.dream?.title) {
      return `"${notification.dream.title}"`;
    }
    
    if (notification.dream?.content) {
      return `"${notification.dream.content.slice(0, 50)}${notification.dream.content.length > 50 ? '...' : ''}"`;
    }
    
    return null;
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'message') {
      navigate('/profile'); // Navigate to profile where messages are handled
    } else if (notification.dream_id) {
      navigate(`/lucid-repo/${notification.dream_id}`);
    } else if (notification.user?.username) {
      navigate(`/profile/${notification.user.username}`);
    }
  };

  const getUserAvatar = () => {
    if (notification.user?.avatar_symbol) {
      return (
        <div 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium",
            notification.user.avatar_color || "bg-gradient-to-br from-blue-400/30 to-blue-300/30"
          )}
        >
          {notification.user.avatar_symbol}
        </div>
      );
    }
    
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-400/30 to-blue-300/30 rounded-full flex items-center justify-center">
        <span className="text-white/80 font-medium text-sm">
          {(notification.user?.display_name || notification.user?.username || 'U').charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "glass-card p-4 rounded-xl border-white/10 cursor-pointer transition-all duration-200 hover:bg-white/5",
        !notification.read && "bg-gradient-to-r from-blue-500/10 to-blue-400/10 border-blue-300/20"
      )}
    >
      <div className="flex items-start gap-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {getUserAvatar()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getNotificationIcon()}
            <p className="text-white/90 text-sm font-medium">
              {getNotificationText()}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
            )}
          </div>
          
          {/* Content snippet */}
          {getContentSnippet() && (
            <p className="text-white/60 text-sm mb-2 line-clamp-2">
              {getContentSnippet()}
            </p>
          )}
          
          {/* Timestamp */}
          <p className="text-white/40 text-xs">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;