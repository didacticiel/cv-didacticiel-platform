import { useState } from 'react';
import { Crown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { downloadPDF, type TemplateType } from '@/lib/pdf-generator';
import { TemplateSelector } from './TemplateSelector';
import type { CV } from '@/types/api.types';

interface CVPreviewProps {
  cv: CV | null;
  isPremium: boolean;
  onUpgradeToPremium?: () => void;
}

export const CVPreview = ({ cv, isPremium, onUpgradeToPremium }: CVPreviewProps) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cv || !isPremium) return;

    setIsDownloading(true);
    try {
      await downloadPDF(cv, selectedTemplate);
      toast({
        title: 'Téléchargement réussi',
        description: 'Votre CV a été téléchargé avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le PDF',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-card-foreground">
          Aperçu du CV
        </h2>
        {!isPremium && (
          <Button variant="default" size="sm" className="gap-2" onClick={onUpgradeToPremium}>
            <Crown className="h-4 w-4" />
            Premium
          </Button>
        )}
      </div>
      
      <div className="relative rounded-lg border border-cv-border bg-cv-background p-8">
        {!isPremium && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
            <div className="rotate-[-15deg] text-center">
              <p className="text-3xl font-bold text-foreground/30">
                VERSION DÉMO
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Abonnez-vous pour télécharger
              </p>
            </div>
          </div>
        )}
        
        {cv ? (
          <div className="space-y-6">
            <div className="border-b border-cv-border pb-4">
              <h3 className="text-2xl font-bold text-cv-heading">{cv.title}</h3>
              {cv.summary && (
                <p className="mt-2 text-sm text-cv-text">{cv.summary}</p>
              )}
            </div>

            {cv.contact && (
              <div className="space-y-1 text-sm text-cv-text">
                <p>{cv.contact.email}</p>
                <p>{cv.contact.phone_number}</p>
                <p>{cv.contact.city}{cv.contact.country && `, ${cv.contact.country}`}</p>
              </div>
            )}

            {cv.skills && cv.skills.length > 0 && (
              <div>
                <h4 className="mb-2 text-lg font-semibold text-cv-heading">Compétences</h4>
                <div className="flex flex-wrap gap-2">
                  {cv.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cv.experiences && cv.experiences.length > 0 && (
              <div>
                <h4 className="mb-3 text-lg font-semibold text-cv-heading">Expérience</h4>
                {cv.experiences.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <p className="font-semibold text-cv-text">{exp.title}</p>
                    <p className="text-sm text-cv-text">{exp.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(exp.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                      {' - '}
                      {exp.is_current ? 'Présent' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : ''}
                    </p>
                    {exp.description && (
                      <p className="mt-1 text-xs text-cv-text">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {cv.educations && cv.educations.length > 0 && (
              <div>
                <h4 className="mb-3 text-lg font-semibold text-cv-heading">Formation</h4>
                {cv.educations.map((edu) => (
                  <div key={edu.id} className="mb-3">
                    <p className="font-semibold text-cv-text">{edu.degree}</p>
                    <p className="text-sm text-cv-text">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(edu.start_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                      {' - '}
                      {edu.is_current ? 'En cours' : edu.end_date ? new Date(edu.end_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Aucun CV disponible</p>
        )}
      </div>

      {isPremium && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
          />
        </div>
      )}

      <div className="mt-4">
        <Button
          className="w-full gap-2"
          disabled={!isPremium || isDownloading}
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          {isDownloading ? 'Téléchargement...' : 'Télécharger PDF'}
        </Button>
        {!isPremium && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            L'abonnement Premium est requis pour télécharger
          </p>
        )}
      </div>
    </div>
  );
};
