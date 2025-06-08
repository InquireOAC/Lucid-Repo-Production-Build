
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import Index from "@/pages/Index";
import Journal from "@/pages/Journal";
import LucidRepoContainer from "@/pages/LucidRepoContainer";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import TherapyMode from "@/pages/TherapyMode";
import TherapyAnalysis from "@/pages/TherapyAnalysis";
import NotFound from "@/pages/NotFound";
import "@/App.css";

const queryClient = new QueryClient();

function App() {
  const handleRefresh = () => {
    // Refresh the query client cache
    queryClient.invalidateQueries();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <MainLayout onRefresh={handleRefresh}>
            <Routes>
              <Route path="/" element={<Navigate to="/journal" replace />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/lucid-repo" element={<LucidRepoContainer />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile/:username?" element={<Profile />} />
              <Route path="/therapy" element={<TherapyMode />} />
              <Route path="/therapy/:dreamId" element={<TherapyAnalysis />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </Router>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
