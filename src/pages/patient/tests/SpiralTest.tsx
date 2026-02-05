import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PenTool, CheckCircle, RotateCcw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

const SpiralTest = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'drawing' | 'done'>('intro');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (phase === 'drawing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw spiral guide
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'hsl(210, 20%, 90%)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;
        
        for (let i = 0; i < 720; i++) {
          const angle = (i * Math.PI) / 180;
          const radius = (maxRadius * i) / 720;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    }
  }, [phase]);

  const startTest = () => {
    setPhase('drawing');
    setPoints([]);
  };

  const getCanvasCoordinates = (e: React.TouchEvent | React.MouseEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getCanvasCoordinates(e);
    setPoints([point]);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const point = getCanvasCoordinates(e);
    setPoints(prev => [...prev, point]);

    // Draw line
    ctx.strokeStyle = 'hsl(175, 60%, 40%)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      setPoints([]);
      // Redraw guide
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'hsl(210, 20%, 90%)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(centerX, centerY) - 20;
      
      for (let i = 0; i < 720; i++) {
        const angle = (i * Math.PI) / 180;
        const radius = (maxRadius * i) / 720;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  };

  const finishTest = () => {
    setPhase('done');
  };

  const getScore = () => {
    if (points.length < 50) return 'Try drawing more';
    if (points.length > 200) return 'Excellent detail!';
    return 'Good effort!';
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
            <h1 className="font-bold text-lg">Spiral Drawing</h1>
            <p className="text-sm text-muted-foreground">Hand steadiness test</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {phase === 'intro' && (
          <div className="text-center max-w-sm animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-warning-light flex items-center justify-center mx-auto mb-6">
              <PenTool className="w-12 h-12 text-warning" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Spiral Drawing Test</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Trace the spiral pattern shown on screen using your finger. 
              Draw slowly and steadily from the center outward.
            </p>
            <Button size="xl" onClick={startTest} className="w-full">
              Start Drawing
            </Button>
          </div>
        )}

        {phase === 'drawing' && (
          <div className="w-full max-w-sm animate-fade-in">
            <p className="text-center text-muted-foreground mb-4">
              Trace the spiral with your finger
            </p>
            
            <div className="bg-card rounded-3xl p-4 shadow-card">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="w-full h-auto rounded-2xl bg-background touch-none"
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button size="lg" variant="outline" onClick={clearCanvas} className="flex-1 gap-2">
                <RotateCcw className="w-5 h-5" />
                Clear
              </Button>
              <Button size="lg" onClick={finishTest} className="flex-1" disabled={points.length < 20}>
                Done
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Take your time – accuracy matters more than speed 🎯
            </p>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center max-w-sm animate-success">
            <div className="w-24 h-24 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Drawing Complete!</h2>
            <p className="text-success font-semibold text-xl mb-6">{getScore()}</p>
            
            <div className="bg-card rounded-3xl p-6 shadow-card mb-8">
              <p className="text-muted-foreground mb-2">Points recorded</p>
              <div className="text-4xl font-bold text-primary">{points.length}</div>
              <p className="text-sm text-muted-foreground mt-4">
                Your drawing has been saved for analysis.
              </p>
            </div>

            <div className="space-y-3">
              <Button size="lg" onClick={startTest} className="w-full">
                Draw Again
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

export default SpiralTest;
