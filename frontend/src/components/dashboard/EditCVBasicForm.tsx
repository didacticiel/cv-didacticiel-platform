import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cvService } from '@/services/api';
import { Loader2 } from 'lucide-react';
import type { CV } from '@/types/api.types';

const cvBasicSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  summary: z.string().optional(),
});

type CVBasicFormData = z.infer<typeof cvBasicSchema>;

interface EditCVBasicFormProps {
  cv: CV;
  onUpdate: () => void;
}

export const EditCVBasicForm = ({ cv, onUpdate }: EditCVBasicFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CVBasicFormData>({
    resolver: zodResolver(cvBasicSchema),
    defaultValues: {
      title: cv.title,
      summary: cv.summary || '',
    },
  });

  const onSubmit = async (data: CVBasicFormData) => {
    setIsLoading(true);
    try {
      await cvService.update(cv.id, data);
      toast({
        title: 'Succès',
        description: 'CV mis à jour avec succès',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le CV',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre du CV</Label>
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
        <Label htmlFor="summary">Résumé</Label>
        <Textarea
          id="summary"
          {...register('summary')}
          placeholder="Décrivez brièvement votre profil..."
          rows={4}
        />
        {errors.summary && (
          <p className="mt-1 text-xs text-destructive">{errors.summary.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
};
