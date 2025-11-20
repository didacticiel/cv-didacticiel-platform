import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { contactService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Loader2, MapPin } from 'lucide-react';

const contactSchema = z.object({
  phone_number: z.string().min(10, { message: 'Numéro de téléphone invalide' }),
  email: z.string().email({ message: 'Email invalide' }),
  city: z.string().min(2, { message: 'Ville requise' }),
  country: z.string().optional(),
  linkedin_url: z.string().url({ message: 'URL invalide' }).optional().or(z.literal('')),
  portfolio_url: z.string().url({ message: 'URL invalide' }).optional().or(z.literal('')),
  
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentCV } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

 const onSubmit = async (data: ContactFormData) => {
    if (!currentCV) {
      toast({
        title: 'Erreur',
        description: 'Aucun CV trouvé. Veuillez recommencer.',
        variant: 'destructive',
      });
      navigate('/onboarding/document');
      return;
    }

    setIsLoading(true);

    try {
      // 💡 CORRECTION DU MAPPAGE : 
      // Votre modèle Django utilise `website_url`, le formulaire utilise `portfolio_url`.
      await contactService.create({
        cv: currentCV.id,
        phone_number: data.phone_number,
        email: data.email,
        city: data.city,
        country: data.country,
        linkedin_url: data.linkedin_url,
        // Correction ici: on mappe le champ du formulaire vers le champ de l'API
        website_url: data.portfolio_url, 
        // Note: github_url n'est pas envoyé s'il n'est pas dans le formulaire, ce qui est correct s'il est facultatif.
      });

      toast({
        title: 'Coordonnées enregistrées !',
        description: 'Ajoutons maintenant vos compétences.',
      });

      navigate('/onboarding/skills');
    } catch (error: any) {
      // ⚠️ ASSUREZ-VOUS QUE LA GESTION D'ERREUR EST CORRECTE
      const errorMessage = error.response?.data?.email?.[0] || // Tente d'afficher l'erreur d'email
                           error.response?.data?.message || 
                           'Impossible d\'enregistrer les coordonnées';

      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-primary">Étape 2</span>
            <span>/</span>
            <span>5</span>
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MapPin className="h-6 w-6 text-primary" />
            Coordonnées
          </CardTitle>
          <CardDescription>
            Ajoutez vos informations de contact pour que les recruteurs puissent vous joindre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Téléphone *</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  {...register('phone_number')}
                  disabled={isLoading}
                />
                {errors.phone_number && (
                  <p className="text-sm text-destructive">{errors.phone_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@example.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  placeholder="Paris"
                  {...register('city')}
                  disabled={isLoading}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays (optionnel)</Label>
                <Input
                  id="country"
                  placeholder="France"
                  {...register('country')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn (optionnel)</Label>
              <Input
                id="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/votre-profil"
                {...register('linkedin_url')}
                disabled={isLoading}
              />
              {errors.linkedin_url && (
                <p className="text-sm text-destructive">{errors.linkedin_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio/Site web (optionnel)</Label>
              <Input
                id="portfolio_url"
                type="url"
                placeholder="https://votre-portfolio.com"
                {...register('portfolio_url')}
                disabled={isLoading}
              />
              {errors.portfolio_url && (
                <p className="text-sm text-destructive">{errors.portfolio_url.message}</p>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/onboarding/document')}
              >
                Retour
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Continuer'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactStep;
