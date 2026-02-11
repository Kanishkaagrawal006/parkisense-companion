import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ClipboardCheck, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { NMS_CATEGORIES, NMS_SEVERITY } from '@/lib/demoData';
import { useToast } from '@/hooks/use-toast';

const QUESTIONS = NMS_CATEGORIES.map(c => ({
  key: c.key,
  label: c.label,
  question: (() => {
    switch (c.key) {
      case 'fatigue': return 'How often do you feel fatigued or excessively tired?';
      case 'mood': return 'Have you experienced mood changes such as anxiety or depression?';
      case 'sleepProblems': return 'Have you had sleep problems (insomnia, vivid dreams, restless legs)?';
      case 'urinaryIssues': return 'Have you experienced urinary urgency or frequency?';
      case 'digestive': return 'Have you had digestive issues (constipation, nausea)?';
      case 'pain': return 'Have you experienced unexplained pain or discomfort?';
      default: return '';
    }
  })(),
}));

const NMSQuestionnaire = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const q = QUESTIONS[currentQ];
  const isLast = currentQ === QUESTIONS.length - 1;
  const isFirst = currentQ === 0;
  const allAnswered = QUESTIONS.every(q => answers[q.key] !== undefined);

  const handleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [q.key]: parseInt(value) }));
  };

  const handleSubmit = () => {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    // In production, save to Firestore here
    toast({
      title: 'Questionnaire Submitted ✅',
      description: `Total NMS score: ${total}/24. Your responses have been recorded.`,
    });
    setSubmitted(true);
  };

  if (submitted) {
    const total = Object.values(answers).reduce((a, b) => a + b, 0);
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-soft px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">NMS Questionnaire</h1>
          </div>
        </header>
        <main className="px-6 py-10 max-w-lg mx-auto text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Thank you!</h2>
          <p className="text-muted-foreground mb-6">Your non-motor symptom assessment has been recorded.</p>
          <Card className="border-0 shadow-card mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Score</p>
              <p className="text-4xl font-bold text-foreground">{total}<span className="text-lg text-muted-foreground">/24</span></p>
              <div className="mt-4 space-y-2">
                {QUESTIONS.map(q => (
                  <div key={q.key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{q.label}</span>
                    <span className="font-medium text-foreground">{NMS_SEVERITY[answers[q.key]]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => navigate('/patient/dashboard')} className="w-full rounded-xl h-12">
            Back to Dashboard
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-soft px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">NMS Questionnaire</h1>
            <p className="text-sm text-muted-foreground">Non-Motor Symptom Assessment</p>
          </div>
          <div className="flex items-center gap-1">
            <ClipboardCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{currentQ + 1}/{QUESTIONS.length}</span>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-lg mx-auto">
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <Card className="border-0 shadow-card animate-fade-in" key={currentQ}>
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">{q.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[q.key]?.toString()}
              onValueChange={handleSelect}
              className="space-y-3"
            >
              {NMS_SEVERITY.map((label, i) => (
                <div
                  key={i}
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    answers[q.key] === i
                      ? 'border-primary bg-primary-light'
                      : 'border-border hover:border-primary/40'
                  }`}
                  onClick={() => handleSelect(i.toString())}
                >
                  <RadioGroupItem value={i.toString()} id={`${q.key}-${i}`} />
                  <Label htmlFor={`${q.key}-${i}`} className="flex-1 cursor-pointer">
                    <span className="font-medium text-foreground">{label}</span>
                    <span className="text-muted-foreground ml-2 text-sm">({i}/4)</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQ(p => p - 1)}
            disabled={isFirst}
            className="flex-1 rounded-xl h-12"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          {isLast ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="flex-1 rounded-xl h-12"
            >
              Submit <CheckCircle2 className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQ(p => p + 1)}
              disabled={answers[q.key] === undefined}
              className="flex-1 rounded-xl h-12"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default NMSQuestionnaire;
