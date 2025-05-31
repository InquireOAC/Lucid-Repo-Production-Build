
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useTermsAcceptance = () => {
  const { user } = useAuth();
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkTermsAcceptance = async () => {
    if (!user) {
      setHasAcceptedTerms(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("terms_acceptance")
        .select("id")
        .eq("user_id", user.id)
        .eq("terms_version", "1.0")
        .maybeSingle();

      if (error) throw error;
      
      setHasAcceptedTerms(!!data);
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
        .insert({
          user_id: user.id,
          terms_version: "1.0"
        });

      if (error) throw error;
      
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
