
import React from "react";

interface ProfilePageLayoutProps {
  children: React.ReactNode;
}

const ProfilePageLayout = ({ children }: ProfilePageLayoutProps) => (
  <div className="min-h-screen starry-background p-4">
    <div className="max-w-3xl mx-auto">{children}</div>
  </div>
);

export default ProfilePageLayout;
