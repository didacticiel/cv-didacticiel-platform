import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { experienceService } from '@/services/api';
import { Loader2, Trash2, Plus } from 'lucide-react';
import type { CV, Experience } from '@/types/api.types';

const experienceSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  company: z.string().min(1, "L'entreprise est requise"),
  location: z.string().optional(),
  start_date: z.string().min(1, 'La date de début est requise'),
  end_date: z.string().optional(),
  is_current: z.boolean(),
  description: z.string().optional(),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

interface EditExperienceFormProps {
  cv: CV;
  onUpdate: () => void;
}

export const EditExperienceForm = ({ cv, onUpdate }: EditExperienceFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCurrent, setIsCurrent] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      is_current: false,
    },
  });

  const handleDelete = async (expId: number) => {
    setIsLoading(true);
    try {
      await experienceService.delete(expId);
      toast({
        title: 'Succès',
        description: 'Expérience supprimée',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'expérience",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ExperienceFormData) => {
    setIsLoading(true);
    try {
      const expData = {
        title: data.title,
        company: data.company,
        location: data.location,
        start_date: data.start_date,
        description: data.description,
        is_current: isCurrent,
        end_date: isCurrent ? undefined : data.end_date,
      };

      if (editingExp) {
        await experienceService.update(editingExp.id, expData);
        toast({
          title: 'Succès',
          description: 'Expérience mise à jour',
        });
      } else {
        const order = cv.experiences ? cv.experiences.length : 0;
        await experienceService.create({ ...expData, cv: cv.id, order });
        toast({
          title: 'Succès',
          description: 'Expérience ajoutée',
        });
      }
      
      reset();
      setEditingExp(null);
      setShowAddForm(false);
      setIsCurrent(false);
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible de sauvegarder l'expérience",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (exp: Experience) => {
    setEditingExp(exp);
    setShowAddForm(true);
    setIsCurrent(exp.is_current);
    reset({
      title: exp.title,
      company: exp.company,
      location: exp.location || '',
      start_date: exp.start_date,
      end_date: exp.end_date || '',
      is_current: exp.is_current,
      description: exp.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingExp(null);
    setShowAddForm(false);
    setIsCurrent(false);
    reset();
  };

  return (
    <div className="space-y-4">
      {/* Liste des expériences */}
      <div className="space-y-2">
        {cv.experiences && cv.experiences.length > 0 ? (
          cv.experiences.map((exp) => (
            <div
              key={exp.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-card-foreground">{exp.title}</p>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(exp.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}
                    {' - '}
                    {exp.is_current ? 'Présent' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' }) : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(exp)}
                    disabled={isLoading}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(exp.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {exp.description && (
                <p className="text-xs text-muted-foreground">{exp.description}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Aucune expérience ajoutée
          </p>
        )}
      </div>

      {/* Formulaire d'ajout/édition */}
      {showAddForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
          <div>
            <Label htmlFor="title">Titre du poste</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Ex: Développeur Full Stack"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="company">Entreprise</Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="Ex: Google"
            />
            {errors.company && (
              <p className="mt-1 text-xs text-destructive">{errors.company.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Lieu (optionnel)</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Ex: Paris, France"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                id="start_date"
                type="month"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-destructive">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="month"
                {...register('end_date')}
                disabled={isCurrent}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={isCurrent}
              onCheckedChange={(checked) => setIsCurrent(checked as boolean)}
            />
            <Label htmlFor="is_current" className="cursor-pointer">
              J'occupe actuellement ce poste
            </Label>
          </div>

          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Décrivez vos responsabilités et réalisations..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingExp ? 'Mettre à jour' : 'Ajouter'}
            </Button>
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Annuler
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une expérience
        </Button>
      )}
    </div>
  );
};
