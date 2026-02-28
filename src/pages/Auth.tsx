import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { containsInappropriateContent } from "@/utils/contentFilter";
import { motion } from "framer-motion";
import { Moon, Sparkles } from "lucide-react";

/* ── colour tokens (cosmic blue palette) ── */
const C = {
  bg: "#060B18",
  surface: "rgba(56,130,246,0.06)",
  surfaceBorder: "rgba(56,130,246,0.12)",
  primary: "#3B82F6",
  primaryGlow: "rgba(56,130,246,0.25)",
  text: "#E2E8F0",
  muted: "#64748B",
  divider: "rgba(56,130,246,0.10)",
  ink: "#060B18",
} as const;

/* ── terms text ── */
const TermsText = () => (
  <div className="space-y-3 text-xs" style={{ color: C.muted }}>
    <h4 className="font-semibold text-sm" style={{ color: C.text }}>Terms of Use Agreement</h4>
    <p>By creating an account, you agree to abide by our community standards and guidelines. We are committed to maintaining a safe, respectful, and inclusive environment for all users.</p>
    <h5 className="font-semibold" style={{ color: "#ef4444" }}>Zero Tolerance Policy</h5>
    <p><strong>We have ZERO TOLERANCE for:</strong></p>
    <ul className="list-disc pl-4 space-y-1">
      <li>Hate speech, discrimination, or content targeting individuals based on race, religion, gender, sexual orientation, or other protected characteristics</li>
      <li>Harassment, bullying, or threatening behavior toward other users</li>
      <li>Abusive, violent, or harmful language or imagery</li>
      <li>Sexual content, explicit material, or inappropriate imagery</li>
      <li>Spam, promotional content, or attempts to deceive other users</li>
      <li>Sharing personal information of others without consent</li>
    </ul>
    <h5 className="font-semibold" style={{ color: C.text }}>Community Expectations</h5>
    <p>We expect all users to:</p>
    <ul className="list-disc pl-4 space-y-1">
      <li>Treat others with respect and kindness</li>
      <li>Share dream content that is appropriate for all audiences</li>
      <li>Report any content that violates these guidelines</li>
      <li>Respect others' privacy and personal boundaries</li>
      <li>Use the platform for its intended purpose of sharing dreams and experiences</li>
    </ul>
    <h5 className="font-semibold" style={{ color: C.text }}>Consequences</h5>
    <p>Violations of these terms may result in content removal, account suspension, or permanent ban from the platform. We reserve the right to take action at our discretion to maintain community safety.</p>
    <p className="mt-4" style={{ color: C.muted }}>Last updated: December 2024 | Version 1.0</p>
  </div>
);

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" as const },
  }),
};

const REMEMBER_ME_KEY = "lucid-repo-remember-me";

