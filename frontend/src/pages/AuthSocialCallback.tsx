// src/pages/AuthSocialCallback.tsx
import { useEffect, useState } => 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AuthSocialCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupère les paramètres d'URL (URLSearchParams)
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');
    const state = queryParams.get('state');
    const errorParam = queryParams.get('error');

    // 1. Gérer l'erreur de Google (si l'utilisateur annule ou si le Client ID est invalide)
    if (errorParam) {
      setError(`Erreur d'autorisation Google: ${errorParam}`);
      // Envoie le message d'erreur à la fenêtre parente avant de fermer
      if (window.opener) {
        window.opener.postMessage({ type: 'authError', error: errorParam }, window.location.origin);
        window.close();
      }
      return;
    }

    // 2. Gérer le succès et l'échange de code
    if (code && state) {
      const storedState = localStorage.getItem('oauth_state');
      localStorage.removeItem('oauth_state');

      // Vérification CSRF
      if (state !== storedState) {
        setError('Erreur de sécurité: État CSRF invalide.');
        return;
      }
      
      // 💡 Envoie le code et le state à la fenêtre parente via postMessage.
      // C'est cette communication qui est capturée par `GoogleAuthButton.tsx`.
      if (window.opener) {
        window.opener.postMessage({ type: 'authSuccess', code, state }, window.location.origin);
        window.close();
      } else {
        // Cas où la page est ouverte directement (ne devrait pas arriver en production)
        setError("La fenêtre parente n'a pas pu être contactée.");
        // Vous pouvez rediriger vers la page d'accueil si vous le souhaitez
        navigate('/');
      }
    }
  }, [location.search, navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        {error ? (
          <p className="text-red-600 text-lg">
            {error}
          </p>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h1 className="mt-4 text-xl font-semibold text-gray-900">
              Connexion en cours...
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Veuillez patienter pendant la finalisation de l'authentification.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthSocialCallback;