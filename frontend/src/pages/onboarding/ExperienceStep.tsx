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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { experienceService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Briefcase } from 'lucide-react';

const experienceSchema = z.object({
  title: z.string().min(2, { message: 'Titre requis' }),
  company: z.string().min(2, { message: 'Entreprise requise' }),
  location: z.string().optional(),
  start_date: z.string().min(1, { message: 'Date de début requise' }),
  end_date: z.string().optional(),
  description: z.string().max(1000).optional(),
  is_current: z.boolean().default(false),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

const ExperienceStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentCV } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isCurrent, setIsCurrent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: { is_current: false },
  });

  const handleCurrentChange = (checked: boolean) => {
    setIsCurrent(checked);
    setValue('is_current', checked);
    if (checked) {
      setValue('end_date', '');
    }
  };

  const onSubmit = async (data: ExperienceFormData) => {
    if (!currentCV) {
      toast({ title: 'Erreur', description: 'Aucun CV trouvé.', variant: 'destructive' });
      navigate('/onboarding/document');
      return;
    }
    setIsLoading(true);
    try {
      const payload: any = {
        cv: currentCV.id,
        title: data.title,
        company: data.company,
        location: data.location || '',
        description: data.description || '',
        order: 0,
        is_current: data.is_current || false,
      };
      // CORRECTION : Formater les dates pour l'API
      if (data.start_date) payload.start_date = `${data.start_date}-01`;
      if (data.is_current) {
        payload.end_date = null;
      } else if (data.end_date) {
        payload.end_date = `${data.end_date}-01`;
      }
      
      await experienceService.create(payload);
      toast({ title: 'Expérience ajoutée !', description: 'Dernière étape : votre formation.' });
      navigate('/onboarding/education');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Impossible d\'ajouter l\'expérience';
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-primary">Étape 4</span><span>/</span><span>5</span>
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Briefcase className="h-6 w-6 text-primary" /> Expérience professionnelle
          </CardTitle>
          <CardDescription>Ajoutez votre expérience la plus récente ou la plus pertinente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Champs du formulaire (inchangés) */}
            <div className="space-y-2"><Label htmlFor="title">Titre du poste *</Label><Input id="title" placeholder="Ex: Développeur Full-Stack" {...register('title')} disabled={isLoading} />{errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="company">Entreprise *</Label><Input id="company" placeholder="Ex: TechCorp" {...register('company')} disabled={isLoading} />{errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}</div>
              <div className="space-y-2"><Label htmlFor="location">Localisation</Label><Input id="location" placeholder="Paris, France" {...register('location')} disabled={isLoading} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="start_date">Date de début *</Label><Input id="start_date" type="month" {...register('start_date')} disabled={isLoading} />{errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}</div>
              <div className="space-y-2"><Label htmlFor="end_date">Date de fin</Label><Input id="end_date" type="month" {...register('end_date')} disabled={isLoading || isCurrent} /></div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is_current" checked={isCurrent} onCheckedChange={handleCurrentChange} disabled={isLoading} />
              <Label htmlFor="is_current" className="cursor-pointer text-sm font-normal">J'occupe actuellement ce poste</Label>
            </div>
            <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" rows={5} placeholder="Décrivez vos missions..." {...register('description')} disabled={isLoading} /></div>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/onboarding/skills')} disabled={isLoading}>Retour</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : 'Continuer'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExperienceStep;