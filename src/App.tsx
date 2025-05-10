
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MainLayout from "./layouts/MainLayout";
import Journal from "./pages/Journal";
import LucidRepo from "./pages/LucidRepo";
import Profile from "./pages/Profile";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { loadNotificationSettings, setupMorningNotification } from "./utils/notificationUtils";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const setupNativeFeatures = async () => {
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

      // Initialize notifications
      if (Capacitor.isNativePlatform()) {
        const settings = loadNotificationSettings();
        if (settings.enabled) {
          try {
            await setupMorningNotification(settings);
            console.log('Morning notifications initialized');
          } catch (error) {
            console.error('Error initializing notifications:', error);
          }
        }
      }
    };
    
    setupNativeFeatures();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Journal />} />
                <Route path="/lucidrepo" element={<LucidRepo />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
