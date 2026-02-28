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
import { Moon } from "lucide-react";

/* ── colour tokens (self-contained palette) ── */
const C = {
  bg: "#0B0F19",
  cream: "#F4F1EA",
  muted: "#B8B3A8",
  ink: "#1A1A1A",
  divider: "rgba(244,241,234,0.1)",
} as const;

/* ── icons (monochrome black) ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={C.ink}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={C.ink}>
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

/* ── terms text (unchanged) ── */
const TermsText = () => (
  <div className="space-y-3 text-xs" style={{ color: C.muted }}>
    <h4 className="font-semibold text-sm" style={{ color: C.cream }}>Terms of Use Agreement</h4>
    <p>By creating an account, you agree to abide by our community standards and guidelines. We are committed to maintaining a safe, respectful, and inclusive environment for all users.</p>
    <h5 className="font-semibold" style={{ color: "#c44" }}>Zero Tolerance Policy</h5>
    <p><strong>We have ZERO TOLERANCE for:</strong></p>
    <ul className="list-disc pl-4 space-y-1">
      <li>Hate speech, discrimination, or content targeting individuals based on race, religion, gender, sexual orientation, or other protected characteristics</li>
      <li>Harassment, bullying, or threatening behavior toward other users</li>
      <li>Abusive, violent, or harmful language or imagery</li>
      <li>Sexual content, explicit material, or inappropriate imagery</li>
      <li>Spam, promotional content, or attempts to deceive other users</li>
      <li>Sharing personal information of others without consent</li>
    </ul>
    <h5 className="font-semibold" style={{ color: C.cream }}>Community Expectations</h5>
    <p>We expect all users to:</p>
    <ul className="list-disc pl-4 space-y-1">
      <li>Treat others with respect and kindness</li>
      <li>Share dream content that is appropriate for all audiences</li>
      <li>Report any content that violates these guidelines</li>
      <li>Respect others' privacy and personal boundaries</li>
      <li>Use the platform for its intended purpose of sharing dreams and experiences</li>
    </ul>
    <h5 className="font-semibold" style={{ color: C.cream }}>Consequences</h5>
    <p>Violations of these terms may result in content removal, account suspension, or permanent ban from the platform. We reserve the right to take action at our discretion to maintain community safety.</p>
    <p className="mt-4" style={{ color: C.muted }}>Last updated: December 2024 | Version 1.0</p>
  </div>
);

