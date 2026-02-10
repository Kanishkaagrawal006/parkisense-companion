import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mic, MicOff, CheckCircle, Play, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { analyzeSpeech, computeSpeechScore, type SpeechFeatures } from '@/lib/speechAnalysis';
import { saveTestResult } from '@/lib/firestore';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { toast } from 'sonner';

const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "A rainbow appears after the rain has stopped.",
  "She sells seashells by the seashore every morning.",
];

const SpeechTest = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const [phase, setPhase] = useState<'intro' | 'recording' | 'analyzing' | 'results' | 'done'>('intro');
  const [isRecording, setIsRecording] = useState(false);
  const [sentence] = useState(sentences[Math.floor(Math.random() * sentences.length)]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [features, setFeatures] = useState<SpeechFeatures | null>(null);
  const [score, setScore] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPhase('recording');
    } catch {
      toast.error('Microphone access is required for this test.');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      // Start
      if (!streamRef.current) return;
      chunksRef.current = [];
      const recorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Release mic
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setPhase('analyzing');

        try {
          const result = await analyzeSpeech(blob, sentence);
          const s = computeSpeechScore(result);
          setFeatures(result);
          setScore(s);
          setPhase('results');
        } catch (err) {
          console.error('Speech analysis failed:', err);
          toast.error('Analysis failed. Please try again.');
          setPhase('recording');
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    }
  };

  const saveResults = async () => {
    if (!user || !features) return;
    try {
      await saveTestResult({
        patientId: user.id,
        testType: 'speech',
        score,
        details: { ...features },
      });
      toast.success('Results saved!');
      setPhase('done');
    } catch {
      toast.error('Failed to save results.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
              <p className="text-xl font-medium text-foreground leading-relaxed">"{sentence}"</p>
            </div>

            {isRecording && (
              <div className="mb-6 animate-gentle-pulse">
                <div className="text-4xl font-bold text-destructive mb-2">{formatTime(recordingTime)}</div>
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
              {isRecording ? 'Tap to stop when finished' : 'Tap to start recording'}
            </p>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="text-center max-w-sm animate-fade-in">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Analyzing your speech...</h2>
            <p className="text-muted-foreground">Extracting acoustic features</p>
          </div>
        )}

        {phase === 'results' && features && (
          <div className="text-center max-w-sm animate-fade-in w-full">
            <h2 className="text-2xl font-bold text-foreground mb-2">Analysis Complete</h2>
            <div className={`text-5xl font-bold mb-1 ${getScoreColor()}`}>{score}</div>
            <p className="text-muted-foreground mb-6">out of 100</p>

            <div className="bg-card rounded-3xl p-5 shadow-card mb-6 text-left space-y-3">
              <Row label="Pitch (mean)" value={`${features.pitch.mean} Hz`} />
              <Row label="Pitch variability" value={`±${features.pitch.std} Hz`} />
              <Row label="Jitter" value={features.jitter.toFixed(4)} />
              <Row label="Shimmer" value={features.shimmer.toFixed(4)} />
              <Row label="Speech Rate" value={`${features.speechRate} syll/s`} />
              <Row label="Pause Duration" value={`${features.pauseDuration} s`} />
              <Row label="Tremor Index" value={features.tremorIndex.toFixed(3)} />
              <Row label="Duration" value={`${features.duration} s`} />
            </div>

            <div className="space-y-3">
              <Button size="lg" onClick={saveResults} className="w-full">
                Save Results
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/patient/dashboard')} className="w-full">
                Discard &amp; Go Back
              </Button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center max-w-sm animate-success">
            <div className="w-24 h-24 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Results Saved!</h2>
            <p className="text-success font-semibold text-xl mb-6">Well done! 🎉</p>

            <div className="bg-card rounded-3xl p-6 shadow-card mb-8">
              <p className="text-muted-foreground mb-2">Your score</p>
              <div className={`text-4xl font-bold ${getScoreColor()}`}>{score}</div>
              <Progress value={score} className="mt-4" />
            </div>

            <div className="space-y-3">
              <Button size="lg" onClick={() => { setPhase('intro'); setRecordingTime(0); setFeatures(null); }} className="w-full">
                Take Another Test
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default SpeechTest;
