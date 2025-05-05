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
import { StatusBar } from "@capacitor/status-bar"; // Import the StatusBar plugin

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Ensure the content does not overlap with the status bar or bottom home indicator
    StatusBar.setOverlaysWebView({ overlay: false }); // Set to false to prevent overlap
    StatusBar.show(); // Ensure the status bar is visible
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
