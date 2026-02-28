import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, ShieldCheck, X, ExternalLink, Moon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserResult {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  isSubscribed?: boolean;
  roles?: string[];
  dreamCount?: number;
  planName?: string;
}

const UserCard = ({
  user,
  onAssignRole,
  onRemoveRole,
  onViewProfile,
}: {
  user: UserResult;
  onAssignRole: (userId: string, role: "moderator" | "admin") => void;
  onRemoveRole: (userId: string, role: string) => void;
  onViewProfile: (user: UserResult) => void;
}) => {
  const displayName = user.display_name || user.username || "Anonymous";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <Card variant="compact">
      <CardContent className="p-3 space-y-2.5">
        {/* User info row */}
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-medium truncate">{displayName}</p>
              {user.isSubscribed && (
                <Badge variant="gold" className="text-[9px] shrink-0">
                  {user.planName || "Subscribed"}
                </Badge>
              )}
              {user.roles?.includes("admin") && (
                <Badge variant="destructive" className="text-[9px] shrink-0 gap-0.5">
                  Admin
                  <button onClick={() => onRemoveRole(user.id, "admin")} className="ml-0.5 hover:opacity-70">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
              {user.roles?.includes("moderator") && (
                <Badge variant="secondary" className="text-[9px] shrink-0 gap-0.5">
                  Mod
                  <button onClick={() => onRemoveRole(user.id, "moderator")} className="ml-0.5 hover:opacity-70">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>@{user.username || "no-username"}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Moon className="h-3 w-3" />
                {user.dreamCount}
              </span>
              <span>·</span>
              <span>{format(new Date(user.created_at), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>

        {/* Action buttons - stacked on mobile */}
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewProfile(user)}
            className="text-xs h-8 flex-1 min-w-[70px]"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1" />
            View
          </Button>
          {!user.roles?.includes("moderator") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssignRole(user.id, "moderator")}
              className="text-xs h-8 flex-1 min-w-[70px]"
            >
              <Shield className="h-3.5 w-3.5 mr-1" />
              Mod
            </Button>
          )}
          {!user.roles?.includes("admin") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssignRole(user.id, "admin")}
              className="text-xs h-8 flex-1 min-w-[70px] border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Admin
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const UserManager = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);

  const searchUsers = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, created_at")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20);

    if (!data || data.length === 0) {
      setResults([]);
      setSearching(false);
      return;
    }

    const userIds = data.map((u) => u.id);

    const [subsResult, rolesResult, dreamCountsResult] = await Promise.all([
      supabase
        .from("stripe_subscriptions")
        .select("user_id, price_id")
        .in("user_id", userIds)
        .eq("status", "active")
        .is("deleted_at", null),
      supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds),
      supabase
        .from("dream_entries")
        .select("user_id")
        .in("user_id", userIds),
    ]);

    const subMap = new Map<string, string>();
    subsResult.data?.forEach((s) => {
      const plan = s.price_id?.includes("premium") ? "Premium" : s.price_id?.includes("basic") ? "Basic" : "Subscribed";
      subMap.set(s.user_id, plan);
    });

    const roleMap = new Map<string, string[]>();
    rolesResult.data?.forEach((r) => {
      const existing = roleMap.get(r.user_id) || [];
      existing.push(r.role);
      roleMap.set(r.user_id, existing);
    });

    const dreamCounts = new Map<string, number>();
    dreamCountsResult.data?.forEach((d) => {
      dreamCounts.set(d.user_id, (dreamCounts.get(d.user_id) || 0) + 1);
    });

    setResults(
      data.map((u) => ({
        ...u,
        isSubscribed: subMap.has(u.id),
        planName: subMap.get(u.id),
        roles: roleMap.get(u.id) || [],
        dreamCount: dreamCounts.get(u.id) || 0,
      }))
    );
    setSearching(false);
  };

  const assignRole = async (userId: string, role: "moderator" | "admin") => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) {
      if (error.code === "23505") toast.info("User already has this role");
      else toast.error("Failed to assign role");
    } else {
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} role assigned!`);
      setResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: [...(u.roles || []), role] } : u))
      );
    }
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) {
      toast.error("Failed to remove role");
    } else {
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} role removed`);
      setResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: (u.roles || []).filter((r) => r !== role) } : u))
      );
    }
  };

  return (
    <div className="space-y-3">
      {/* Integrated search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search username or display name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchUsers()}
          className="pl-9 pr-20 h-11"
        />
        <Button
          onClick={searchUsers}
          disabled={searching}
          size="sm"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8"
        >
          {searching ? "..." : "Search"}
        </Button>
      </div>

      {results.length === 0 && !searching && (
        <p className="text-sm text-muted-foreground text-center py-6">Search for users above</p>
      )}

      <div className="space-y-2">
        {results.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onAssignRole={assignRole}
            onRemoveRole={removeRole}
            onViewProfile={(u) => navigate(`/profile/${u.username || u.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default UserManager;
