
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pencil, Link, MessageSquare, Settings, Crown, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ProfileHeaderProps {
  isOwnProfile: boolean;
  profile: any;
  displayName: string;
  username: string;
  avatarUrl: string;
  dreamCount: number;
  followersCount: number;
  followingCount: number;
  bio: string;
  isFollowing: boolean;
  onEditProfile: () => void;
  onEditSocialLinks: () => void;
  onFollow: () => void;
  onMessage: () => void;
  onSettings: () => void;
  onManageSubscription: () => void;
  onNotifications: () => void;
}

const ProfileHeader = ({
  isOwnProfile,
  profile,
  displayName,
  username,
  avatarUrl,
  dreamCount,
  followersCount,
  followingCount,
  bio,
  isFollowing,
  onEditProfile,
  onEditSocialLinks,
  onFollow,
  onMessage,
  onSettings,
  onManageSubscription,
  onNotifications,
}: ProfileHeaderProps) => {
  const isPro = profile?.is_subscribed || false;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-primary">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-2xl">
              {displayName ? displayName[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          {isPro && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black"
            >
              PRO
            </Badge>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
            <div>
              <h1 className="text-2xl font-bold">{displayName || username || "User"}</h1>
              <p className="text-muted-foreground">@{username || "username"}</p>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-0">
              {isOwnProfile ? (
                <>
                  <Button variant="outline" size="sm" onClick={onEditProfile}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={onEditSocialLinks}>
                    <Link className="w-4 h-4 mr-1" />
                    Social Links
                  </Button>
                  <Button variant="outline" size="sm" onClick={onNotifications}>
                    <Bell className="w-4 h-4 mr-1" />
                    Notifications
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={onFollow}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={onMessage}>
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{bio || "No bio yet"}</p>
          </div>

          <div className="flex gap-6 mt-4">
            <div>
              <p className="text-sm font-medium">{dreamCount}</p>
              <p className="text-xs text-muted-foreground">Dreams</p>
            </div>
            <div>
              <p className="text-sm font-medium">{followersCount}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-sm font-medium">{followingCount}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <div className="flex flex-col gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={onSettings}>
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={onManageSubscription}>
              <Crown className="w-4 h-4 mr-1" />
              Subscription
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
