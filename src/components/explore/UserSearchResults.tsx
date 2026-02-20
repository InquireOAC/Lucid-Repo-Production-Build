import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface ProfileResult {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_picture: string | null;
  avatar_symbol: string | null;
  avatar_color: string | null;
}

interface UserSearchResultsProps {
  query: string;
}

const UserSearchResults: React.FC<UserSearchResultsProps> = ({ query }) => {
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, profile_picture, avatar_symbol, avatar_color")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      setResults(data || []);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!query.trim()) return null;

  if (isLoading) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Searching...
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No users found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {results.map((profile) => (
        <div
          key={profile.id}
          onClick={() => navigate(`/profile/${profile.id}`)}
          className="flex items-center gap-3 p-3 rounded-xl border border-primary/10 bg-card/60 backdrop-blur-md cursor-pointer transition-all duration-200 hover:border-primary/25 hover:bg-card/80"
        >
          <Avatar className="h-10 w-10">
            {profile.profile_picture ? (
              <AvatarImage src={profile.profile_picture} alt={profile.username || ""} />
            ) : null}
            <AvatarFallback
              className="text-sm"
              style={profile.avatar_color ? { backgroundColor: profile.avatar_color } : undefined}
            >
              {profile.avatar_symbol || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {profile.display_name || profile.username || "User"}
            </p>
            {profile.username && (
              <p className="text-xs text-muted-foreground truncate">
                @{profile.username}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserSearchResults;
