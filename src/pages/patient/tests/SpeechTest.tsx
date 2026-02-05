import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mic, MicOff, CheckCircle, Play } from 'lucide-react';

const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "A rainbow appears after the rain has stopped.",
  "She sells seashells by the seashore every morning.",
];

const SpeechTest = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'recording' | 'done'>('intro');
  const [isRecording, setIsRecording] = useState(false);
  const [sentence] = useState(sentences[Math.floor(Math.random() * sentences.length)]);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = () => {
    setPhase('recording');
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setPhase('done');
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <h1 className="font-bold text-lg">Speech Test</h1>
            <p className="text-sm text-muted-foreground">Voice analysis for screening</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {phase === 'intro' && (
          <div className="text-center max-w-sm animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
              <Mic className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Speech Recording</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              You'll be shown a sentence to read aloud. 
              Speak clearly and at your normal pace. 
              Take your time!
            </p>
            <Button size="xl" onClick={startTest} className="w-full gap-3">
              <Play className="w-6 h-6" />
              Begin Test
            </Button>
          </div>
        )}

        {phase === 'recording' && (
          <div className="text-center max-w-sm animate-fade-in">
            <p className="text-muted-foreground mb-4">Please read this sentence aloud:</p>
            
            <div className="bg-card rounded-3xl p-6 shadow-card mb-8">
              <p className="text-xl font-medium text-foreground leading-relaxed">
                "{sentence}"
              </p>
            </div>

            {isRecording && (
              <div className="mb-6 animate-gentle-pulse">
                <div className="text-4xl font-bold text-destructive mb-2">
                  {formatTime(recordingTime)}
                </div>
                <p className="text-destructive font-medium">Recording...</p>
              </div>
            )}

            <button
              onClick={toggleRecording}
              className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all shadow-button ${
                isRecording 
                  ? 'bg-destructive animate-gentle-pulse' 
                  : 'bg-gradient-to-br from-success to-success/80'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-16 h-16 text-destructive-foreground" />
              ) : (
                <Mic className="w-16 h-16 text-success-foreground" />
              )}
            </button>

            <p className="mt-6 text-lg text-muted-foreground">
              {isRecording ? "Tap to stop when finished" : "Tap to start recording"}
            </p>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center max-w-sm animate-success">
            <div className="w-24 h-24 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Recording Complete!</h2>
            <p className="text-success font-semibold text-xl mb-6">Well done! 🎉</p>
            
            <div className="bg-card rounded-3xl p-6 shadow-card mb-8">
              <p className="text-muted-foreground mb-2">Recording duration</p>
              <div className="text-4xl font-bold text-primary">{formatTime(recordingTime)}</div>
              <p className="text-sm text-muted-foreground mt-4">
                Your voice recording has been saved for analysis.
              </p>
            </div>

            <div className="space-y-3">
              <Button size="lg" onClick={() => { setPhase('recording'); setRecordingTime(0); }} className="w-full">
                Record Again
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

export default SpeechTest;
