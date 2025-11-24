import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Importation des pages
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DocumentStep from "./pages/onboarding/DocumentStep";
import ContactStep from "./pages/onboarding/ContactStep";
import SkillsStep from "./pages/onboarding/SkillsStep";
import ExperienceStep from "./pages/onboarding/ExperienceStep";
import EducationStep from "./pages/onboarding/EducationStep";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
// 🎯 AJOUT : Importer la nouvelle page de callback pour l'authentification sociale
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const AppContent = () => {
  const { setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          setUser(user);
        } catch (error) {
          // Si le token est invalide, on le supprime et on déconnecte l'utilisateur
          console.error("Failed to get current user:", error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      // Dans tous les cas, on arrête le chargement initial
      setIsLoading(false);
    };

    initAuth();
  }, [setUser, setIsLoading]);

  return (
    <Routes>
      {/* --- Pages publiques --- */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      
      {/* 🎯 AJOUT : Route pour le callback de l'authentification sociale */}
      {/* Cette route doit être accessible sans authentification. 
          Elle est utilisée par la popup de Google pour finaliser la connexion. */}
      <Route path="/auth/social/callback" element={<AuthCallback />} />
      
      {/* --- Pages protégées (nécessitent une authentification) --- */}
      <Route path="/onboarding/document" element={
        <ProtectedRoute>
          <DocumentStep />
        </ProtectedRoute>
      } />
      <Route path="/onboarding/contact" element={
        <ProtectedRoute>
          <ContactStep />
        </ProtectedRoute>
      } />
      <Route path="/onboarding/skills" element={
        <ProtectedRoute>
          <SkillsStep />
        </ProtectedRoute>
      } />
      <Route path="/onboarding/experience" element={
        <ProtectedRoute>
          <ExperienceStep />
        </ProtectedRoute>
      } />
      <Route path="/onboarding/education" element={
        <ProtectedRoute>
          <EducationStep />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* --- Page 404 (catch-all) --- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;