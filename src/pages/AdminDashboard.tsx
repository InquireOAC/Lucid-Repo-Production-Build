import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import CommunityStats from "@/components/admin/CommunityStats";
import AnnouncementComposer from "@/components/admin/AnnouncementComposer";
import AnnouncementsList from "@/components/admin/AnnouncementsList";
import PollComposer from "@/components/admin/PollComposer";
import ModerationQueue from "@/components/admin/ModerationQueue";
import UserManager from "@/components/admin/UserManager";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useUserRole();
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) return null;
  if (!isAdmin) { navigate("/"); return null; }

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-30">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold">Admin Dashboard</h1>
        <div className="w-10" />
      </div>

      <div className="px-4 py-4 space-y-6 pb-24">
        <CommunityStats />

        <Tabs defaultValue="announcements" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="announcements" className="flex-1 text-xs">Announce</TabsTrigger>
            <TabsTrigger value="polls" className="flex-1 text-xs">Polls</TabsTrigger>
            <TabsTrigger value="moderation" className="flex-1 text-xs">Moderate</TabsTrigger>
            <TabsTrigger value="users" className="flex-1 text-xs">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4 mt-4">
            <AnnouncementComposer onCreated={() => setRefreshKey(k => k + 1)} />
            <h3 className="text-sm font-semibold text-muted-foreground">All Announcements</h3>
            <AnnouncementsList refreshKey={refreshKey} />
          </TabsContent>

          <TabsContent value="polls" className="space-y-4 mt-4">
            <PollComposer onCreated={() => setRefreshKey(k => k + 1)} />
            <h3 className="text-sm font-semibold text-muted-foreground">Active Polls</h3>
            <AnnouncementsList refreshKey={refreshKey} />
          </TabsContent>

          <TabsContent value="moderation" className="mt-4">
            <ModerationQueue />
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <UserManager />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
