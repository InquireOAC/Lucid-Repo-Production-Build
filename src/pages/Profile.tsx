
// Profile page entrypoint
import React from "react";
import ProfilePageLayout from "@/components/profile/ProfilePageLayout";
import ProfileContent from "@/components/profile/ProfileContent";

const Profile = () => {
  return (
    <ProfilePageLayout>
      <ProfileContent />
    </ProfilePageLayout>
  );
};

export default Profile;
