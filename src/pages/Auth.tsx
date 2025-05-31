
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { containsInappropriateContent } from "@/utils/contentFilter";

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

  // Redirect if user is authenticated
  useEffect(() => {
    if (user && !termsLoading) {
      // If user exists and we're not loading terms, check terms acceptance
      if (hasAcceptedTerms === true) {
        navigate("/");
      } else if (hasAcceptedTerms === false) {
        // User hasn't accepted terms, they need to accept them
        console.log("User needs to accept terms");
      }
    }
  }, [user, hasAcceptedTerms, termsLoading, navigate]);

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
      // Don't navigate here - let the useEffect handle it after checking terms
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

    // Check for inappropriate content in username
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
          data: {
            username,
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("An account with this email already exists");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Mark terms as accepted for new users
      await markTermsAsAccepted();
      
      toast.success("Account created successfully! Please check your email to verify your account.");
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle terms acceptance for existing users
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
    return <div className="flex items-center justify-center min-h-screen bg-background">Loading...</div>;
  }

  // If user is logged in but hasn't accepted terms, show terms acceptance
  if (user && hasAcceptedTerms === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Terms of Use</CardTitle>
            <CardDescription>
              Please accept our Terms of Use to continue using Lucid Repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 w-full rounded border p-3 bg-muted/50 mb-4">
              <div className="space-y-3 text-xs">
                <h4 className="font-semibold text-sm">Terms of Use Agreement</h4>
                
                <p>
                  By continuing to use this app, you agree to abide by our community standards and guidelines. 
                  We are committed to maintaining a safe, respectful, and inclusive environment for all users.
                </p>

                <h5 className="font-semibold text-red-600">Zero Tolerance Policy</h5>
                <p><strong>We have ZERO TOLERANCE for:</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Hate speech, discrimination, or content targeting individuals based on race, religion, gender, sexual orientation, or other protected characteristics</li>
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
                  Violations of these terms may result in content removal, account suspension, or permanent ban 
                  from the platform. We reserve the right to take action at our discretion to maintain community safety.
                </p>

                <p className="text-muted-foreground mt-4">
                  Last updated: December 2024 | Version 1.0
                </p>
              </div>
            </ScrollArea>
            
            <Button onClick={handleAcceptTerms} className="w-full">
              Accept Terms and Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl gradient-text">Welcome to Lucid Repository</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one to start sharing your dreams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                <div className="space-y-2">
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

                {/* Terms of Use Section */}
                <div className="space-y-3 border-t pt-4">
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
                    <ScrollArea className="h-48 w-full rounded border p-3 bg-muted/50">
                      <div className="space-y-3 text-xs">
                        <h4 className="font-semibold text-sm">Terms of Use Agreement</h4>
                        
                        <p>
                          By creating an account, you agree to abide by our community standards and guidelines. 
                          We are committed to maintaining a safe, respectful, and inclusive environment for all users.
                        </p>

                        <h5 className="font-semibold text-red-600">Zero Tolerance Policy</h5>
                        <p><strong>We have ZERO TOLERANCE for:</strong></p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Hate speech, discrimination, or content targeting individuals based on race, religion, gender, sexual orientation, or other protected characteristics</li>
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
                          Violations of these terms may result in content removal, account suspension, or permanent ban 
                          from the platform. We reserve the right to take action at our discretion to maintain community safety.
                        </p>

                        <p className="text-muted-foreground mt-4">
                          Last updated: December 2024 | Version 1.0
                        </p>
                      </div>
                    </ScrollArea>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !hasAcceptedTermsLocal}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
