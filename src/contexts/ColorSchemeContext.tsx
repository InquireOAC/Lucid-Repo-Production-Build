import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useTheme } from "@/components/theme-provider";
import { colorSchemes, type ColorScheme } from "@/data/colorSchemes";
import { supabase } from "@/integrations/supabase/client";

interface ColorSchemeContextType {
  currentScheme: ColorScheme;
  setColorScheme: (schemeId: string) => Promise<void>;
  availableSchemes: ColorScheme[];
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

const DEFAULT_SCHEME_ID = "aurora-blue";

export const ColorSchemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const { theme } = useTheme();
  const [currentSchemeId, setCurrentSchemeId] = useState(DEFAULT_SCHEME_ID);
  const [previousVarKeys, setPreviousVarKeys] = useState<string[]>([]);

  // Load from profile on mount / profile change
  useEffect(() => {
    if (profile?.color_scheme) {
      const found = colorSchemes.find((s) => s.id === profile.color_scheme);
      if (found) {
        setCurrentSchemeId(found.id);
      }
    } else {
      setCurrentSchemeId(DEFAULT_SCHEME_ID);
    }
  }, [profile?.color_scheme]);

  // Apply CSS variables whenever scheme or theme changes
  useEffect(() => {
    const scheme = colorSchemes.find((s) => s.id === currentSchemeId);
    if (!scheme) return;

    const root = document.documentElement;
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const vars = isDark ? scheme.darkVars : scheme.lightVars;

    // Remove previous overrides first
    previousVarKeys.forEach((key) => root.style.removeProperty(key));

    // If default scheme, don't set overrides (let CSS handle it)
    if (scheme.id === DEFAULT_SCHEME_ID) {
      setPreviousVarKeys([]);
      return;
    }

    // Apply new overrides
    const keys = Object.keys(vars);
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    setPreviousVarKeys(keys);

    return () => {
      keys.forEach((key) => root.style.removeProperty(key));
    };
  }, [currentSchemeId, theme]);

  const setColorScheme = useCallback(async (schemeId: string) => {
    setCurrentSchemeId(schemeId);

    if (user?.id) {
      await supabase
        .from("profiles")
        .update({ color_scheme: schemeId } as any)
        .eq("id", user.id);
    }
  }, [user?.id]);

  const currentScheme = useMemo(
    () => colorSchemes.find((s) => s.id === currentSchemeId) || colorSchemes[0],
    [currentSchemeId]
  );

  const value = useMemo(
    () => ({ currentScheme, setColorScheme, availableSchemes: colorSchemes }),
    [currentScheme, setColorScheme]
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = () => {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");
  }
  return context;
};
