import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { User, Stethoscope, Heart, Shield, Activity } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="animate-fade-in flex flex-col items-center text-center max-w-md">
          <Logo size="lg" />
          
          <h1 className="mt-8 text-3xl font-bold text-foreground leading-tight">
            Your companion for{' '}
            <span className="text-primary">early screening</span>
          </h1>
          
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Simple, friendly tests to help monitor your health journey. 
            We're here to support you every step of the way.
          </p>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm">Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              <span className="text-sm">Caring</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-success" />
              <span className="text-sm">Accurate</span>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mt-12 w-full max-w-sm space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-center text-muted-foreground mb-6">Choose how to continue</p>
          
          <Button
            variant="default"
            size="xl"
            className="w-full gap-4"
            onClick={() => navigate('/patient/auth')}
          >
            <User className="w-6 h-6" />
            I am a Patient
          </Button>

          <Button
            variant="calm"
            size="xl"
            className="w-full gap-4"
            onClick={() => navigate('/doctor/auth')}
          >
            <Stethoscope className="w-6 h-6" />
            I am a Doctor
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Designed with care for accessibility</p>
      </footer>
    </div>
  );
};

export default Welcome;
