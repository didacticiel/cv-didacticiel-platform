import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { skillService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';

// --- MAPPING POUR LA CORRECTION DU 400 BAD REQUEST ---
/**
 * Mappe les valeurs string (Front-End) aux valeurs integer (Back-End)
 * pour le champ 'level'.
 */
const LEVEL_MAPPING: { [key: string]: number } = {
  beginner: 3,
  intermediate: 5,
  advanced: 8,
  expert: 10,
};
// ----------------------------------------------------


const skillSchema = z.object({
  skills: z
    .array(
      z.object({
        name: z.string().min(2, { message: 'Nom requis' }),
        // Nous laissons le schéma accepter les strings car c'est ce que le Select envoie
        level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(), 
      })
    )
    .min(3, { message: 'Au moins 3 compétences requises' }),
});

type SkillsFormData = z.infer<typeof skillSchema>;

const SkillsStep = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentCV } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SkillsFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skills: [{ name: '', level: undefined }, { name: '', level: undefined }, { name: '', level: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  });

  const onSubmit = async (data: SkillsFormData) => {
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
      // Créer toutes les compétences
      await Promise.all(
        data.skills
          .filter(skill => skill.name && skill.level) // Filtrer les lignes vides ou incomplètes
          .map(skill => {
            
            // 💡 CORRECTION : Mappe la chaîne de niveau à un entier
            const mappedLevel = skill.level ? LEVEL_MAPPING[skill.level] : 5;

            return skillService.create({
              cv: currentCV.id,
              name: skill.name,
              level: mappedLevel, // <-- ENVOI DE L'ENTIER CORRIGÉ
              category: 'TECH',  // Valeur par défaut pour le modèle
              // order: index est retiré car ce champ n'existe pas dans le modèle Skill
            });
          })
      );

      toast({
        title: 'Compétences ajoutées !',
        description: 'Passons maintenant à votre expérience.',
      });

      navigate('/onboarding/experience');
    } catch (error: any) {
      // Pour debug, vous pouvez logguer l'erreur détaillée de l'API
      console.error("Erreur de soumission des compétences:", error.response?.data);
      toast({
        title: 'Erreur',
        // Affiche le message d'erreur de la réponse si disponible, sinon un message générique
        description: error.response?.data?.message || JSON.stringify(error.response?.data) || 'Impossible d\'ajouter les compétences',
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
            <span className="font-medium text-primary">Étape 3</span>
            <span>/</span>
            <span>5</span>
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Compétences
          </CardTitle>
          <CardDescription>
            Listez vos compétences clés (minimum 3)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`skills.${index}.name`}>
                      Compétence {index + 1} *
                    </Label>
                    <Input
                      id={`skills.${index}.name`}
                      placeholder="Ex: React, TypeScript, Communication..."
                      {...register(`skills.${index}.name`)}
                      disabled={isLoading}
                    />
                    {errors.skills?.[index]?.name && (
                      <p className="text-sm text-destructive">
                        {errors.skills[index]?.name?.message}
                      </p>
                    )}
                  </div>

                  <div className="w-40 space-y-2">
                    <Label htmlFor={`skills.${index}.level`}>Niveau</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue(`skills.${index}.level`, value as any)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Débutant</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {fields.length > 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => remove(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {errors.skills && typeof errors.skills.message === 'string' && (
                <p className="text-sm text-destructive">{errors.skills.message}</p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', level: undefined })}
              disabled={isLoading}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une compétence
            </Button>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/onboarding/contact')}
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

export default SkillsStep;