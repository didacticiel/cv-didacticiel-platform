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
import { educationService } from '@/services/api';
import { Loader2, Trash2, Plus } from 'lucide-react';
import type { CV, Education } from '@/types/api.types';

const educationSchema = z.object({
  degree: z.string().min(1, 'Le diplôme est requis'),
  institution: z.string().min(1, "L'établissement est requis"),
  location: z.string().optional(),
  start_date: z.string().min(1, 'La date de début est requise'),
  end_date: z.string().optional(),
  is_current: z.boolean(),
  description: z.string().optional(),
});

type EducationFormData = z.infer<typeof educationSchema>;

interface EditEducationFormProps {
  cv: CV;
  onUpdate: () => void;
}

export const EditEducationForm = ({ cv, onUpdate }: EditEducationFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCurrent, setIsCurrent] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      is_current: false,
    },
  });

  const handleDelete = async (eduId: number) => {
    setIsLoading(true);
    try {
      await educationService.delete(eduId);
      toast({
        title: 'Succès',
        description: 'Formation supprimée',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la formation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EducationFormData) => {
    setIsLoading(true);
    try {
      const eduData = {
        degree: data.degree,
        institution: data.institution,
        location: data.location,
        start_date: data.start_date,
        description: data.description,
        is_current: isCurrent,
        end_date: isCurrent ? undefined : data.end_date,
      };

      if (editingEdu) {
        await educationService.update(editingEdu.id, eduData);
        toast({
          title: 'Succès',
          description: 'Formation mise à jour',
        });
      } else {
        const order = cv.educations ? cv.educations.length : 0;
        await educationService.create({ ...eduData, cv: cv.id, order });
        toast({
          title: 'Succès',
          description: 'Formation ajoutée',
        });
      }
      
      reset();
      setEditingEdu(null);
      setShowAddForm(false);
      setIsCurrent(false);
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la formation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (edu: Education) => {
    setEditingEdu(edu);
    setShowAddForm(true);
    setIsCurrent(edu.is_current);
    reset({
      degree: edu.degree,
      institution: edu.institution,
      location: edu.location || '',
      start_date: edu.start_date,
      end_date: edu.end_date || '',
      is_current: edu.is_current,
      description: edu.description || '',
    });
  };

  const cancelEdit = () => {
    setEditingEdu(null);
    setShowAddForm(false);
    setIsCurrent(false);
    reset();
  };

  return (
    <div className="space-y-4">
      {/* Liste des formations */}
      <div className="space-y-2">
        {cv.educations && cv.educations.length > 0 ? (
          cv.educations.map((edu) => (
            <div
              key={edu.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-card-foreground">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(edu.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })}
                    {' - '}
                    {edu.is_current ? 'En cours' : edu.end_date ? new Date(edu.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' }) : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(edu)}
                    disabled={isLoading}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(edu.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {edu.description && (
                <p className="text-xs text-muted-foreground">{edu.description}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Aucune formation ajoutée
          </p>
        )}
      </div>

      {/* Formulaire d'ajout/édition */}
      {showAddForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
          <div>
            <Label htmlFor="degree">Diplôme</Label>
            <Input
              id="degree"
              {...register('degree')}
              placeholder="Ex: Master en Informatique"
            />
            {errors.degree && (
              <p className="mt-1 text-xs text-destructive">{errors.degree.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="institution">Établissement</Label>
            <Input
              id="institution"
              {...register('institution')}
              placeholder="Ex: Université Paris-Saclay"
            />
            {errors.institution && (
              <p className="mt-1 text-xs text-destructive">{errors.institution.message}</p>
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
              Formation en cours
            </Label>
          </div>

          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Décrivez votre formation, spécialisation, projets..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingEdu ? 'Mettre à jour' : 'Ajouter'}
            </Button>
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Annuler
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une formation
        </Button>
      )}
    </div>
  );
};
