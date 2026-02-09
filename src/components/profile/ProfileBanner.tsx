import React from "react";

interface ProfileBannerProps {
  className?: string;
}

const ProfileBanner = ({ className }: ProfileBannerProps) => {
  return (
    <div className={`profile-banner h-32 sm:h-40 w-full ${className || ''}`}>
      <div className="w-full h-full bg-gradient-to-r from-aurora-purple/40 via-aurora-violet/30 to-aurora-blue/40" />
    </div>
  );
};

export default ProfileBanner;
