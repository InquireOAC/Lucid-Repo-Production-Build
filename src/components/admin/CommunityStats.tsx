import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Users, Moon, Globe, AlertTriangle, Megaphone, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statCards = [
  { key: "totalUsers" as const, label: "Total Users", icon: Users },
  { key: "totalDreams" as const, label: "Total Dreams", icon: Moon },
  { key: "publicDreams" as const, label: "Public Dreams", icon: Globe },
  { key: "flaggedContent" as const, label: "Pending Flags", icon: AlertTriangle },
  { key: "activeAnnouncements" as const, label: "Active Announcements", icon: Megaphone },
  { key: "activeSubscriptions" as const, label: "Active Subs", icon: CreditCard },
];

const CommunityStats = () => {
  const { stats, isLoading } = useAdminStats();

  return (
    <div className="grid grid-cols-2 gap-3">
      {statCards.map(({ key, label, icon: Icon }) => (
        <Card key={key} variant="glass" className="col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <p className="text-xl font-bold">{stats[key]}</p>
              )}
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommunityStats;
