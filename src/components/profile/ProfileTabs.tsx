import React from "react";
import { Moon, Heart } from "lucide-react";
import PosterRail from "@/components/repos/netflix/PosterRail";
import PosterCard from "@/components/repos/netflix/PosterCard";

interface ProfileTabsProps {
  publicDreams: any[];
  likedDreams: any[];
  isOwnProfile: boolean;
  refreshDreams?: () => void;
  userId?: string;
}

const EmptySection = ({
  icon: Icon,
  title,
  message,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
}) => (
  <div className="text-center py-12 px-4">
    <Icon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
    <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
    <p className="text-xs text-muted-foreground max-w-xs mx-auto">{message}</p>
  </div>
);

const ProfileTabs = ({
  publicDreams,
  likedDreams,
  isOwnProfile,
}: ProfileTabsProps) => {
  return (
    <div className="px-4 space-y-6 mt-2 pb-10">
      {/* Dreams */}
      {publicDreams.length > 0 ? (
        <PosterRail title="Dreams">
          {publicDreams.map((d) => (
            <PosterCard key={d.id} dream={d} />
          ))}
        </PosterRail>
      ) : (
        <EmptySection
          icon={Moon}
          title="No public dreams yet"
          message={
            isOwnProfile
              ? "Share your dreams to the Lucid Repo to see them here"
              : "This dreamer hasn't shared any dreams yet"
          }
        />
      )}

      {/* Liked dreams */}
      {likedDreams.length > 0 && (
        <PosterRail title="Liked">
          {likedDreams.map((d) => (
            <PosterCard key={d.id} dream={d} />
          ))}
        </PosterRail>
      )}
    </div>
  );
};

export default ProfileTabs;
