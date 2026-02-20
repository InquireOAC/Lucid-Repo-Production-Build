import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SymbolItem {
  name: string;
  count: number;
  description?: string;
}

export interface SymbolAnalysis {
  people: SymbolItem[];
  places: SymbolItem[];
  objects: SymbolItem[];
  themes: SymbolItem[];
  emotions: SymbolItem[];
}

export const useSymbolAnalysis = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<SymbolAnalysis | null>(null);
  const [dreamCount, setDreamCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<string | null>(null);

  const fetchCachedAnalysis = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("dream_symbol_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("last_analyzed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setAnalysis(data.symbols as unknown as SymbolAnalysis);
        setDreamCount(data.dream_count);
        setLastAnalyzedAt(data.last_analyzed_at);
      }
    } catch (err) {
      console.error("Error fetching cached analysis:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!user) return;
    setIsAnalyzing(true);
    try {
      const { data: dreams, error: dreamsError } = await supabase
        .from("dream_entries")
        .select("title, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (dreamsError) throw dreamsError;
      if (!dreams || dreams.length === 0) {
        toast.error("No dreams to analyze. Start journaling first!");
        return;
      }

      const { data, error } = await supabase.functions.invoke("analyze-dream-symbols", {
        body: { dreams: dreams.map((d) => ({ title: d.title, content: d.content })) },
      });

      if (error) throw error;

      const symbols = data.symbols;
      const count = data.dream_count;

      // Upsert cached analysis
      const { data: existing } = await supabase
        .from("dream_symbol_analyses")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("dream_symbol_analyses")
          .update({ symbols, dream_count: count, last_analyzed_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("dream_symbol_analyses")
          .insert({ user_id: user.id, symbols, dream_count: count });
      }

      setAnalysis(symbols);
      setDreamCount(count);
      setLastAnalyzedAt(new Date().toISOString());
      toast.success("Dream symbols analyzed!");
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast.error("Failed to analyze dreams. Try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchCachedAnalysis();
  }, [user]);

  return { analysis, dreamCount, isLoading, isAnalyzing, lastAnalyzedAt, runAnalysis };
};
