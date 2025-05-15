
import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ProfileCard({
  profile,
  followersCount,
  followingCount,
  isFollowing,
  onFollowToggle,
  canFollow,
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow flex flex-col items-center">
      <Avatar className="h-20 w-20 mb-2">
        <AvatarImage src={profile.profile_picture} alt={profile.username} />
      </Avatar>
      <h3 className="font-bold text-lg">{profile.username}</h3>
      <p className="text-sm text-gray-500">{profile.bio}</p>
      <div className="flex gap-5 mt-2 text-xs text-muted-foreground">
        <div>
          <span className="font-bold">{followersCount}</span>
          <span> Followers</span>
        </div>
        <div>
          <span className="font-bold">{followingCount}</span>
          <span> Following</span>
        </div>
      </div>
      {canFollow && (
        <Button className="mt-2" onClick={onFollowToggle}>
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}
    </div>
  );
}
