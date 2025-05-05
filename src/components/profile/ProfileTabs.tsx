
import React from "react";
import { Moon, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DreamGrid from "./DreamGrid";

interface ProfileTabsProps {
  publicDreams: any[];
  likedDreams: any[];
  isOwnProfile: boolean;
}

const ProfileTabs = ({ publicDreams, likedDreams, isOwnProfile }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="dreams" className="mt-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="dreams">Dreams</TabsTrigger>
        <TabsTrigger value="likes">Liked Dreams</TabsTrigger>
      </TabsList>
      
      <TabsContent value="dreams" className="mt-4">
        <DreamGrid 
          dreams={publicDreams}
          isOwnProfile={isOwnProfile}
          emptyTitle="No public dreams yet"
          emptyMessage={{
            own: "Share your dreams to the Lucid Repo to see them here",
            other: "This user hasn't shared any dreams yet"
          }}
          emptyIcon={<Moon size={32} className="mx-auto mb-2 text-muted-foreground" />}
          actionLink="/"
          actionText="Go to Journal"
        />
      </TabsContent>
      
      <TabsContent value="likes" className="mt-4">
        <DreamGrid 
          dreams={likedDreams}
          isLiked={true}
          isOwnProfile={isOwnProfile}
          emptyTitle="No liked dreams yet"
          emptyMessage={{
            own: "Explore the Lucid Repo to discover and like dreams",
            other: "This user hasn't liked any dreams yet"
          }}
          emptyIcon={<Heart size={32} className="mx-auto mb-2 text-muted-foreground" />}
          actionLink="/lucidrepo"
          actionText="Explore Dreams"
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
