import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hand, CheckCircle } from 'lucide-react';

const TappingTest = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'test' | 'done'>('intro');
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setPhase('done');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTest = () => {
    setPhase('test');
    setTapCount(0);
    setTimeLeft(10);
    setIsActive(true);
  };

  const handleTap = useCallback(() => {
    if (isActive) {
      setTapCount(prev => prev + 1);
    }
  }, [isActive]);

  const getScore = () => {
    const tapsPerSecond = tapCount / 10;
    if (tapsPerSecond >= 5) return 'Excellent';
    if (tapsPerSecond >= 3) return 'Good';
    if (tapsPerSecond >= 2) return 'Fair';
    return 'Keep Practicing';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card shadow-soft px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="font-bold text-lg">Tapping Test</h1>
            <p className="text-sm text-muted-foreground">Measure your tapping speed</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {phase === 'intro' && (
          <div className="text-center max-w-sm animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-6">
              <Hand className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to begin?</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Tap the circle as fast as you can for 10 seconds. 
              Use your index finger and maintain a steady rhythm.
            </p>
            <Button size="xl" onClick={startTest} className="w-full">
              Start Test
            </Button>
          </div>
        )}

        {phase === 'test' && (
          <div className="text-center animate-fade-in">
            <div className="text-6xl font-bold text-primary mb-4">{timeLeft}s</div>
            <p className="text-muted-foreground text-lg mb-8">Tap the circle below!</p>
            
            <button
              onClick={handleTap}
              className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary-glow shadow-button active:scale-95 transition-transform flex items-center justify-center"
            >
              <span className="text-5xl font-bold text-primary-foreground">{tapCount}</span>
            </button>
            
            <p className="mt-6 text-lg text-muted-foreground">Keep going! You're doing great! 💪</p>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center max-w-sm animate-success">
            <div className="w-24 h-24 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Test Complete!</h2>
            <p className="text-success font-semibold text-xl mb-6">{getScore()}</p>
            
            <div className="bg-card rounded-3xl p-6 shadow-card mb-8">
              <div className="text-5xl font-bold text-primary mb-2">{tapCount}</div>
              <p className="text-muted-foreground">taps in 10 seconds</p>
              <p className="text-sm text-muted-foreground mt-2">
                {(tapCount / 10).toFixed(1)} taps per second
              </p>
            </div>

            <div className="space-y-3">
              <Button size="lg" onClick={startTest} className="w-full">
                Try Again
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/patient/dashboard')} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TappingTest;
