import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, MessageSquare, Settings, UserPlus } from "lucide-react";
import { Twitter, Instagram, Facebook, Globe } from "lucide-react";

interface ProfileHeaderProps {
  profileToShow: any;
  isOwnProfile: boolean;
  dreamCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  setIsEditProfileOpen: (value: boolean) => void;
  setIsMessagesOpen: (value: boolean) => void;
  setIsSettingsOpen: (value: boolean) => void;
  setIsSocialLinksOpen: (value: boolean) => void;
  handleFollow: () => void;
  handleStartConversation: () => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const ProfileHeader = ({
  profileToShow,
  isOwnProfile,
  dreamCount,
  followersCount,
  followingCount,
  isFollowing,
  setIsEditProfileOpen,
  setIsMessagesOpen,
  setIsSettingsOpen,
  setIsSocialLinksOpen,
  handleFollow,
  handleStartConversation,
  onFollowersClick,
  onFollowingClick
}: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col items-center mb-6 pt-4">
      <div className="relative">
        <Avatar className="w-24 h-24 border-4 border-dream-lavender">
          <AvatarImage src={profileToShow?.avatar_url} />
          <AvatarFallback className="bg-dream-purple/20 text-dream-purple">
            {profileToShow?.username ? profileToShow.username[0].toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        {isOwnProfile && (
          <Button 
            size="icon" 
            variant="outline" 
            className="absolute bottom-0 right-0 rounded-full bg-white shadow-md p-1 h-8 w-8"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <Edit size={14} />
          </Button>
        )}
      </div>
      
      <h1 className="text-xl font-bold mt-3">
        {profileToShow?.display_name || profileToShow?.username || "New Dreamer"}
      </h1>
      <p className="text-sm text-muted-foreground">@{profileToShow?.username || "username"}</p>
      
      {profileToShow?.bio && (
        <p className="text-sm text-center mt-2 max-w-md">{profileToShow.bio}</p>
      )}
      
      {/* Social Links */}
      {profileToShow?.social_links && (
        <div className="flex items-center gap-2 mt-2">
          {profileToShow.social_links.twitter && (
            <a 
              href={`https://twitter.com/${profileToShow.social_links.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-500"
            >
              <Twitter size={16} />
            </a>
          )}
          
          {profileToShow.social_links.instagram && (
            <a 
              href={`https://instagram.com/${profileToShow.social_links.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-600"
            >
              <Instagram size={16} />
            </a>
          )}
          
          {profileToShow.social_links.facebook && (
            <a 
              href={`https://facebook.com/${profileToShow.social_links.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              <Facebook size={16} />
            </a>
          )}
          
          {profileToShow.social_links.website && (
            <a 
              href={profileToShow.social_links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800"
            >
              <Globe size={16} />
            </a>
          )}
          
          {isOwnProfile && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsSocialLinksOpen(true)}
              className="h-6 text-xs px-2 ml-1"
            >
              <Edit size={10} className="mr-1" /> Edit
            </Button>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-center gap-4 mt-4">
        <div className="text-center">
          <p className="font-bold">{dreamCount}</p>
          <p className="text-xs text-muted-foreground">Dreams</p>
        </div>
        <button
          className="text-center cursor-pointer"
          onClick={onFollowersClick}
          type="button"
        >
          <p className="font-bold">{followersCount}</p>
          <p className="text-xs text-muted-foreground underline">Followers</p>
        </button>
        <button
          className="text-center cursor-pointer"
          onClick={onFollowingClick}
          type="button"
        >
          <p className="font-bold">{followingCount}</p>
          <p className="text-xs text-muted-foreground underline">Following</p>
        </button>
      </div>
      
      <div className="flex gap-2 mt-4">
        {isOwnProfile ? (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsMessagesOpen(true)}
              className="flex items-center gap-1 text-sm"
            >
              <MessageSquare size={14} /> Messages
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1 text-sm"
            >
              <Settings size={14} /> Settings
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              onClick={handleFollow}
              className="flex items-center gap-1 text-sm"
            >
              <UserPlus size={14} /> {isFollowing ? "Unfollow" : "Follow"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleStartConversation}
              className="flex items-center gap-1 text-sm"
            >
              <MessageSquare size={14} /> Message
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
