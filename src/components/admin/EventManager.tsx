import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Pencil, Trash2 } from "lucide-react";
import { useEvents, type CommunityEvent } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import EventComposer from "./EventComposer";
import EngagementStatsStrip from "./EngagementStatsStrip";

const statusColors: Record<string, string> = {
  published: "bg-green-500/20 text-green-400 border-green-500/30",
  ended: "bg-muted text-muted-foreground",
  draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  archived: "bg-muted text-muted-foreground",
};

const EventCard = ({
  event,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  event: CommunityEvent;
  onStatusChange: (id: string, status: CommunityEvent["status"]) => void;
  onEdit: (e: CommunityEvent) => void;
  onDelete: (id: string) => void;
}) => {
  const rsvpCount = event.rsvp_count || 0;

  return (
    <Card variant="compact">
      <CardContent className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {event.banner_image_url ? (
              <img
                src={event.banner_image_url}
                alt=""
                className="h-12 w-12 rounded-md object-cover shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{event.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                <span>{format(new Date(event.starts_at), "MMM d, h:mm a")}</span>
                {event.location && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge className={`text-[9px] capitalize ${statusColors[event.status] || ""}`}>
              {event.status}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => onEdit(event)} className="h-7 w-7">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)} className="h-7 w-7">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>

        {event.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
        )}

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {rsvpCount} {rsvpCount === 1 ? "RSVP" : "RSVPs"}
          </span>
        </div>

        <EngagementStatsStrip entityType="event" entityId={event.id} />

        <div className="flex items-center gap-1.5">
          {event.status === "draft" && (
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onStatusChange(event.id, "published")}>
              Publish
            </Button>
          )}
          {event.status === "published" && (
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onStatusChange(event.id, "ended")}>
              Mark Ended
            </Button>
          )}
          {event.status === "ended" && (
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => onStatusChange(event.id, "archived")}>
              Archive
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const STATUS_FILTERS = ["all", "published", "draft", "ended", "archived"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const EventManager = ({ refreshKey }: { refreshKey?: number }) => {
  const { events, isLoading, updateStatus, deleteEvent, refetch } = useEvents({ adminView: true });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<CommunityEvent | null>(null);

  React.useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return events;
    return events.filter((e) => e.status === statusFilter);
  }, [events, statusFilter]);

  const handleStatusChange = async (id: string, status: CommunityEvent["status"]) => {
    const { error } = await updateStatus(id, status);
    if (error) toast.error("Failed to update status");
    else toast.success(`Event ${status}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await deleteEvent(id);
    if (error) toast.error("Failed to delete");
    else toast.success("Event deleted");
  };

  return (
    <div className="space-y-3">
      {editing && (
        <EventComposer
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
          {events.length === 0 ? "No events yet. Create one above!" : "No events match this filter."}
        </p>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onStatusChange={handleStatusChange}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventManager;
