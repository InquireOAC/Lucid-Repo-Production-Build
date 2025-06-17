
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileStats } from "@/hooks/useProfileStats";

const ProfileStats = () => {
  const { user } = useAuth();
  const { dreamCount, followersCount, followingCount } = useProfileStats(user);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics</CardTitle>
        <CardDescription>Your dream and social activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-dream-purple">{dreamCount}</div>
            <div className="text-sm text-muted-foreground">Dreams</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-dream-purple">{followersCount}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-dream-purple">{followingCount}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStats;
