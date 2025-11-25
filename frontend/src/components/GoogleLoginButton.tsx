// src/components/GoogleLoginButton.tsx

import { GoogleLogin, GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/api'; 
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// Récupération du Client ID depuis les variables d'environnement
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleLoginButtonProps {
  mode: 'login' | 'register';
  onSuccess: () => void; 
}

// Composant qui affiche le bouton de connexion Google
const GoogleLoginButton = ({ mode, onSuccess }: GoogleLoginButtonProps) => {
  const { toast } = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Fonction appelée lorsque l'ID Token est reçu de Google
  const handleSuccess = async (response: CredentialResponse) => {
    // Vérification que nous avons bien l'ID Token
    if (!response.credential) {
      toast({
        title: 'Erreur Google',
        description: 'Aucun jeton d\'identité (ID Token) reçu.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      console.log('🔵 ID Token reçu de Google:', response.credential.substring(0, 50) + '...');
      
      // 1. Envoi de l'ID Token à notre backend
      await authService.googleIDLogin(response.credential);
      
      // 2. Traitement du succès
      toast({
        title: mode === 'login' ? 'Connexion réussie !' : 'Inscription réussie !',
        description: 'Authentification Google finalisée.',
      });
      
      onSuccess(); // Redirige vers le dashboard/onboarding
      
    } catch (error: any) {
      console.error("❌ Google ID Token Login Error:", error);
      toast({
        title: 'Erreur d\'authentification Google',
        description: error.response?.data?.error || 'Une erreur est survenue côté serveur.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Fonction appelée en cas d'échec de l'authentification côté Google
  const handleError = () => {
    console.error('❌ Erreur lors de l\'authentification Google');
    toast({
      title: 'Erreur Google',
      description: 'La connexion avec Google a échoué. Veuillez réessayer.',
      variant: 'destructive',
    });
  };

  // Affichage d'un bouton de chargement si la requête API est en cours
  if (isLoggingIn) {
    return (
      <Button variant="outline" className="w-full" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connexion en cours...
      </Button>
    );
  }

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap={false}
      text={mode === 'login' ? 'signin_with' : 'signup_with'}
      shape="rectangular"
      size="large"
      width="384"
    />
  );
};

// Composant Parent qui initialise GoogleOAuthProvider
const GoogleAuthWrapper = (props: GoogleLoginButtonProps) => {
  if (!GOOGLE_CLIENT_ID) {
    console.error("❌ VITE_GOOGLE_CLIENT_ID n'est pas défini dans .env");
    return (
      <div className="text-sm text-destructive text-center">
        Configuration Google manquante
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLoginButton {...props} />
    </GoogleOAuthProvider>
  );
}

export default GoogleAuthWrapper;