/* ── shared button style ── */
const creamBtnStyle: React.CSSProperties = {
  background: C.cream,
  color: C.ink,
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
  border: "none",
  fontWeight: 500,
};

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

  const getRedirectTo = () =>
    Capacitor.isNativePlatform()
      ? "app.dreamweaver.lucidrepo://callback"
      : `${window.location.origin}/`;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: getRedirectTo() },
      });
      if (error) toast.error(error.message);
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("An error occurred during Google sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: { redirectTo: getRedirectTo() },
      });
      if (error) toast.error(error.message);
    } catch (error) {
      console.error("Apple sign in error:", error);
      toast.error("An error occurred during Apple sign in");
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="flex items-center justify-center min-h-screen pt-safe-top" style={{ background: C.bg, color: C.cream }}>
        Loading…
      </div>
    );
  }

  /* ── terms acceptance for existing users ── */
  if (user && hasAcceptedTerms === false) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-safe-top px-4" style={{ background: C.bg }}>
        <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(244,241,234,0.04)", border: `1px solid ${C.divider}` }}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}>Terms of Use</h2>
            <p className="text-sm mt-1" style={{ color: C.muted }}>Please accept our Terms of Use to continue using Lucid Repo</p>
          </div>
          <ScrollArea className="h-48 w-full rounded-xl p-3 mb-4" style={{ border: `1px solid ${C.divider}`, background: "rgba(244,241,234,0.03)" }}>
            <TermsText />
          </ScrollArea>
          <button onClick={handleAcceptTerms} className="w-full h-11 text-sm font-medium" style={creamBtnStyle}>
            Accept Terms and Continue
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     MAIN AUTH — Literary Dream Archive
     ═══════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-safe-top pb-safe-bottom relative overflow-hidden"
      style={{ background: C.bg }}
    >
      {/* Paper grain texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: 256,
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* ── SECTION 1: Header ── */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          
          <h1
            className="text-4xl font-semibold leading-tight tracking-tight"
            style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}
          >
            Welcome back, Dreamer.
          </h1>
          <p className="mt-4 text-sm" style={{ color: C.muted }}>
            Join thousands sharing their nightly adventures.
          </p>
        </motion.div>

        {/* ── SECTION 2: Authentication ── */}
        <motion.div
          className="w-full space-y-4"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
        >
          {/* OAuth buttons */}
          <motion.button
            type="button"
            className="w-full h-12 flex items-center justify-center gap-3 text-sm font-medium cursor-pointer"
            style={creamBtnStyle}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          <motion.button
            type="button"
            className="w-full h-12 flex items-center justify-center gap-3 text-sm font-medium cursor-pointer"
            style={creamBtnStyle}
            whileTap={{ scale: 0.98 }}
            onClick={handleAppleSignIn}
            disabled={isLoading}
          >
            <AppleIcon />
            Continue with Apple
          </motion.button>

          

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full" style={{ borderTop: `1px solid ${C.divider}` }} />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="px-3" style={{ background: C.bg, color: C.muted }}>or</span>
            </div>
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
                  style={{ color: C.cream, borderBottom: `1px solid ${C.divider}` }}
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
                style={{ color: C.cream, borderBottom: `1px solid ${C.divider}` }}
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
                style={{ color: C.cream, borderBottom: `1px solid ${C.divider}` }}
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
              <div className="space-y-3 pt-2" style={{ borderTop: `1px solid ${C.divider}` }}>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms-agree"
                    checked={hasAcceptedTermsLocal}
                    onCheckedChange={(checked) => setHasAcceptedTermsLocal(checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor="terms-agree" className="text-sm font-medium leading-none cursor-pointer" style={{ color: C.cream }}>
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsText(!showTermsText)}
                        className="underline hover:no-underline"
                        style={{ color: C.muted }}
                      >
                        Terms of Use
                      </button>
                    </label>
                  </div>
                </div>
                {showTermsText && (
                  <ScrollArea className="h-48 w-full rounded-xl p-3" style={{ border: `1px solid ${C.divider}`, background: "rgba(244,241,234,0.03)" }}>
                    <TermsText />
                  </ScrollArea>
                )}
              </div>
            )}

            <motion.button
              type="submit"
              className="w-full h-12 text-sm font-medium cursor-pointer"
              style={{ ...creamBtnStyle, opacity: (mode === "signup" && !hasAcceptedTermsLocal) ? 0.5 : 1 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || (mode === "signup" && !hasAcceptedTermsLocal)}
            >
              {isLoading
                ? (mode === "signin" ? "Signing in…" : "Creating account…")
                : (mode === "signin" ? "Enter the Archive" : "Begin Your Story")}
            </motion.button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-xs" style={{ color: C.muted }}>
            {mode === "signin" ? (
              <>New here?{" "}
                <button type="button" onClick={() => setMode("signup")} className="underline hover:no-underline" style={{ color: C.cream }}>
                  Create an account
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button type="button" onClick={() => setMode("signin")} className="underline hover:no-underline" style={{ color: C.cream }}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>

        {/* ── SECTION 3: Community Preview ── */}
        <motion.div
          className="w-full mt-14 text-center"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
        >
          <div className="mb-5" style={{ borderTop: `1px solid ${C.divider}` }} />
          <p className="text-[10px] uppercase tracking-[0.25em] font-medium mb-5" style={{ color: C.muted }}>
            Tonight in the Archive
          </p>
          <div className="grid grid-cols-2 gap-3">
            {recentDreams.map((dream, i) => {
              const imgSrc = dream.image_url || dream.generatedImage;
              const username = dream.profiles?.display_name || dream.profiles?.username || "Dreamer";
              return (
                <motion.div
                  key={dream.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "rgba(244,241,234,0.04)",
                    border: `1px solid ${C.divider}`,
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
                    <div className="w-full aspect-[4/3] flex items-center justify-center" style={{ background: "rgba(244,241,234,0.06)" }}>
                      <Moon size={24} style={{ color: C.muted, opacity: 0.5 }} />
                    </div>
                  )}
                  <div className="p-2.5">
                    <p
                      className="text-xs font-medium leading-snug line-clamp-2"
                      style={{ color: C.cream, fontFamily: "'Playfair Display', serif" }}
                    >
                      {dream.title}
                    </p>
                    <p className="text-[10px] mt-1 truncate" style={{ color: C.muted }}>
                      {username}
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
