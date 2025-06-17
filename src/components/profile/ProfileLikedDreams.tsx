
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileDreams } from "@/hooks/useProfileDreams";
import ProfileDreamList from "@/components/social/ProfileDreamList";

const ProfileLikedDreams = () => {
  const { user } = useAuth();
  const { likedDreams, isLoading, fetchLikedDreams } = useProfileDreams(user);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dream-purple"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (likedDreams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liked Dreams</CardTitle>
          <CardDescription>Dreams you've liked will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No liked dreams yet. Start exploring and liking dreams in the community!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liked Dreams ({likedDreams.length})</CardTitle>
        <CardDescription>Dreams you've liked</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileDreamList 
          dreams={likedDreams} 
          user={user} 
          refreshLikedDreams={fetchLikedDreams}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileLikedDreams;
