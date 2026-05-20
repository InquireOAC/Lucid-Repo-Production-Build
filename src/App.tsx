
import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { setupOAuthDeepLinkListener } from '@/utils/oauthDeepLink';

import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MainLayout from './layouts/MainLayout';
import LoadingScreen from './components/profile/LoadingScreen';

const Index = lazy(() => import('./pages/Index'));
const Journal = lazy(() => import('./pages/Journal'));
const NewDream = lazy(() => import('./pages/NewDream'));
const EditDream = lazy(() => import('./pages/EditDream'));
const Profile = lazy(() => import('./pages/Profile'));
const Auth = lazy(() => import('./pages/Auth'));
const LucidRepoContainer = lazy(() => import('./pages/LucidRepo'));
const Chat = lazy(() => import('./pages/Chat'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Insights = lazy(() => import('./pages/Insights'));
const LucidStats = lazy(() => import('./pages/LucidStats'));
const TechniqueDetailPage = lazy(() => import('./components/insights/TechniqueDetailPage'));
const DreamStoryPage = lazy(() => import('./pages/DreamStoryPage'));
const DreamBook = lazy(() => import('./pages/DreamBook'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
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
      <Suspense fallback={<LoadingScreen />}>
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
          
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </Suspense>
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
