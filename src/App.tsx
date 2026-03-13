
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
import DreamConnections from './pages/DreamConnections';
import TechniqueDetailPage from './components/insights/TechniqueDetailPage';
import DreamStoryPage from './pages/DreamStoryPage';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ColorSchemeProvider } from "@/contexts/ColorSchemeContext";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    setupOAuthDeepLinkListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ColorSchemeProvider>
            
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
                  <Route path="connections" element={<DreamConnections />} />
                  <Route path="lucid-repo" element={<LucidRepoContainer />} />
                  <Route path="lucid-repo/:dreamId" element={<LucidRepoContainer />} />
                  <Route path="dream/:dreamId" element={<DreamStoryPage />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="insights" element={<Insights />} />
                  <Route path="insights/technique/:id" element={<TechniqueDetailPage />} />
                  <Route path="learn" element={<Learn />} />
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
            </ColorSchemeProvider>
          </ThemeProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
