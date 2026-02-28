import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Users, Moon, Globe, AlertTriangle, Megaphone, CreditCard, Trophy, MessageSquare, UserCheck, Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const heroStats = [
  { key: "totalUsers" as const, label: "Total Users", icon: Users },
  { key: "weeklyActiveUsers" as const, label: "Weekly Active", icon: UserCheck },
  { key: "publicDreams" as const, label: "Public Dreams", icon: Globe },
  { key: "flaggedContent" as const, label: "Pending Flags", icon: AlertTriangle },
];

const secondaryStats = [
  { key: "totalDreams" as const, label: "Total Dreams", icon: Moon },
  { key: "activeAnnouncements" as const, label: "Announcements", icon: Megaphone },
  { key: "activeSubscriptions" as const, label: "Active Subs", icon: CreditCard },
  { key: "totalChallenges" as const, label: "Challenges", icon: Trophy },
  { key: "activeChallengeEntries" as const, label: "Entries", icon: Hash },
  { key: "totalComments" as const, label: "Comments", icon: MessageSquare },
];

const CommunityStats = () => {
  const { stats, isLoading } = useAdminStats();

  return (
    <div className="space-y-4">
      {/* Hero Stats Row */}
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-3 px-3 pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        {heroStats.map(({ key, label, icon: Icon }) => (
          <Card
            key={key}
            variant="glass"
            className="flex-shrink-0 w-[130px] border-primary/20"
          >
            <CardContent className="p-3 flex flex-col items-center text-center gap-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 ring-1 ring-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              {isLoading ? (
                <Skeleton className="h-7 w-14" />
              ) : (
                <p className="text-2xl font-bold tracking-tight">{stats[key]}</p>
              )}
              <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        {secondaryStats.map(({ key, label, icon: Icon }) => (
          <Card key={key} variant="glass" className="col-span-1">
            <CardContent className="p-2.5 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-muted/50">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                {isLoading ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  <p className="text-sm font-semibold">{stats[key]}</p>
                )}
                <p className="text-[9px] text-muted-foreground truncate">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityStats;