const Auth = () => {
  const [recentDreams, setRecentDreams] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("dream_entries")
      .select("id, title, image_url, generatedImage, created_at, profiles(username, display_name, avatar_symbol, avatar_color)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setRecentDreams(data || []));
  }, []);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAcceptedTerms, isLoading: termsLoading, markTermsAsAccepted } = useTermsAcceptance();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [hasAcceptedTermsLocal, setHasAcceptedTermsLocal] = useState(false);
  const [showTermsText, setShowTermsText] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [rememberMe, setRememberMe] = useState(() => {
    const stored = localStorage.getItem(REMEMBER_ME_KEY);
    return stored !== null ? stored === "true" : true;
  });

  useEffect(() => {
    if (user && !termsLoading) {
      if (hasAcceptedTerms === true) {
        navigate("/");
      } else if (hasAcceptedTerms === false) {
        console.log("User needs to accept terms");
      }
    }
  }, [user, hasAcceptedTerms, termsLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        toast.error(error.message.includes("Invalid login credentials")
          ? "Invalid email or password. Please check your credentials and try again."
          : error.message);
        return;
      }
      toast.success("Signed in successfully!");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) { toast.error("Please fill in all fields"); return; }
    if (!hasAcceptedTermsLocal) { toast.error("Please accept the Terms of Use to continue"); return; }
    if (containsInappropriateContent(username)) { toast.error("Username contains inappropriate content. Please choose a different username."); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters long"); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { username } },
      });
      if (error) {
        toast.error(error.message.includes("User already registered")
          ? "An account with this email already exists"
          : error.message);
        return;
      }
      await markTermsAsAccepted();
      toast.success("Account created successfully! Please check your email to verify your account.");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTerms = async () => {
    if (!user) return;
    try {
      await markTermsAsAccepted();
      toast.success("Terms accepted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error accepting terms:", error);
      toast.error("Failed to accept terms. Please try again.");
    }
  };

  /* ── loading state ── */
  if (termsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-safe-top" style={{ background: C.bg, color: C.text }}>
        Loading…
      </div>
    );
  }

  /* ── terms acceptance for existing users ── */
  if (user && hasAcceptedTerms === false) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-safe-top px-4" style={{ background: C.bg }}>
        <div className="w-full max-w-md rounded-2xl p-6" style={{ background: C.surface, border: `1px solid ${C.surfaceBorder}` }}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: C.text, fontFamily: "'Playfair Display', serif" }}>Terms of Use</h2>
            <p className="text-sm mt-1" style={{ color: C.muted }}>Please accept our Terms of Use to continue using Lucid Repo</p>
          </div>
          <ScrollArea className="h-48 w-full rounded-xl p-3 mb-4" style={{ border: `1px solid ${C.surfaceBorder}`, background: "rgba(56,130,246,0.03)" }}>
            <TermsText />
          </ScrollArea>
          <button
            onClick={handleAcceptTerms}
            className="w-full h-11 text-sm font-medium rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${C.primary}, #6366F1)`,
              color: "#fff",
              border: "none",
              boxShadow: `0 4px 20px ${C.primaryGlow}`,
            }}
          >
            Accept Terms and Continue
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     MAIN AUTH — Cosmic Tech Theme
     ═══════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-safe-top pb-safe-bottom relative overflow-hidden pb-24"
      style={{ background: C.bg }}
    >
      {/* Cosmic background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Radial glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{
            background: `radial-gradient(ellipse at center, ${C.primaryGlow} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
        />
        {/* Radial glow bottom-right */}
        <div
          className="absolute bottom-20 right-0 w-[300px] h-[300px]"
          style={{
            background: `radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)`,
            filter: "blur(50px)",
          }}
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(56,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56,130,246,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* ── SECTION 1: Header ── */}
        <motion.div
          className="text-center mb-10"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${C.primary}, #6366F1)`,
                boxShadow: `0 0 20px ${C.primaryGlow}`,
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1
            className="text-3xl font-bold leading-tight tracking-tight"
            style={{ color: C.text }}
          >
            Welcome to{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${C.primary}, #818CF8)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Lucid Repo
            </span>
          </h1>
          <p className="mt-3 text-sm" style={{ color: C.muted }}>
            Join thousands sharing their nightly adventures.
          </p>
        </motion.div>

        {/* ── SECTION 2: Auth Form ── */}
        <motion.div
          className="w-full"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
        >
          <div
            className="w-full rounded-2xl p-6"
            style={{
              background: C.surface,
              border: `1px solid ${C.surfaceBorder}`,
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Tab switcher */}
            <div className="flex rounded-xl mb-6 p-1" style={{ background: "rgba(56,130,246,0.06)", border: `1px solid ${C.surfaceBorder}` }}>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  background: mode === "signin" ? `linear-gradient(135deg, ${C.primary}, #6366F1)` : "transparent",
                  color: mode === "signin" ? "#fff" : C.muted,
                  boxShadow: mode === "signin" ? `0 2px 10px ${C.primaryGlow}` : "none",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  background: mode === "signup" ? `linear-gradient(135deg, ${C.primary}, #6366F1)` : "transparent",
                  color: mode === "signup" ? "#fff" : C.muted,
                  boxShadow: mode === "signup" ? `0 2px 10px ${C.primaryGlow}` : "none",
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Email / Password form */}
            <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-transparent text-sm py-3 outline-none placeholder:opacity-40"
                    style={{ color: C.text, borderBottom: `1px solid ${C.surfaceBorder}` }}
                  />
                </div>
              )}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent text-sm py-3 outline-none placeholder:opacity-40"
                  style={{ color: C.text, borderBottom: `1px solid ${C.surfaceBorder}` }}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder={mode === "signup" ? "Password (min 6 characters)" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "signup" ? 6 : undefined}
                  className="w-full bg-transparent text-sm py-3 outline-none placeholder:opacity-40"
                  style={{ color: C.text, borderBottom: `1px solid ${C.surfaceBorder}` }}
                />
              </div>

              {/* Remember me (sign-in only) */}
              {mode === "signin" && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => {
                      setRememberMe(checked);
                      localStorage.setItem(REMEMBER_ME_KEY, String(checked));
                    }}
                  />
                  <Label htmlFor="remember-me" className="text-xs cursor-pointer" style={{ color: C.muted }}>
                    Remember me
                  </Label>
                </div>
              )}

              {/* Terms (sign-up only) */}
              {mode === "signup" && (
                <div className="space-y-3 pt-2" style={{ borderTop: `1px solid ${C.surfaceBorder}` }}>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms-agree"
                      checked={hasAcceptedTermsLocal}
                      onCheckedChange={(checked) => setHasAcceptedTermsLocal(checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor="terms-agree" className="text-sm font-medium leading-none cursor-pointer" style={{ color: C.text }}>
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsText(!showTermsText)}
                          className="underline hover:no-underline"
                          style={{ color: C.primary }}
                        >
                          Terms of Use
                        </button>
                      </label>
                    </div>
                  </div>
                  {showTermsText && (
                    <ScrollArea className="h-48 w-full rounded-xl p-3" style={{ border: `1px solid ${C.surfaceBorder}`, background: "rgba(56,130,246,0.03)" }}>
                      <TermsText />
                    </ScrollArea>
                  )}
                </div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                className="w-full h-12 text-sm font-semibold rounded-xl cursor-pointer mt-2"
                style={{
                  background: `linear-gradient(135deg, ${C.primary}, #6366F1)`,
                  color: "#fff",
                  border: "none",
                  boxShadow: `0 4px 20px ${C.primaryGlow}`,
                }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* ── SECTION 3: Community Preview ── */}
        <motion.div
          className="w-full mt-12 text-center"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
        >
          <div className="mb-5" style={{ borderTop: `1px solid ${C.divider}` }} />
          <p className="text-[10px] uppercase tracking-[0.25em] font-medium mb-5" style={{ color: C.muted }}>
            Tonight in the Repo
          </p>
          <div className="grid grid-cols-2 gap-3">
            {recentDreams.map((dream, i) => {
              const imgSrc = dream.image_url || dream.generatedImage;
              const dreamerName = dream.profiles?.display_name || dream.profiles?.username || "Dreamer";
              return (
                <motion.div
                  key={dream.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.surfaceBorder}`,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                >
                  {imgSrc ? (
                    <div className="w-full aspect-[4/3] overflow-hidden">
                      <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center" style={{ background: "rgba(56,130,246,0.06)" }}>
                      <Moon size={24} style={{ color: C.primary, opacity: 0.4 }} />
                    </div>
                  )}
                  <div className="p-2.5">
                    <p className="text-xs font-medium leading-snug line-clamp-2" style={{ color: C.text }}>
                      {dream.title}
                    </p>
                    <p className="text-[10px] mt-1 truncate" style={{ color: C.muted }}>
                      {dreamerName}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            {recentDreams.length === 0 && (
              <p className="col-span-2 text-xs italic" style={{ color: C.muted, opacity: 0.6 }}>
                The archive awaits its first dreams…
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
