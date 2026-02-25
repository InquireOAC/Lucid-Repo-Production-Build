import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface FlagWithDream {
  id: string;
  reason: string;
  additional_notes: string | null;
  flagged_content_type: string;
  flagged_content_id: string;
  flagged_user_id: string;
  reporter_user_id: string;
  created_at: string;
  status: string;
  dream?: {
    title: string;
    content: string;
    image_url: string | null;
    is_public: boolean | null;
  };
  dreamAuthor?: string;
  reporter?: string;
}

const ModerationQueue = () => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FlagWithDream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<FlagWithDream | null>(null);
  const [acting, setActing] = useState(false);

  const fetchFlags = async () => {
    const { data: rawFlags } = await supabase
      .from("content_flags")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!rawFlags || rawFlags.length === 0) {
      setFlags([]);
      setIsLoading(false);
      return;
    }

    // Batch-fetch related dream entries
    const dreamIds = [...new Set(rawFlags.map((f) => f.flagged_content_id))];
    const { data: dreams } = await supabase
      .from("dream_entries")
      .select("id, title, content, image_url, is_public, user_id")
      .in("id", dreamIds);

    // Batch-fetch profiles for dream authors + reporters
    const allUserIds = [
      ...new Set([
        ...rawFlags.map((f) => f.flagged_user_id),
        ...rawFlags.map((f) => f.reporter_user_id),
      ]),
    ];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", allUserIds);

    const dreamMap = new Map(dreams?.map((d) => [d.id, d]) || []);
    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const enriched: FlagWithDream[] = rawFlags.map((f) => {
      const dream = dreamMap.get(f.flagged_content_id);
      const author = profileMap.get(f.flagged_user_id);
      const reporter = profileMap.get(f.reporter_user_id);
      return {
        ...f,
        dream: dream
          ? {
              title: dream.title,
              content: dream.content,
              image_url: dream.image_url,
              is_public: dream.is_public,
            }
          : undefined,
        dreamAuthor:
          author?.display_name || author?.username || "Unknown",
        reporter:
          reporter?.display_name || reporter?.username || "Unknown",
      };
    });

    setFlags(enriched);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const resolveFlag = async (
    id: string,
    status: string,
    action?: "hide" | "delete"
  ) => {
    if (!user) return;
    setActing(true);

    const flag = flags.find((f) => f.id === id);

    // Perform content action first
    if (action === "hide" && flag) {
      await supabase
        .from("dream_entries")
        .update({ is_public: false })
        .eq("id", flag.flagged_content_id);
    } else if (action === "delete" && flag) {
      await supabase
        .from("dream_entries")
        .delete()
        .eq("id", flag.flagged_content_id);
    }

    // Then mark flag as resolved/dismissed
    await supabase
      .from("content_flags")
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    const label =
      action === "hide"
        ? "Content hidden"
        : action === "delete"
        ? "Dream deleted"
        : `Flag ${status}`;
    toast.success(label);
    setSelected(null);
    setActing(false);
    fetchFlags();
  };

  if (isLoading)
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Loading...
      </p>
    );
  if (flags.length === 0)
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No pending flags 🎉
      </p>
    );

  return (
    <>
      <div className="space-y-3">
        {flags.map((flag) => (
          <Card
            key={flag.id}
            variant="compact"
            className="cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => setSelected(flag)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="destructive" className="text-[10px]">
                  {flag.reason}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {flag.flagged_content_type}
                </span>
              </div>
              {flag.dream ? (
                <>
                  <p className="text-sm font-medium truncate">
                    {flag.dream.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {flag.dream.content}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Content not found
                </p>
              )}
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px] text-muted-foreground">
                  Reported by {flag.reporter} •{" "}
                  {format(new Date(flag.created_at), "MMM d, yyyy")}
                </p>
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Flagged Content Review</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {selected.dream?.image_url && (
                <img
                  src={selected.dream.image_url}
                  alt="Dream"
                  className="w-full rounded-lg max-h-60 object-cover"
                />
              )}

              {selected.dream ? (
                <>
                  <div>
                    <h3 className="font-semibold text-base">
                      {selected.dream.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      by @{selected.dreamAuthor} •{" "}
                      {selected.dream.is_public ? "Public" : "Private"}
                    </p>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {selected.dream.content}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Original content was not found or has been deleted.
                </p>
              )}

              <Separator />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-[10px]">
                    {selected.reason}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reporter: @{selected.reporter}
                </p>
                {selected.additional_notes && (
                  <p className="text-xs text-muted-foreground italic">
                    "{selected.additional_notes}"
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Flagged:{" "}
                  {format(
                    new Date(selected.created_at),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={acting || !selected?.dream}
              onClick={() =>
                selected &&
                resolveFlag(selected.id, "resolved", "hide")
              }
            >
              <EyeOff className="h-3.5 w-3.5 mr-1" />
              Hide
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={acting || !selected?.dream}
              onClick={() =>
                selected &&
                resolveFlag(selected.id, "resolved", "delete")
              }
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={acting}
              onClick={() =>
                selected && resolveFlag(selected.id, "dismissed")
              }
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Keep
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModerationQueue;
