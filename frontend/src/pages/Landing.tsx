import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Zap, CheckCircle } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: 'Rapide',
      description: 'Créez votre CV professionnel en moins de 5 minutes',
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: 'Professionnel',
      description: 'Des designs élégants et modernes qui impressionnent',
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: 'Simple',
      description: 'Interface intuitive, aucune compétence technique requise',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold text-xl text-foreground">
            <FileText className="h-6 w-6 text-primary" />
            <span>CV Didacticiel</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Connexion
            </Button>
            <Button onClick={() => navigate('/register')}>
              S'inscrire
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4">
        <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Créez votre CV professionnel facilement</span>
          </div>

          <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            Créez votre CV Professionnel{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              en 5 Minutes
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Plateforme intuitive pour créer des CV élégants et professionnels. 
            Guidé étape par étape, sans effort.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="text-base"
              onClick={() => navigate('/register')}
            >
              Commencer Gratuitement
              <FileText className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base"
              onClick={() => navigate('/login')}
            >
              J'ai déjà un compte
            </Button>
          </div>

          {/* Features Grid */}
          <div className="mt-20 grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-6 text-left shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CV Didacticiel. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
