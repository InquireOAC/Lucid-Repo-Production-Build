
/**
 * Compute which profile to show (own or other), and the ID for further profile-related hooks.
 */
export function computeProfileTargets({
  user,
  profile,
  viewedProfile,
  isOwnProfile,
  effectiveIdentifier,
}: {
  user: any;
  profile: any;
  viewedProfile: any;
  isOwnProfile: boolean;
  effectiveIdentifier: string | undefined;
}) {
  let profileToShow = null;
  let profileIdForHooks: string | null = null;
  if (isOwnProfile) {
    profileToShow = profile;
    profileIdForHooks = profile?.id ?? null;
  } else {
    profileToShow = viewedProfile;
    profileIdForHooks = viewedProfile?.id ?? null;
  }
  return { profileToShow, profileIdForHooks };
}
