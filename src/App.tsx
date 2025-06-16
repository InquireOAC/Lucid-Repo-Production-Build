
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from './pages/Index';
import Journal from './pages/Journal';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import LucidRepoContainer from './pages/LucidRepo';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Index />} />
                  <Route path="journal" element={<Journal />} />
                  <Route path="profile/:identifier?" element={<Profile />} />
                  <Route path="auth" element={<Auth />} />
                  <Route path="lucid-repo" element={<LucidRepoContainer />} />
                  <Route path="lucid-repo/:dreamId" element={<LucidRepoContainer />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
