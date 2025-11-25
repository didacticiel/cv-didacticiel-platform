// src/pages/Login.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Composants UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Hooks et Services
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

// Icônes et Types
import { FileText, Loader2 } from 'lucide-react';
import type { LoginCredentials } from '@/types/api.types';

// 🎯 NOUVEAU : Import du composant de bouton Google mis à jour (méthode ID Token)
import GoogleLoginButton from '@/components/GoogleLoginButton'; 

// 1. Schéma de Validation (Zod)
// Définit les règles que les données du formulaire doivent respecter côté client.
const loginSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(1, { message: 'Mot de passe requis' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // useAuthStore est utilisé pour stocker les informations utilisateur après connexion.
  const { setUser } = useAuthStore(); 
  const [isLoading, setIsLoading] = useState(false); // État pour le bouton de soumission standard

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // --------------------------------------------------------------------------
  // 2. Logique de Connexion Standard (Email/Mot de passe)
  // --------------------------------------------------------------------------
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // 1. Appel de l'API de connexion (/auth/login/).
      // Cette fonction stocke les tokens JWT (Access et Refresh) dans le localStorage.
      await authService.login(data as LoginCredentials);
      
      // 2. Récupérer les informations utilisateur pour les stocker dans le state global.
      // Appel à /users/me/ qui nécessite le Access Token dans l'en-tête Authorization.
      const user = await authService.getCurrentUser();
      setUser(user);

      toast({
        title: 'Connexion réussie !',
        description: `Bienvenue ${user.first_name} !`,
      });

      // 3. Redirection vers le tableau de bord
      navigate('/dashboard');
    } catch (error: any) {
      // Gestion des erreurs (ex: 400 Bad Request, Email/Mdp incorrects)
      toast({
        title: 'Erreur de connexion',
        description: error.response?.data?.message || 'Email ou mot de passe incorrect',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 3. Logique de Connexion Google (Callback de succès)
  // --------------------------------------------------------------------------
  // Cette fonction est appelée par le composant GoogleLoginButton APRÈS que 
  // l'ID Token a été envoyé au backend et que les tokens JWT ont été stockés.
  const handleGoogleSuccess = () => {
    // Récupérer les données utilisateur après le login réussi via Google
    // L'appel précédent (authService.googleIDLogin) a déjà stocké les tokens.
    authService.getCurrentUser().then(user => setUser(user));
    
    toast({
      title: 'Connexion réussie !',
      description: 'Bienvenue sur votre tableau de bord.',
    });
    // Redirige l'utilisateur vers le tableau de bord
    navigate('/dashboard');
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Accédez à votre espace de création de CV
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Formulaire de connexion standard */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="jean.dupont@example.com" {...register('email')} disabled={isLoading} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" {...register('password')} disabled={isLoading} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connexion en cours...</>) : ('Se connecter')}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                S'inscrire gratuitement
              </Link>
            </div>
          </form>

          {/* Séparateur et Connexion Google */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continuer avec
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              {/* 🎯 Utilisation du nouveau composant GoogleLoginButton */}
              <GoogleLoginButton mode="login" onSuccess={handleGoogleSuccess} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;