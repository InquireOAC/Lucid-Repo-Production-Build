
import React from 'react';
import './App.css';
import Index from "@/pages/Index";
import Journal from "@/pages/Journal";
import LucidRepo from "@/pages/LucidRepo";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import MainLayout from "@/layouts/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

// Use HashRouter for better compatibility with the current setup
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="journal" element={<Journal />} />
            <Route path="lucid-repo" element={<LucidRepo />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:userId" element={<Profile />} />
            <Route path="auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster richColors />
      </AuthProvider>
    </Router>
  );
}

export default App;
