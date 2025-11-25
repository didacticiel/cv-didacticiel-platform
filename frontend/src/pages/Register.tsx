// src/pages/Register.tsx

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

// Icônes et Types
import { FileText, Loader2 } from 'lucide-react';
import type { RegisterData } from '@/types/api.types';

// 🎯 NOUVEAU : Import du composant de bouton Google mis à jour (méthode ID Token)
import GoogleLoginButton from '@/components/GoogleLoginButton';

// 1. Schéma de Validation (Zod)
const registerSchema = z.object({
  email: z.string().email({ message: 'Email invalide' }),
  first_name: z.string().min(2, { message: 'Prénom requis (min. 2 caractères)' }),
  last_name: z.string().min(2, { message: 'Nom requis (min. 2 caractères)' }),
  password: z.string().min(8, { message: 'Mot de passe requis (min. 8 caractères)' }),
  password_confirm: z.string(), 
}).refine((data) => data.password === data.password_confirm, {
  // Règle de correspondance des mots de passe
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirm'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // État pour le bouton de soumission standard

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // --------------------------------------------------------------------------
  // 2. Logique d'Inscription Standard (Email/Mot de passe)
  // --------------------------------------------------------------------------
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
        // Préparation des données pour l'API. 
        // NOTE: 'password2' et 'username' sont des conventions héritées de dj-rest-auth/Django.
        const apiData: RegisterData = {
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            password: data.password,
            password2: data.password_confirm,
            username: data.email, // L'email est utilisé comme pseudo unique
        };

        // 1. Appel de l'API pour l'inscription (/users/register/)
        // Cette fonction retourne l'utilisateur et stocke les tokens JWT.
        const user = await authService.register(apiData);
        
        // 2. Message de succès et redirection
        toast({
            title: 'Inscription réussie !',
            description: `Bienvenue ${user.first_name} !`,
        });

        // 3. Redirection vers la première étape de l'onboarding
        navigate('/onboarding/document');
    } catch (error: any) {
        // Gestion des erreurs (ex: Email déjà utilisé)
        const errorMessage = error.response?.data?.email?.[0] || 
                             error.response?.data?.message || 
                             'Une erreur est survenue lors de l\'inscription';
        toast({
            title: 'Erreur',
            description: errorMessage,
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 3. Logique d'Inscription Google (Callback de succès)
  // --------------------------------------------------------------------------
  // Cette fonction est appelée par le composant GoogleLoginButton APRÈS l'inscription/connexion réussie.
  const handleGoogleSuccess = () => {
    toast({
      title: 'Inscription réussie !',
      description: 'Redirection automatique pour créer votre CV.',
    });
    // Redirige l'utilisateur vers le flux d'onboarding
    navigate('/onboarding/document');
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Commencez à créer votre CV professionnel gratuitement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Champs de formulaire (Prénom, Nom, Email, Mdp, Confirmer Mdp) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input id="first_name" placeholder="Jean" {...register('first_name')} disabled={isLoading} />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input id="last_name" placeholder="Dupont" {...register('last_name')} disabled={isLoading} />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
              </div>
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="password_confirm">Confirmer le mot de passe</Label>
              <Input id="password_confirm" type="password" {...register('password_confirm')} disabled={isLoading} />
              {errors.password_confirm && <p className="text-sm text-destructive">{errors.password_confirm.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inscription en cours...</>) : ('S\'inscrire')}
            </Button>
          </form>
          
          {/* Séparateur et Inscription Google */}
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
              <GoogleLoginButton mode="register" onSuccess={handleGoogleSuccess} />
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;