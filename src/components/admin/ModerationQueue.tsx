import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const ModerationQueue = () => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFlags = async () => {
    const { data } = await supabase
      .from("content_flags")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50);
    setFlags(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchFlags(); }, []);

  const resolveFlag = async (id: string, status: string) => {
    if (!user) return;
    await supabase.from("content_flags").update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    toast.success(`Flag ${status}`);
    fetchFlags();
  };

  if (isLoading) return <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>;
  if (flags.length === 0) return <p className="text-sm text-muted-foreground text-center py-6">No pending flags 🎉</p>;

  return (
    <div className="space-y-3">
      {flags.map(flag => (
        <Card key={flag.id} variant="compact">
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="destructive" className="text-[10px]">{flag.reason}</Badge>
                  <span className="text-[10px] text-muted-foreground">{flag.flagged_content_type}</span>
                </div>
                {flag.additional_notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{flag.additional_notes}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(flag.created_at), "MMM d, yyyy")}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resolveFlag(flag.id, "dismissed")}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500" onClick={() => resolveFlag(flag.id, "resolved")}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModerationQueue;
