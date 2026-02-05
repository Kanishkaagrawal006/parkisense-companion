import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Hand, Mic, PenTool, LogOut, ChevronRight, Award, Clock } from 'lucide-react';

const tests = [
  {
    id: 'tapping',
    name: 'Tapping Test',
    description: 'Measure your finger tapping speed and rhythm',
    icon: Hand,
    color: 'bg-primary-light',
    iconColor: 'text-primary',
    duration: '2-3 min',
    path: '/patient/test/tapping',
  },
  {
    id: 'speech',
    name: 'Speech Test',
    description: 'Read a sentence aloud for voice analysis',
    icon: Mic,
    color: 'bg-success-light',
    iconColor: 'text-success',
    duration: '1-2 min',
    path: '/patient/test/speech',
  },
  {
    id: 'spiral',
    name: 'Spiral Drawing',
    description: 'Draw a spiral to check hand steadiness',
    icon: PenTool,
    color: 'bg-warning-light',
    iconColor: 'text-warning',
    duration: '2-3 min',
    path: '/patient/test/spiral',
  },
];

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <p className="text-muted-foreground text-lg">{getGreeting()},</p>
          <h1 className="text-3xl font-bold text-foreground mt-1">
            {user?.name || 'Friend'} 👋
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Ready for your health check today?
          </p>
        </div>

        {/* Progress Card */}
        <div className="mt-8 bg-gradient-to-br from-primary to-primary-glow rounded-3xl p-6 text-primary-foreground animate-slide-up shadow-button">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm">Your progress</p>
              <p className="text-2xl font-bold">You're doing great!</p>
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-3">
            <div className="bg-white rounded-full h-3 w-1/3 transition-all duration-500" />
          </div>
          <p className="text-sm text-primary-foreground/80 mt-2">1 of 3 tests completed this week</p>
        </div>

        {/* Tests Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">Available Tests</h2>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <button
                key={test.id}
                onClick={() => navigate(test.path)}
                className="w-full test-card flex items-center gap-4 text-left animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-2xl ${test.color} flex items-center justify-center flex-shrink-0`}>
                  <test.icon className={`w-8 h-8 ${test.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground">{test.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{test.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{test.duration}</span>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Encouragement */}
        <div className="mt-10 text-center p-6 bg-success-light rounded-3xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-success font-semibold text-lg">
            💚 Every small step counts towards your well-being
          </p>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
