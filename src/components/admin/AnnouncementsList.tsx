import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Megaphone, Bell, PartyPopper, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const typeIcons: Record<string, React.ReactNode> = {
  announcement: <Megaphone className="h-4 w-4" />,
  reminder: <Bell className="h-4 w-4" />,
  celebration: <PartyPopper className="h-4 w-4" />,
  poll: <BarChart3 className="h-4 w-4" />,
};

interface AnnouncementsListProps {
  refreshKey?: number;
}

const AnnouncementsList = ({ refreshKey }: AnnouncementsListProps) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);

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
