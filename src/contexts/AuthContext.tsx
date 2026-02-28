
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profile: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const profileFetchedRef = useRef<string | null>(null);

  // Handle "Remember Me" - if disabled, clear session on fresh browser open
  useEffect(() => {
    const rememberMe = localStorage.getItem("lucid-repo-remember-me");
    if (rememberMe === "false") {
      // Check if this is a fresh browser session using sessionStorage flag
      const sessionActive = sessionStorage.getItem("lucid-repo-session-active");
      if (!sessionActive) {
        // Fresh session with remember me off - sign out
        supabase.auth.signOut().then(() => {
          setLoading(false);
        });
        return;
      }
    }
    // Mark session as active
    sessionStorage.setItem("lucid-repo-session-active", "true");

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && profileFetchedRef.current !== session.user.id) {
          profileFetchedRef.current = session.user.id;
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else if (!session?.user) {
          setProfile(null);
          profileFetchedRef.current = null;
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        profileFetchedRef.current = session.user.id;
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Successfully signed in!");
    } catch (error: any) {
      toast.error(error.message || "Error signing in");
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Registration successful! Check your email to confirm your account.");
    } catch (error: any) {
      toast.error(error.message || "Error signing up");
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Clear states first to ensure UI updates immediately
      setProfile(null);
      profileFetchedRef.current = null;
      setSession(null);
      setUser(null);
      
      // Try to sign out, but don't fail if session is already invalid
      const { error } = await supabase.auth.signOut();
      
      // If error is about session not found, that's actually fine - user is already signed out
      if (error && !error.message?.includes('session_not_found') && !error.message?.includes('Session not found')) {
        console.error("Sign out error:", error);
        // Don't throw here, just log it since we already cleared the local state
      }
      
      toast.success("Successfully signed out");
    } catch (error: any) {
      // Even if sign out fails server-side, we've cleared local state
      console.error("Error signing out:", error);
      toast.success("Successfully signed out");
    }
  }, []);

  const value = useMemo(() => ({
    session,
    user,
    loading,
    profile,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }), [session, user, loading, profile, signIn, signUp, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
