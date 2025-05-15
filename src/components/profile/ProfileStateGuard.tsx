
import React from "react";
import ProfileLoadingScreen from "./ProfileLoadingScreen";
import ProfileNotFound from "./ProfileNotFound";
import ProfileEmpty from "./ProfileEmpty";

type Props = {
  loading: boolean;
  effectiveIdentifier: string | undefined;
  user: any;
  profile: any;
  isOwnProfile: boolean;
  viewedProfile: any;
  children: React.ReactNode;
};

/**
 * Handles loading, missing state, and guards for the profile page.
 */
export default function ProfileStateGuard({
  loading,
  effectiveIdentifier,
  user,
  profile,
  isOwnProfile,
  viewedProfile,
  children,
}: Props) {
  if (loading) return <ProfileLoadingScreen />;
  if (!user) return <ProfileLoadingScreen />;

  // 404 (other user)
  if (
    !isOwnProfile &&
    effectiveIdentifier &&
    effectiveIdentifier !== user?.id &&
    effectiveIdentifier !== profile?.username &&
    !viewedProfile
  ) {
    return <ProfileNotFound />;
  }
  // If profileToShow is empty
  if (
    viewedProfile &&
    !viewedProfile.display_name &&
    !viewedProfile.username &&
    !viewedProfile.bio &&
    !viewedProfile.avatar_url
  ) {
    return <ProfileEmpty />;
  }

  // If all good
  return <>{children}</>;
}
