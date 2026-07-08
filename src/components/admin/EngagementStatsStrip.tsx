import React from "react";
import { Eye, MousePointerClick, X as XIcon, UserPlus, Trophy } from "lucide-react";
import { useAdminEngagementStats } from "@/hooks/useAdminEngagementStats";
import type { EngagementEntityType } from "@/hooks/useEngagement";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  entityType: EngagementEntityType;
  entityId: string;
  className?: string;
}

const Stat: React.FC<{ icon: React.ReactNode; value: number | string; label: string; rate?: string }> = ({
  icon,
  value,
  label,
  rate,
}) => (
  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
    <span className="text-muted-foreground/70">{icon}</span>
    <span>
      <span className="text-foreground font-semibold">{value}</span> {label}
      {rate && <span className="text-muted-foreground/60"> · {rate}</span>}
    </span>
  </div>
);

const fmtPct = (v: number) => `${Math.round(v * 100)}%`;

const EngagementStatsStrip: React.FC<Props> = ({ entityType, entityId, className }) => {
  const { stats, isLoading } = useAdminEngagementStats(entityType, entityId);

  if (isLoading) {
    return <Skeleton className={cn("h-4 w-3/4", className)} />;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      <Stat icon={<Eye className="h-3 w-3" />} value={stats.views} label="views" />
      <Stat
        icon={<MousePointerClick className="h-3 w-3" />}
        value={stats.clicks}
        label="clicks"
        rate={stats.views > 0 ? fmtPct(stats.ctr) : undefined}
      />
      <Stat
        icon={<XIcon className="h-3 w-3" />}
        value={stats.dismissals}
        label="dismiss"
        rate={stats.views > 0 ? fmtPct(stats.dismiss_rate) : undefined}
      />
      {entityType === "event" && stats.rsvps > 0 && (
        <Stat icon={<UserPlus className="h-3 w-3" />} value={stats.rsvps} label="RSVPs" />
      )}
      {entityType === "challenge" && stats.entries > 0 && (
        <Stat icon={<Trophy className="h-3 w-3" />} value={stats.entries} label="entries" />
      )}
    </div>
  );
};

export default EngagementStatsStrip;
