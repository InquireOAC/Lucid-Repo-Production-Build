import React from "react";
import { Moon, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DreamGrid from "./DreamGrid";

interface ProfileTabsProps {
  publicDreams: any[];
  likedDreams: any[];
  isOwnProfile: boolean;
  refreshDreams?: () => void;
}

const ProfileTabs = ({ publicDreams, likedDreams, isOwnProfile, refreshDreams }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="dreams" className="mt-4">
      <TabsList className="w-full justify-start border-b border-primary/10 bg-transparent rounded-none p-0 h-auto">
        <TabsTrigger 
          value="dreams"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
        >
          Dreams
        </TabsTrigger>
        <TabsTrigger 
          value="likes"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
        >
          Likes
        </TabsTrigger>
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
          refreshDreams={refreshDreams}
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
          actionLink="/lucid-repo"
          actionText="Explore Dreams"
          refreshDreams={refreshDreams}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
