import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { contactService } from '@/services/api';
import { Loader2 } from 'lucide-react';
import type { CV } from '@/types/api.types';

const contactSchema = z.object({
  email: z.string().email('Email invalide'),
  phone_number: z.string().min(1, 'Le téléphone est requis'),
  city: z.string().min(1, 'La ville est requise'),
  country: z.string().optional(),
  linkedin_url: z.string().url('URL invalide').optional().or(z.literal('')),
  portfolio_url: z.string().url('URL invalide').optional().or(z.literal('')),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface EditContactFormProps {
  cv: CV;
  onUpdate: () => void;
}

export const EditContactForm = ({ cv, onUpdate }: EditContactFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: cv.contact?.email || '',
      phone_number: cv.contact?.phone_number || '',
      city: cv.contact?.city || '',
      country: cv.contact?.country || '',
      linkedin_url: cv.contact?.linkedin_url || '',
      portfolio_url: cv.contact?.portfolio_url || '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      const contactData = {
        email: data.email,
        phone_number: data.phone_number,
        city: data.city,
        country: data.country || '',
        linkedin_url: data.linkedin_url || '',
        portfolio_url: data.portfolio_url || '',
      };

      if (cv.contact) {
        await contactService.update(cv.contact.id, contactData);
      } else {
        await contactService.create({ ...contactData, cv: cv.id });
      }
      toast({
        title: 'Succès',
        description: 'Coordonnées mises à jour avec succès',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les coordonnées',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="votre.email@exemple.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone_number">Téléphone</Label>
        <Input
          id="phone_number"
          {...register('phone_number')}
          placeholder="+33 6 12 34 56 78"
        />
        {errors.phone_number && (
          <p className="mt-1 text-xs text-destructive">{errors.phone_number.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Paris"
          />
          {errors.city && (
            <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            {...register('country')}
            placeholder="France"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="linkedin_url">LinkedIn (optionnel)</Label>
        <Input
          id="linkedin_url"
          {...register('linkedin_url')}
          placeholder="https://linkedin.com/in/votre-profil"
        />
        {errors.linkedin_url && (
          <p className="mt-1 text-xs text-destructive">{errors.linkedin_url.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="portfolio_url">Portfolio (optionnel)</Label>
        <Input
          id="portfolio_url"
          {...register('portfolio_url')}
          placeholder="https://votre-portfolio.com"
        />
        {errors.portfolio_url && (
          <p className="mt-1 text-xs text-destructive">{errors.portfolio_url.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enregistrer
      </Button>
    </form>
  );
};
