import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Shield } from "lucide-react";
import { toast } from "sonner";

const UserManager = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const searchUsers = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, created_at")
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20);
    setResults(data || []);
    setSearching(false);
  };

  const assignModerator = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "moderator",
    });
    if (error) {
      if (error.code === "23505") toast.info("User already has this role");
      else toast.error("Failed to assign role");
    } else {
      toast.success("Moderator role assigned!");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search by username or display name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && searchUsers()}
        />
        <Button onClick={searchUsers} disabled={searching} size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {results.length === 0 && !searching && (
        <p className="text-sm text-muted-foreground text-center py-6">Search for users above</p>
      )}

      <div className="space-y-2">
        {results.map(user => (
          <Card key={user.id} variant="compact">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user.display_name || user.username || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">@{user.username || "no-username"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => assignModerator(user.id)}>
                <Shield className="h-3.5 w-3.5 mr-1" />
                Make Mod
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserManager;
