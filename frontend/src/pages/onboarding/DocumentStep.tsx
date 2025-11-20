import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cvService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Loader2, FileText } from 'lucide-react';

const documentSchema = z.object({
  title: z.string().min(3, { message: 'Titre requis (min. 3 caractères)' }).max(100),
  summary: z.string().max(500).optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

const DocumentStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentCV } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });

  const onSubmit = async (data: DocumentFormData) => {
    setIsLoading(true);

    try {
      const cv = await cvService.create({
        title: data.title,
        summary: data.summary,
      });
      setCurrentCV(cv);

      toast({
        title: 'CV créé !',
        description: 'Passons maintenant à vos coordonnées.',
      });

      navigate('/onboarding/contact');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de créer le CV',
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
            <span className="font-medium text-primary">Étape 1</span>
            <span>/</span>
            <span>5</span>
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-primary" />
            Informations générales
          </CardTitle>
          <CardDescription>
            Commencez par donner un titre à votre CV et ajoutez un résumé professionnel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du CV *</Label>
              <Input
                id="title"
                placeholder="Ex: Développeur Full-Stack Senior"
                {...register('title')}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Choisissez un titre qui reflète votre poste ou votre objectif professionnel
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Résumé professionnel (optionnel)</Label>
              <Textarea
                id="summary"
                rows={5}
                placeholder="Ex: Développeur passionné avec 5 ans d'expérience en React et Node.js..."
                {...register('summary')}
                disabled={isLoading}
              />
              {errors.summary && (
                <p className="text-sm text-destructive">{errors.summary.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Décrivez brièvement votre profil et vos objectifs (max. 500 caractères)
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
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

export default DocumentStep;
