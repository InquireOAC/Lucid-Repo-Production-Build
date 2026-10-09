
import React from "react";

interface ProfileStatsBarProps {
  dreamCount: number;
  cinematicsCount?: number;
  followersCount: number;
  followingCount: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const ProfileStatsBar = ({
  dreamCount,
  cinematicsCount,
  followersCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
}: ProfileStatsBarProps) => (
  <div className="flex items-center justify-center gap-6 mt-4">
    <div className="text-center">
      <p className="font-bold">{dreamCount}</p>
      <p className="text-xs text-muted-foreground">Dreams</p>
    </div>
    {cinematicsCount !== undefined && (
      <div className="text-center">
        <p className="font-bold">{cinematicsCount}</p>
        <p className="text-xs text-muted-foreground">Cinematics</p>
      </div>
    )}
    <button className="text-center cursor-pointer" onClick={onFollowersClick} type="button">
      <p className="font-bold">{followersCount}</p>
      <p className="text-xs text-muted-foreground underline">Followers</p>
    </button>
    <button className="text-center cursor-pointer" onClick={onFollowingClick} type="button">
      <p className="font-bold">{followingCount}</p>
      <p className="text-xs text-muted-foreground underline">Following</p>
    </button>
  </div>
);

export default ProfileStatsBar;
