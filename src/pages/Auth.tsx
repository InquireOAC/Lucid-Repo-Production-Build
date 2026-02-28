import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { containsInappropriateContent } from "@/utils/contentFilter";
import { ArrowLeft } from "lucide-react";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const OAuthButtons = ({
  onGoogle,
  onApple,
  isLoading,
}: {
  onGoogle: () => void;
  onApple: () => void;
  isLoading: boolean;
}) => (
  <div className="space-y-3">
    <Button
      type="button"
      variant="outline"
      className="w-full glass-card border-white/10 hover:border-white/20 h-11 gap-3"
      onClick={onGoogle}
      disabled={isLoading}
    >
      <GoogleIcon />
      Continue with Google
    </Button>
    <Button
      type="button"
      variant="outline"
      className="w-full glass-card border-white/10 hover:border-white/20 h-11 gap-3"
      onClick={onApple}
      disabled={isLoading}
    >
      <AppleIcon />
      Continue with Apple
    </Button>
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background/50 px-2 text-muted-foreground">or</span>
      </div>
    </div>
  </div>
);

const TermsText = () => (
  <div className="space-y-3 text-xs">
    <h4 className="font-semibold text-sm">Terms of Use Agreement</h4>
    <p>
      By creating an account, you agree to abide by our community standards and guidelines. We are committed to
      maintaining a safe, respectful, and inclusive environment for all users.
    </p>
    <h5 className="font-semibold text-red-600">Zero Tolerance Policy</h5>
    <p>
      <strong>We have ZERO TOLERANCE for:</strong>
    </p>
    <ul className="list-disc pl-4 space-y-1">
      <li>
        Hate speech, discrimination, or content targeting individuals based on race, religion, gender, sexual
        orientation, or other protected characteristics
      </li>
      <li>Harassment, bullying, or threatening behavior toward other users</li>
      <li>Abusive, violent, or harmful language or imagery</li>
      <li>Sexual content, explicit material, or inappropriate imagery</li>
      <li>Spam, promotional content, or attempts to deceive other users</li>
      <li>Sharing personal information of others without consent</li>
    </ul>
    <h5 className="font-semibold">Community Expectations</h5>
    <p>We expect all users to:</p>
    <ul className="list-disc pl-4 space-y-1">
      <li>Treat others with respect and kindness</li>
      <li>Share dream content that is appropriate for all audiences</li>
      <li>Report any content that violates these guidelines</li>
      <li>Respect others' privacy and personal boundaries</li>
      <li>Use the platform for its intended purpose of sharing dreams and experiences</li>
    </ul>
    <h5 className="font-semibold">Consequences</h5>
    <p>
      Violations of these terms may result in content removal, account suspension, or permanent ban from the platform.
      We reserve the right to take action at our discretion to maintain community safety.
    </p>
    <p className="text-muted-foreground mt-4">Last updated: December 2024 | Version 1.0</p>
  </div>
);

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAcceptedTerms, isLoading: termsLoading, markTermsAsAccepted } = useTermsAcceptance();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [hasAcceptedTermsLocal, setHasAcceptedTermsLocal] = useState(false);
  const [showTermsText, setShowTermsText] = useState(false);

  useEffect(() => {
    if (user && !termsLoading) {
      if (hasAcceptedTerms === true) {
        navigate("/");
      } else if (hasAcceptedTerms === false) {
        console.log("User needs to accept terms");
      }
    }
  }, [user, hasAcceptedTerms, termsLoading, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const redirectTo = Capacitor.isNativePlatform()
      ? "app.dreamweaver.lucidrepo://callback"
      : `${window.location.origin}/`;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: .google,
        redirectTo: URL(string: "app.dreamweaver.lucidrepo://callback")
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
    const redirectTo = Capacitor.isNativePlatform()
      ? "app.dreamweaver.lucidrepo://callback"
      : `${window.location.origin}/`;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: { redirectTo },
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
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please check your credentials and try again.");
        } else {
          toast.error(error.message);
        }
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
    if (!email || !password || !username) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!hasAcceptedTermsLocal) {
      toast.error("Please accept the Terms of Use to continue");
      return;
    }
    if (containsInappropriateContent(username)) {
      toast.error("Username contains inappropriate content. Please choose a different username.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { username },
        },
      });
      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("An account with this email already exists");
        } else {
          toast.error(error.message);
        }
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

  if (termsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen cosmic-background pt-safe-top pl-safe-left pr-safe-right">
        Loading...
      </div>
    );
  }

  // Terms acceptance screen for existing users
  if (user && hasAcceptedTerms === false) {
    return (
      <div className="min-h-screen flex items-center justify-center cosmic-background pt-safe-top px-4 pl-safe-left pr-safe-right">
        <div className="w-full max-w-md glass-card rounded-2xl border border-white/10 p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">Terms of Use</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Please accept our Terms of Use to continue using Lucid Repo
            </p>
          </div>
          <ScrollArea className="h-48 w-full rounded-xl border border-white/10 p-3 glass-card mb-4">
            <TermsText />
          </ScrollArea>
          <Button onClick={handleAcceptTerms} className="w-full">
            Accept Terms and Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center cosmic-background tech-grid-bg pt-safe-top px-4 pl-safe-left pr-safe-right overflow-hidden">
      {/* Animated aurora orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/[0.08] blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-secondary/[0.06] blur-[100px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[150px] animate-pulse [animation-delay:4s]" />
      </div>
      <div className="relative z-10 w-full max-w-md vault-glass rounded-2xl border border-primary/15 p-6 backdrop-blur-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Lucid Repo</h1>
          <p className="text-sm text-muted-foreground mt-1">Your dream journal awaits</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card border border-white/10">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <OAuthButtons onGoogle={handleGoogleSignIn} onApple={handleAppleSignIn} isLoading={isLoading} />
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <OAuthButtons onGoogle={handleGoogleSignIn} onApple={handleAppleSignIn} isLoading={isLoading} />
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="signup-username">Username</Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms-agree"
                    checked={hasAcceptedTermsLocal}
                    onCheckedChange={(checked) => setHasAcceptedTermsLocal(checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor="terms-agree" className="text-sm font-medium leading-none cursor-pointer">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsText(!showTermsText)}
                        className="text-primary underline hover:no-underline"
                      >
                        Terms of Use
                      </button>
                    </label>
                  </div>
                </div>
                {showTermsText && (
                  <ScrollArea className="h-48 w-full rounded-xl border border-white/10 p-3 glass-card">
                    <TermsText />
                  </ScrollArea>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !hasAcceptedTermsLocal}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mx-auto text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to Journal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
