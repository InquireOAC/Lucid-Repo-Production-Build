import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Megaphone, Bell, PartyPopper, BarChart3, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion } from "framer-motion";

const typeIcons: Record<string, React.ReactNode> = {
  announcement: <Megaphone className="h-4 w-4" />,
  reminder: <Bell className="h-4 w-4" />,
  celebration: <PartyPopper className="h-4 w-4" />,
  poll: <BarChart3 className="h-4 w-4" />,
};

interface PollResult {
  selected_option: string;
  vote_count: number;
}

const PollResults = ({ announcementId }: { announcementId: string }) => {
  const [results, setResults] = useState<PollResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.rpc("get_poll_results", { p_announcement_id: announcementId });
      if (data) setResults(data as PollResult[]);
      setLoading(false);
    };
    fetch();
  }, [announcementId]);

  if (loading) return <p className="text-[10px] text-muted-foreground py-2">Loading results…</p>;

  const totalVotes = results.reduce((s, r) => s + Number(r.vote_count), 0);

  if (totalVotes === 0) return <p className="text-[10px] text-muted-foreground py-2">No votes yet</p>;

  return (
    <div className="space-y-2 pt-2">
      <p className="text-[10px] font-medium text-muted-foreground">{totalVotes} total vote{totalVotes !== 1 ? "s" : ""}</p>
      {results.map((r) => {
        const pct = Math.round((Number(r.vote_count) / totalVotes) * 100);
        return (
          <div key={r.selected_option} className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="truncate">{r.selected_option}</span>
              <span className="text-muted-foreground shrink-0 ml-2">{r.vote_count} ({pct}%)</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface AnnouncementsListProps {
  refreshKey?: number;
}

const AnnouncementsList = ({ refreshKey }: AnnouncementsListProps) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [expandedPolls, setExpandedPolls] = useState<Set<string>>(new Set());

  const fetchAll = async () => {
    const { data } = await supabase
      .from("platform_announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setAnnouncements(data || []);
  };

  useEffect(() => { fetchAll(); }, [refreshKey]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("platform_announcements").update({ is_active: !current }).eq("id", id);
    fetchAll();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from("platform_announcements").delete().eq("id", id);
    toast.success("Deleted");
    fetchAll();
  };

  const togglePollExpand = (id: string) => {
    setExpandedPolls(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (announcements.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No announcements yet</p>;
  }

  return (
    <div className="space-y-3">
      {announcements.map(ann => (
        <Card key={ann.id} variant="compact" className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="pt-0.5">{typeIcons[ann.type] || typeIcons.announcement}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{ann.title}</span>
                  <Badge variant={ann.is_active ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {ann.is_active ? "Active" : "Off"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] shrink-0">{ann.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{ann.content}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(ann.created_at), "MMM d, yyyy h:mm a")}</p>

                {ann.type === "poll" && (
                  <div className="mt-2">
                    <button
                      onClick={() => togglePollExpand(ann.id)}
                      className="flex items-center gap-1 text-[11px] text-primary font-medium"
                    >
                      <BarChart3 className="h-3 w-3" />
                      {expandedPolls.has(ann.id) ? "Hide Results" : "View Results"}
                      <ChevronDown className={`h-3 w-3 transition-transform ${expandedPolls.has(ann.id) ? "rotate-180" : ""}`} />
                    </button>
                    {expandedPolls.has(ann.id) && <PollResults announcementId={ann.id} />}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={ann.is_active} onCheckedChange={() => toggleActive(ann.id, ann.is_active)} />
                <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(ann.id)} className="h-8 w-8">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnnouncementsList;
