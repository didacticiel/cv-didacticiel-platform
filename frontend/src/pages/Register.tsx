// src/pages/Register.tsx

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
import { FileText, Loader2 } from 'lucide-react';
import type { RegisterData } from '@/types/api.types';

// 🎯 AJOUT : Import du composant de bouton Google
import GoogleAuthButton from '@/components/GoogleAuthButton';

// 1. Définition du Schéma de Validation (Zod)
// Zod est utilisé ici pour valider les données AVANT de les envoyer à l'API.
const registerSchema = z.object({
  // Les champs email, prénom, nom, et mot de passe sont requis.
  email: z.string().email({ message: 'Email invalide' }),
  first_name: z.string().min(2, { message: 'Prénom requis (min. 2 caractères)' }),
  last_name: z.string().min(2, { message: 'Nom requis (min. 2 caractères)' }),
  password: z.string().min(8, { message: 'Mot de passe requis (min. 8 caractères)' }),
  // On garde ce champ pour la validation front-end.
  password_confirm: z.string(), 
}).refine((data) => data.password === data.password_confirm, {
  // Cette règle vérifie que les deux champs de mot de passe correspondent.
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirm'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // État local pour gérer l'affichage du bouton de chargement
  const [isLoading, setIsLoading] = useState(false);

  // Initialisation du formulaire avec react-hook-form et Zod.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // 🎯 AJOUT : Fonction de callback pour le succès de l'authentification Google
  // Cette fonction sera appelée par le composant GoogleAuthButton après une connexion réussie.
  const handleGoogleSuccess = () => {
    toast({
      title: 'Inscription réussie !',
      description: 'Redirection automatique pour créer votre CV.',
    });
    // Redirige l'utilisateur vers le flux d'onboarding, comme pour une inscription classique.
    navigate('/onboarding/document');
  };

  // Fonction appelée à la soumission du formulaire, SI la validation Zod a réussi.
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
        // 💡 CORRECTION CRITIQUE ICI :
        // Le sérialiseur Django exige 'password2' et 'username'. 
        // Nous mappons 'password_confirm' sur 'password2' et utilisons l'email pour 'username'.
        const apiData: RegisterData = {
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            password: data.password,
            password2: data.password_confirm, // <-- Champ requis par Django Serializer
            username: data.email, // <-- Champ requis par le modèle AbstractUser de Django
        };

        // 1. Appel de l'API pour l'inscription (POST /users/register/)
        // Note: La réponse de register() contient déjà les tokens grâce à notre vue Django.
        await authService.register(apiData);
        
        // 2. Récupérer les informations de l'utilisateur nouvellement créé
        const user = await authService.getCurrentUser();

        toast({
            title: 'Inscription réussie !',
            description: `Bienvenue ${user.first_name} !`,
        });

        // 3. Redirection vers la première étape de l'onboarding
        navigate('/onboarding/document');
    } catch (error: any) {
        // Affiche l'erreur renvoyée par l'API (ex: "Cet email est déjà utilisé")
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

  // Rendu du composant
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
          {/* Le handleSubmit enveloppe onSubmit pour gérer la validation Zod */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ... (vos champs de formulaire existants : Prénom, Nom, Email, Mdp, Confirmer Mdp) ... */}
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
                - mode="register" : Affiche le texte "S'inscrire avec Google".
                - onSuccess={handleGoogleSuccess} : Définit la fonction à appeler une fois l'authentification réussie.
              */}
              <GoogleAuthButton mode="register" onSuccess={handleGoogleSuccess} />
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