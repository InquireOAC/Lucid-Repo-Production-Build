import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, Megaphone, Trophy, Shield, Users, Plus, ChevronDown } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAdminStats } from "@/hooks/useAdminStats";
import CommunityStats from "@/components/admin/CommunityStats";
import AnnouncementComposer from "@/components/admin/AnnouncementComposer";
import AnnouncementsList from "@/components/admin/AnnouncementsList";
import PollComposer from "@/components/admin/PollComposer";
import ModerationQueue from "@/components/admin/ModerationQueue";
import UserManager from "@/components/admin/UserManager";
import ChallengeComposer from "@/components/admin/ChallengeComposer";
import ChallengeManager from "@/components/admin/ChallengeManager";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion } from "framer-motion";

const CollapsibleComposer = ({
  label,
  children,
  onCreated,
}: {
  label: string;
  children: (props: { onCreated: () => void }) => React.ReactNode;
  onCreated: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleCreated = () => {
    onCreated();
    setOpen(false);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between border-border/50 bg-card/50 backdrop-blur-sm h-11"
        >
          <span className="flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4 text-primary" />
            {label}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        {children({ onCreated: handleCreated })}
      </CollapsibleContent>
    </Collapsible>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useUserRole();
  const { stats } = useAdminStats();
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) return null;
  if (!isAdmin) { navigate("/"); return null; }

  const flagCount = stats.flaggedContent;

  const tabs = [
    { value: "stats", label: "Stats", icon: BarChart3 },
    { value: "announcements", label: "Announce", icon: Megaphone },
    { value: "events", label: "Events", icon: Trophy },
    { value: "moderation", label: "Moderate", icon: Shield, badge: flagCount },
    { value: "users", label: "Users", icon: Users },
  ];

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Enhanced Header */}
      <div className="sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-14 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-sm font-semibold">Admin Dashboard</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Command Center</p>
          </div>
          <div className="w-10" />
        </div>
        <div className="h-[2px] bg-gradient-to-r from-primary via-secondary to-primary" />
      </div>

      <div className="px-3 py-4 space-y-4 pb-24">
        <Tabs defaultValue="stats" className="w-full">
          {/* Scrollable Tab Bar with Icons */}
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
            <TabsList className="inline-flex w-auto min-w-full gap-1 bg-muted/30 backdrop-blur-sm p-1 h-auto">
              {tabs.map(({ value, label, icon: Icon, badge }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-1 min-w-[64px] flex flex-col items-center gap-1 py-2 px-3 text-[10px] relative data-[state=active]:bg-background/80"
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                    {badge != null && badge > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </div>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="stats" className="mt-4">
            <CommunityStats />
          </TabsContent>

          <TabsContent value="announcements" className="space-y-3 mt-4">
            <CollapsibleComposer label="New Announcement" onCreated={() => setRefreshKey(k => k + 1)}>
              {({ onCreated }) => <AnnouncementComposer onCreated={onCreated} />}
            </CollapsibleComposer>
            <CollapsibleComposer label="New Poll" onCreated={() => setRefreshKey(k => k + 1)}>
              {({ onCreated }) => <PollComposer onCreated={onCreated} />}
            </CollapsibleComposer>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">All Announcements</h3>
            <AnnouncementsList refreshKey={refreshKey} />
          </TabsContent>

          <TabsContent value="events" className="space-y-3 mt-4">
            <CollapsibleComposer label="New Challenge" onCreated={() => setRefreshKey(k => k + 1)}>
              {({ onCreated }) => <ChallengeComposer onCreated={onCreated} />}
            </CollapsibleComposer>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">All Challenges</h3>
            <ChallengeManager refreshKey={refreshKey} />
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
