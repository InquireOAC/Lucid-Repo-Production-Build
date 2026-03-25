
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { setupOAuthDeepLinkListener } from '@/utils/oauthDeepLink';

import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from './pages/Index';
import Journal from './pages/Journal';
import NewDream from './pages/NewDream';
import EditDream from './pages/EditDream';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import LucidRepoContainer from './pages/LucidRepo';
import Chat from './pages/Chat';
import Learn from './pages/Learn';
import Notifications from './pages/Notifications';
import Insights from './pages/Insights';
import LucidStats from './pages/LucidStats';
import Explore from './pages/Explore';
import DreamConnections from './pages/DreamConnections';
import TechniqueDetailPage from './components/insights/TechniqueDetailPage';
import DreamStoryPage from './pages/DreamStoryPage';
import DreamBook from './pages/DreamBook';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ColorSchemeProvider } from "@/contexts/ColorSchemeContext";
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import { useOnboarding } from './hooks/useOnboarding';

const queryClient = new QueryClient();

function AppContent() {
  const { hasSeenOnboarding, isLoading, completeOnboarding } = useOnboarding();

  useEffect(() => {
    setupOAuthDeepLinkListener();
  }, []);

  // Show nothing while checking onboarding status
  if (isLoading) return null;

  // Show onboarding if user hasn't seen it
  if (hasSeenOnboarding === false) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Index />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/new" element={<NewDream />} />
          <Route path="journal/edit/:dreamId" element={<EditDream />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="auth" element={<Auth />} />
          <Route path="lucid-stats" element={<LucidStats />} />
          <Route path="lucid-repo" element={<LucidRepoContainer />} />
          <Route path="lucid-repo/:dreamId" element={<LucidRepoContainer />} />
          <Route path="dream/:dreamId" element={<DreamStoryPage />} />
          <Route path="dream-book" element={<DreamBook />} />
          <Route path="chat" element={<Chat />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="insights" element={<Insights />} />
          <Route path="insights/technique/:id" element={<TechniqueDetailPage />} />
          <Route path="learn" element={<Learn />} />
          <Route path="explore" element={<Explore />} />
          <Route path="connections" element={<DreamConnections />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ColorSchemeProvider>
              <AppContent />
            </ColorSchemeProvider>
          </ThemeProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
