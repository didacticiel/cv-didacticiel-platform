import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      } else {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [setUser, setIsLoading]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      
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
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
