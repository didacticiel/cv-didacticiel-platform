import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { skillService } from '@/services/api';
import { Loader2, Trash2, Plus } from 'lucide-react';
import type { CV, Skill } from '@/types/api.types';

const skillSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
});

type SkillFormData = z.infer<typeof skillSchema>;

interface EditSkillsFormProps {
  cv: CV;
  onUpdate: () => void;
}

export const EditSkillsForm = ({ cv, onUpdate }: EditSkillsFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('intermediate');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
  });

  const handleDelete = async (skillId: number) => {
    setIsLoading(true);
    try {
      await skillService.delete(skillId);
      toast({
        title: 'Succès',
        description: 'Compétence supprimée',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la compétence',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SkillFormData) => {
    setIsLoading(true);
    try {
      const skillData = {
        name: data.name,
        level: selectedLevel as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      };

      if (editingSkill) {
        await skillService.update(editingSkill.id, skillData);
        toast({
          title: 'Succès',
          description: 'Compétence mise à jour',
        });
      } else {
        const order = cv.skills ? cv.skills.length : 0;
        await skillService.create({ ...skillData, cv: cv.id, order });
        toast({
          title: 'Succès',
          description: 'Compétence ajoutée',
        });
      }
      
      reset();
      setEditingSkill(null);
      setShowAddForm(false);
      setSelectedLevel('intermediate');
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la compétence',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setShowAddForm(true);
    setSelectedLevel(skill.level || 'intermediate');
    reset({ name: skill.name });
  };

  const cancelEdit = () => {
    setEditingSkill(null);
    setShowAddForm(false);
    setSelectedLevel('intermediate');
    reset();
  };

  const levelLabels = {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    expert: 'Expert',
  };

  return (
    <div className="space-y-4">
      {/* Liste des compétences */}
      <div className="space-y-2">
        {cv.skills && cv.skills.length > 0 ? (
          cv.skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
            >
              <div>
                <p className="font-medium text-card-foreground">{skill.name}</p>
                {skill.level && (
                  <p className="text-xs text-muted-foreground">
                    {levelLabels[skill.level]}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEdit(skill)}
                  disabled={isLoading}
                >
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(skill.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Aucune compétence ajoutée
          </p>
        )}
      </div>

      {/* Formulaire d'ajout/édition */}
      {showAddForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
          <div>
            <Label htmlFor="name">Nom de la compétence</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: React, Python, Gestion de projet..."
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="level">Niveau</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Débutant</SelectItem>
                <SelectItem value="intermediate">Intermédiaire</SelectItem>
                <SelectItem value="advanced">Avancé</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSkill ? 'Mettre à jour' : 'Ajouter'}
            </Button>
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Annuler
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une compétence
        </Button>
      )}
    </div>
  );
};
