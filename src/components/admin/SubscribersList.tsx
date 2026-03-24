import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, ImageIcon, Brain, CalendarClock } from "lucide-react";
import { format } from "date-fns";

interface Subscriber {
  user_id: string;
  price_id: string | null;
  status: string;
  current_period_end: number | null;
  dream_analyses_used: number;
  image_generations_used: number;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

function getPlanName(priceId: string | null): string {
  if (!priceId) return "Subscribed";
  if (priceId.includes("premium")) return "Mystic";
  if (priceId.includes("basic")) return "Dreamer";
  return "Subscribed";
}

function getPlanVariant(priceId: string | null): "default" | "gold" | "secondary" {
  if (priceId?.includes("premium")) return "gold";
  if (priceId?.includes("basic")) return "secondary";
  return "default";
}

const SubscribersList = () => {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      const { data: subs } = await supabase
        .from("stripe_subscriptions")
        .select("user_id, price_id, status, current_period_end, dream_analyses_used, image_generations_used")
        .eq("status", "active")
        .is("deleted_at", null);

      if (!subs || subs.length === 0) {
        setSubscribers([]);
        setLoading(false);
        return;
      }

      const userIds = subs.map((s) => s.user_id);
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      setSubscribers(
        subs.map((s) => {
          const p = profileMap.get(s.user_id);
          return {
            ...s,
            username: p?.username || null,
            display_name: p?.display_name || null,
            avatar_url: p?.avatar_url || null,
          };
        })
      );
      setLoading(false);
    };

    fetchSubscribers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Active Subscribers
        </h3>
        <Badge variant="outline" className="text-xs">
          <Crown className="h-3 w-3 mr-1" />
          {subscribers.length}
        </Badge>
      </div>

      {subscribers.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No active subscribers</p>
      )}

      <div className="space-y-2">
        {subscribers.map((sub) => {
          const name = sub.display_name || sub.username || "Anonymous";
          const initials = name.charAt(0).toUpperCase();
          const plan = getPlanName(sub.price_id);

          return (
            <Card
              key={sub.user_id}
              variant="compact"
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => navigate(`/profile/${sub.username || sub.user_id}`)}
            >
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={sub.avatar_url || undefined} alt={name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <Badge variant={getPlanVariant(sub.price_id)} className="text-[9px] shrink-0">
                        {plan}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">@{sub.username || "no-username"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Brain className="h-3 w-3" />
                    {sub.dream_analyses_used} analyses
                  </span>
                  <span className="flex items-center gap-0.5">
                    <ImageIcon className="h-3 w-3" />
                    {sub.image_generations_used} images
                  </span>
                  {sub.current_period_end && (
                    <span className="flex items-center gap-0.5 ml-auto">
                      <CalendarClock className="h-3 w-3" />
                      {format(new Date(sub.current_period_end * 1000), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscribersList;
