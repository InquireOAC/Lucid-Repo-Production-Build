
import React from "react";

interface ProfilePageLayoutProps {
  children: React.ReactNode;
}

const ProfilePageLayout = ({ children }: ProfilePageLayoutProps) => (
  <div className="min-h-screen starry-background pt-safe-top pb-4">
    <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">{children}</div>
  </div>
);

export default ProfilePageLayout;
