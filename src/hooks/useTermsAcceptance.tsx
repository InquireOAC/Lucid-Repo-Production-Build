
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TERMS_VERSION = "1.0";
const TERMS_CACHE_KEY = "terms_accepted_v";

export const useTermsAcceptance = () => {
  const { user } = useAuth();
  
  // Check localStorage first for instant result
  const getCached = () => {
    if (!user) return null;
    return localStorage.getItem(`${TERMS_CACHE_KEY}${TERMS_VERSION}_${user.id}`) === "true";
  };

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(() => getCached());
  const [isLoading, setIsLoading] = useState(!getCached());

  const checkTermsAcceptance = async () => {
    if (!user) {
      setHasAcceptedTerms(null);
      setIsLoading(false);
      return;
    }

    // If cached locally, skip DB query
    if (getCached()) {
      setHasAcceptedTerms(true);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("terms_acceptance")
        .select("id")
        .eq("user_id", user.id)
        .eq("terms_version", TERMS_VERSION)
        .maybeSingle();

      if (error) throw error;
      
      const accepted = !!data;
      setHasAcceptedTerms(accepted);
      if (accepted) {
        localStorage.setItem(`${TERMS_CACHE_KEY}${TERMS_VERSION}_${user.id}`, "true");
      }
    } catch (error) {
      console.error("Error checking terms acceptance:", error);
      setHasAcceptedTerms(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkTermsAcceptance();
  }, [user]);

  const markTermsAsAccepted = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("terms_acceptance")
        .upsert({
          user_id: user.id,
          terms_version: TERMS_VERSION
        }, { onConflict: "user_id,terms_version" });

      if (error) throw error;
      
      localStorage.setItem(`${TERMS_CACHE_KEY}${TERMS_VERSION}_${user.id}`, "true");
      setHasAcceptedTerms(true);
    } catch (error) {
      console.error("Error accepting terms:", error);
      throw error;
    }
  };

  return {
    hasAcceptedTerms,
    isLoading,
    markTermsAsAccepted,
    recheckTerms: checkTermsAcceptance
  };
};
