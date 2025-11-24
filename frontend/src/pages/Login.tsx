// src/pages/Login.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { FileText, Loader2 } from 'lucide-react';
import type { LoginCredentials } from '@/types/api.types';

// 🎯 AJOUT : Import du composant de bouton Google
import GoogleAuthButton from '@/components/GoogleAuthButton';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(1, { message: 'Mot de passe requis' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 🎯 AJOUT : Fonction de callback pour le succès de l'authentification Google
  // Cette fonction sera appelée par le composant GoogleAuthButton après une connexion réussie.
  const handleGoogleSuccess = () => {
    toast({
      title: 'Connexion réussie !',
      description: 'Bienvenue sur votre tableau de bord.',
    });
    // Redirige l'utilisateur vers le tableau de bord, comme pour une connexion classique.
    navigate('/dashboard');
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await authService.login(data as LoginCredentials);
      
      // Récupérer les informations utilisateur pour les stocker dans le state global
      const user = await authService.getCurrentUser();
      setUser(user);

      toast({
        title: 'Connexion réussie !',
        description: `Bienvenue ${user.first_name} !`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.response?.data?.message || 'Email ou mot de passe incorrect',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ... (vos champs de formulaire existants : Email, Mdp) ... */}
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

          {/* 🎯 AJOUT : Séparateur visuel et bouton d'authentification Google */}
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
            
            <div className="mt-4">
              {/* 
                Le composant GoogleAuthButton gère toute la logique d'authentification OAuth.
                - mode="login" : Affiche le texte "Se connecter avec Google".
                - onSuccess={handleGoogleSuccess} : Définit la fonction à appeler une fois l'authentification réussie.
              */}
              <GoogleAuthButton mode="login" onSuccess={handleGoogleSuccess} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;