// src/App.tsx

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
// 🗑️ SUPPRIMÉ : L'importation de AuthCallback n'est plus nécessaire.
// import AuthCallback from "./pages/AuthCallback"; 

const queryClient = new QueryClient();

const AppContent = () => {
  const { setUser, setIsLoading } = useAuthStore();

  // 💡 Logique : Initialisation de l'état d'authentification au chargement de l'application.
  // Elle vérifie si des tokens existent et tente de récupérer les informations utilisateur.
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Tente de récupérer l'utilisateur, validant par la même occasion le token
          const user = await authService.getCurrentUser();
          setUser(user);
        } catch (error) {
          // En cas d'échec (token expiré ou invalide), on nettoie les tokens
          console.error("Failed to get current user:", error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      // Indique que l'état initial de chargement (splash screen potentiel) est terminé
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
      
      {/* 🗑️ SUPPRIMÉ : La route de callback sociale n'est plus utilisée. */}
      {/* <Route path="/auth/social/callback" element={<AuthCallback />} /> */}
      
      {/* --- Pages protégées (nécessitent une authentification) --- */}
      {/* 💡 Logique : Le composant ProtectedRoute vérifie l'état isAuth avant de rendre le composant enfant. */}
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
  // 💡 Logique : Configuration des fournisseurs de contexte globaux (Queries, Toasts, Routing)
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