
import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { setupOAuthDeepLinkListener } from '@/utils/oauthDeepLink';

import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MainLayout from './layouts/MainLayout';
import LoadingScreen from './components/profile/LoadingScreen';

// Retry dynamic imports once after a hard reload to recover from stale chunk
// references that occur after a new deploy invalidates previous asset hashes.
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const key = 'lovable:chunk-reload';
    try {
      return await factory();
    } catch (err: any) {
      const msg = String(err?.message || err);
      const isChunkErr =
        msg.includes('Importing a module script failed') ||
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('error loading dynamically imported module');
      if (isChunkErr && typeof window !== 'undefined') {
        const alreadyReloaded = sessionStorage.getItem(key);
        if (!alreadyReloaded) {
          sessionStorage.setItem(key, '1');
          window.location.reload();
          // Return a never-resolving promise so Suspense keeps the fallback
          // visible until the reload completes.
          return new Promise(() => {}) as any;
        }
      }
      throw err;
    }
  });
}

const Index = lazyWithRetry(() => import('./pages/Index'));
const Journal = lazyWithRetry(() => import('./pages/Journal'));
const NewDream = lazyWithRetry(() => import('./pages/NewDream'));
const EditDream = lazyWithRetry(() => import('./pages/EditDream'));
const Profile = lazyWithRetry(() => import('./pages/Profile'));
const Auth = lazyWithRetry(() => import('./pages/Auth'));
const LucidRepoContainer = lazyWithRetry(() => import('./pages/LucidRepo'));
const Chat = lazyWithRetry(() => import('./pages/Chat'));
const Notifications = lazyWithRetry(() => import('./pages/Notifications'));
const Insights = lazyWithRetry(() => import('./pages/Insights'));
const TechniqueDetailPage = lazyWithRetry(() => import('./components/insights/TechniqueDetailPage'));
const DreamStoryPage = lazyWithRetry(() => import('./pages/DreamStoryPage'));
const DreamBook = lazyWithRetry(() => import('./pages/DreamBook'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'));
const OnboardingPreview = lazyWithRetry(() => import('./pages/OnboardingPreview'));

// Clear the reload guard on successful boot so future stale chunks can retry.
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    sessionStorage.removeItem('lovable:chunk-reload');
  });
}
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
        <Route path="/onboarding" element={<OnboardingPreview />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Index />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/new" element={<NewDream />} />
          <Route path="journal/edit/:dreamId" element={<EditDream />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:userId" element={<Profile />} />
          <Route path="profile/:username" element={<Profile />} />
          <Route path="auth" element={<Auth />} />
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
