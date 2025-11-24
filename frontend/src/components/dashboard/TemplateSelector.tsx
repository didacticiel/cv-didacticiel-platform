import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import type { TemplateType } from '@/lib/pdf-generator';

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
}

const templates = [
  {
    id: 'modern' as TemplateType,
    name: 'Moderne',
    description: 'Design contemporain avec touches de couleur',
    preview: 'Professionnel et dynamique',
  },
  {
    id: 'classic' as TemplateType,
    name: 'Classique',
    description: 'Style traditionnel et élégant',
    preview: 'Sobre et intemporel',
  },
  {
    id: 'minimalist' as TemplateType,
    name: 'Minimaliste',
    description: 'Épuré et facile à lire',
    preview: 'Simple et efficace',
  },
];

export const TemplateSelector = ({
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-2">
          Choisir un template
        </h3>
        <p className="text-xs text-muted-foreground">
          Sélectionnez le style de votre CV
        </p>
      </div>

      <RadioGroup
        value={selectedTemplate}
        onValueChange={(value) => onTemplateChange(value as TemplateType)}
        className="grid gap-3"
      >
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="flex items-start gap-3 p-4">
              <RadioGroupItem value={template.id} id={template.id} className="mt-0.5" />
              <div className="flex-1">
                <Label
                  htmlFor={template.id}
                  className="cursor-pointer font-medium text-sm text-foreground"
                >
                  {template.name}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </p>
                <p className="text-xs text-primary mt-2 italic">
                  {template.preview}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
};
