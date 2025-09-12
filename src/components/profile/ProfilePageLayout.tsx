
import React from "react";

interface ProfilePageLayoutProps {
  children: React.ReactNode;
}

const ProfilePageLayout = ({ children }: ProfilePageLayoutProps) => (
  <div className="min-h-screen starry-background pt-safe-top px-4 pb-4 pl-safe-left pr-safe-right">
    <div className="max-w-3xl mx-auto">{children}</div>
  </div>
);

export default ProfilePageLayout;
