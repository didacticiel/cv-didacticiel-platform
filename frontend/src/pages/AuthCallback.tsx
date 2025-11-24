// src/pages/AuthCallback.tsx

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state'); // 🎯 On récupère le state de l'URL
        const error = params.get('error');

        if (error) {
          window.opener.postMessage({ 
            type: 'GOOGLE_AUTH_ERROR', 
            message: 'Vous avez annulé la connexion avec Google.' 
          }, window.location.origin);
          window.close();
          return;
        }

        if (code && state) {
          // 🎯 On envoie le code ET le state à notre API
          await authService.handleGoogleCallback(code, state);
          
          // On récupère les informations de l'utilisateur pour les mettre dans le store
          const user = await authService.getCurrentUser();
          setUser(user);

          // On informe la fenêtre parente que tout s'est bien passé
          window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, window.location.origin);
        }

        // On ferme la popup
        window.close();
      } catch (error: any) {
        console.error('Error handling auth callback:', error);
        window.opener.postMessage({ 
          type: 'GOOGLE_AUTH_ERROR', 
          message: error.response?.data?.detail || 'Une erreur technique est survenue.' 
        }, window.location.origin);
        window.close();
      }
    };

    handleCallback();
  }, [location.search, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Authentification en cours...</p>
      </div>
    </div>
  );
};

export default AuthCallback;