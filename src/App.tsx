
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MainLayout from "./layouts/MainLayout";
import Journal from "./pages/Journal";
import LucidRepo from "./pages/LucidRepo";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { initializeNotifications } from "./utils/notificationUtils";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import { useOnboarding } from "./hooks/useOnboarding";
import { useSubscriptionSync } from "./hooks/useSubscriptionSync";

const queryClient = new QueryClient();

const AppContent = () => {
  const { hasSeenOnboarding, isLoading } = useOnboarding();
  
  // Initialize subscription sync
  useSubscriptionSync();

  useEffect(() => {
    const setupStatusBar = async () => {
      if (Capacitor.isPluginAvailable('StatusBar')) {
        try {
          // Set status bar to be opaque with dark text
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#1E1A2B' });
        } catch (error) {
          console.error('Error configuring status bar:', error);
        }
      }
    };
    
    setupStatusBar();
    
    // Initialize notifications
    initializeNotifications().catch(console.error);
  }, []);

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1E1A2B] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show onboarding if user hasn't seen it
  if (!hasSeenOnboarding) {
    return <OnboardingFlow />;
  }

  // Show main app
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Journal />} />
        <Route path="/lucidrepo" element={<LucidRepo />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <AppContent />
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
