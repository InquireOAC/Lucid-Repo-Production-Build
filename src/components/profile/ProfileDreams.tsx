
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileDreams } from "@/hooks/useProfileDreams";
import ProfileDreamList from "@/components/social/ProfileDreamList";

const ProfileDreams = () => {
  const { user } = useAuth();
  const { publicDreams, isLoading, refreshDreams } = useProfileDreams(user);

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

  if (publicDreams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Dreams</CardTitle>
          <CardDescription>Your public dreams will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No public dreams yet. Start sharing your dreams with the community!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Dreams ({publicDreams.length})</CardTitle>
        <CardDescription>Your public dreams</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileDreamList 
          dreams={publicDreams} 
          user={user} 
          refreshLikedDreams={refreshDreams}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileDreams;
