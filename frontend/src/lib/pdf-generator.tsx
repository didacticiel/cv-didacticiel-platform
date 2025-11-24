import { pdf } from '@react-pdf/renderer';
import { ModernTemplate } from './pdf-templates/ModernTemplate';
import { ClassicTemplate } from './pdf-templates/ClassicTemplate';
import { MinimalistTemplate } from './pdf-templates/MinimalistTemplate';
import type { CV } from '@/types/api.types';

export type TemplateType = 'modern' | 'classic' | 'minimalist';

export const generatePDF = async (cv: CV, template: TemplateType = 'modern') => {
  let templateComponent;
  
  switch (template) {
    case 'classic':
      templateComponent = <ClassicTemplate cv={cv} />;
      break;
    case 'minimalist':
      templateComponent = <MinimalistTemplate cv={cv} />;
      break;
    case 'modern':
    default:
      templateComponent = <ModernTemplate cv={cv} />;
      break;
  }

  const blob = await pdf(templateComponent).toBlob();
  return blob;
};

export const downloadPDF = async (cv: CV, template: TemplateType = 'modern') => {
  const blob = await generatePDF(cv, template);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `CV_${cv.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
