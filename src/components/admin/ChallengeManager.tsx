import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, ChevronDown, ChevronUp, Users, Hash, Pencil, Trash2 } from "lucide-react";
import { useChallenges, type Challenge, type ChallengeEntry } from "@/hooks/useChallenges";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { toast } from "sonner";
import ChallengeComposer from "./ChallengeComposer";
import EngagementStatsStrip from "./EngagementStatsStrip";

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  ended: "bg-muted text-muted-foreground",
  draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const ChallengeCard = ({
  challenge,
  onStatusChange,
  onEdit,
  onDelete,
  maxEntries,
}: {
  challenge: Challenge;
  onStatusChange: (id: string, status: string) => void;
  onEdit: (c: Challenge) => void;
  onDelete: (id: string) => void;
  maxEntries: number;
}) => {
  const { fetchEntries } = useChallenges();
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<ChallengeEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const toggleExpand = async () => {
    if (!expanded && entries.length === 0) {
      setLoadingEntries(true);
      const data = await fetchEntries(challenge.id);
      setEntries(data);
      setLoadingEntries(false);
    }
    setExpanded(!expanded);
  };

  const entryCount = challenge.entry_count || 0;
  const progressValue = maxEntries > 0 ? Math.min((entryCount / maxEntries) * 100, 100) : 0;

  return (
    <Card variant="compact">
      <CardContent className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {challenge.banner_image_url ? (
              <img
                src={challenge.banner_image_url}
                alt=""
                className="h-12 w-12 rounded-md object-cover shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{challenge.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-0.5">
                  <Hash className="h-3 w-3" />
                  {challenge.required_tag}
                </span>
                <span>·</span>
                <span>
                  {format(new Date(challenge.start_date), "MMM d")} – {format(new Date(challenge.end_date), "MMM d")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge className={`text-[9px] capitalize ${statusColors[challenge.status] || ""}`}>
              {challenge.status}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => onEdit(challenge)} className="h-7 w-7">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(challenge.id)} className="h-7 w-7">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {entryCount} {entryCount === 1 ? "entry" : "entries"}
            </span>
          </div>
          <Progress value={progressValue} className="h-1.5" />
        </div>

        {challenge.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{challenge.description}</p>
        )}

        <EngagementStatsStrip entityType="challenge" entityId={challenge.id} />

        <div className="flex items-center gap-1.5">
          {challenge.status === "draft" && (
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onStatusChange(challenge.id, "active")}>
              Activate
            </Button>
          )}
          {challenge.status === "active" && (
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onStatusChange(challenge.id, "ended")}>
              End
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-xs h-8 ml-auto" onClick={toggleExpand}>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Entries
          </Button>
        </div>

        {expanded && (
          <div className="border-t border-border/50 pt-2 space-y-1.5">
            {loadingEntries ? (
              <Skeleton className="h-8 w-full" />
            ) : entries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">No entries yet</p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  {entry.profile?.avatar_url && (
                    <img src={entry.profile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {entry.profile?.display_name || entry.profile?.username || "Anonymous"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {entry.dream?.title || "Dream"}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {format(new Date(entry.entered_at), "MMM d")}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const STATUS_FILTERS = ["all", "active", "draft", "ended"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const ChallengeManager = ({ refreshKey }: { refreshKey?: number }) => {
  const { challenges, isLoading, updateChallengeStatus, deleteChallenge, refetch } = useChallenges();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<Challenge | null>(null);

  React.useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return challenges;
    return challenges.filter((c) => c.status === statusFilter);
  }, [challenges, statusFilter]);

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await updateChallengeStatus(id, status);
    if (error) toast.error("Failed to update status");
    else toast.success(`Challenge ${status}!`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this challenge?")) return;
    const { error } = await deleteChallenge(id);
    if (error) toast.error("Failed to delete");
    else toast.success("Challenge deleted");
  };

  const maxEntries = Math.max(...challenges.map((c) => c.entry_count || 0), 1);

  return (
    <div className="space-y-3">
      {editing && (
        <ChallengeComposer
          editing={editing}
          onCancelEdit={() => setEditing(null)}
          onCreated={() => {
            setEditing(null);
            refetch();
          }}
        />
      )}

      <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] capitalize border transition-colors ${
              statusFilter === s
                ? "bg-foreground text-background border-foreground font-semibold"
                : "bg-transparent text-foreground/70 border-border/40 hover:bg-muted/30"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          {challenges.length === 0 ? "No challenges yet. Create one above!" : "No challenges match this filter."}
        </p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              onStatusChange={handleStatusChange}
              onEdit={setEditing}
              onDelete={handleDelete}
              maxEntries={maxEntries}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengeManager;
