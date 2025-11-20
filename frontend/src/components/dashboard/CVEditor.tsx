import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditCVBasicForm } from './EditCVBasicForm';
import { EditContactForm } from './EditContactForm';
import { EditSkillsForm } from './EditSkillsForm';
import { EditExperienceForm } from './EditExperienceForm';
import { EditEducationForm } from './EditEducationForm';
import { FileText, User, Briefcase, GraduationCap, Award } from 'lucide-react';
import type { CV } from '@/types/api.types';

interface CVEditorProps {
  cv: CV;
  onUpdate: () => void;
}

export const CVEditor = ({ cv, onUpdate }: CVEditorProps) => {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-card-foreground">
        Éditer le CV
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">CV</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Expérience</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Formation</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Compétences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <EditCVBasicForm cv={cv} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <EditContactForm cv={cv} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="experience" className="mt-4">
          <EditExperienceForm cv={cv} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="education" className="mt-4">
          <EditEducationForm cv={cv} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="skills" className="mt-4">
          <EditSkillsForm cv={cv} onUpdate={onUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
