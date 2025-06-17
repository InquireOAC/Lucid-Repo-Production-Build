
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionContext } from "@/contexts/SubscriptionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import SubscriptionManager from "./SubscriptionManager";
import ProfileStats from "./ProfileStats";
import ProfileDreams from "./ProfileDreams";
import ProfileLikedDreams from "./ProfileLikedDreams";

const ProfileContent = () => {
  const { user } = useAuth();
  const { subscription, isLoading } = useSubscriptionContext();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'dreams';
  });

  // Update active tab when URL search params change
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account and dreams</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dreams">My Dreams</TabsTrigger>
          <TabsTrigger value="liked">Liked Dreams</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="subscription">
            Subscription
            {subscription && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {subscription.plan}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dreams">
          <ProfileDreams />
        </TabsContent>

        <TabsContent value="liked">
          <ProfileLikedDreams />
        </TabsContent>

        <TabsContent value="stats">
          <ProfileStats />
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Subscription Management
                {subscription && (
                  <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {subscription 
                  ? `Manage your ${subscription.plan} subscription`
                  : "Subscribe to unlock premium features"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dream-purple"></div>
                </div>
              ) : (
                <SubscriptionManager currentPlan={subscription?.plan} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileContent;
