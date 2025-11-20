import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cvService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CVPreview } from '@/components/dashboard/CVPreview';
import { CVEditor } from '@/components/dashboard/CVEditor';
import type { CV } from '@/types/api.types';

const Dashboard = () => {
  const { user, currentCV, setCurrentCV } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [cv, setCV] = useState<CV | null>(null);

  const loadCV = async () => {
    try {
      if (currentCV) {
        const data = await cvService.getById(currentCV.id);
        setCV(data);
      } else {
        const cvs = await cvService.list();
        if (cvs.length > 0) {
          const data = await cvService.getById(cvs[0].id);
          setCV(data);
          setCurrentCV(cvs[0]);
        }
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le CV',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCV();
  }, [currentCV, setCurrentCV, toast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPremium = user?.is_premium_subscriber || false;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-semibold text-foreground">
            Bienvenue, {user?.first_name} !
          </h1>
          {!isPremium && (
            <Button variant="default" className="gap-2">
              <Crown className="h-4 w-4" />
              Passer Premium
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* CV Preview Section */}
          <div className="relative">
            <div className="sticky top-8">
              <CVPreview cv={cv} isPremium={isPremium} />
            </div>
          </div>

          {/* Editor Section */}
          <div className="space-y-6">
            {cv && <CVEditor cv={cv} onUpdate={loadCV} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
