import { Sun, Moon, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMedication } from '@/contexts/MedicationContext';
import { format, differenceInMinutes } from 'date-fns';
import { useState, useEffect } from 'react';

const WakeUpButton = () => {
  const { wakeUpTime, setWakeUpTime, isAwake, resetDay } = useMedication();
  const [sleepDuration, setSleepDuration] = useState<string | null>(null);

  useEffect(() => {
    if (wakeUpTime) {
      // Calculate sleep from stored bedtime or estimate 7-8 hrs
      const stored = localStorage.getItem('parkisense_bedtime');
      if (stored) {
        const bedtime = new Date(stored);
        const mins = differenceInMinutes(wakeUpTime, bedtime);
        const hrs = Math.floor(mins / 60);
        const m = mins % 60;
        setSleepDuration(`${hrs}h ${m}m`);
        // Save sleep record
        const records = JSON.parse(localStorage.getItem('parkisense_sleep_records') || '[]');
        const today = format(wakeUpTime, 'yyyy-MM-dd');
        if (!records.find((r: any) => r.date === today)) {
          records.push({
            date: today,
            sleepHours: Math.round(mins / 6) / 10,
            bedTime: format(bedtime, 'HH:mm'),
            wakeTime: format(wakeUpTime, 'HH:mm'),
          });
          localStorage.setItem('parkisense_sleep_records', JSON.stringify(records));
        }
      }
    }
  }, [wakeUpTime]);

  const handleWakeUp = () => {
    setWakeUpTime(new Date());
  };

  const handleSleep = () => {
    localStorage.setItem('parkisense_bedtime', new Date().toISOString());
    resetDay();
  };

  if (isAwake && wakeUpTime) {
    return (
      <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-3xl p-6 border-2 border-success/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center">
            <Sun className="w-7 h-7 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-success font-bold text-lg">Good morning! ☀️</p>
            <p className="text-muted-foreground">
              You woke up at{' '}
              <span className="font-semibold text-foreground">
                {format(wakeUpTime, 'h:mm a')}
              </span>
            </p>
            {sleepDuration && (
              <p className="text-sm text-muted-foreground mt-1">
                🛌 Slept for <span className="font-semibold text-foreground">{sleepDuration}</span>
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSleep}
          className="mt-4 text-muted-foreground hover:text-primary border-primary/20"
        >
          <BedDouble className="w-4 h-4 mr-2" />
          Going to Sleep
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={handleWakeUp}
      className="w-full bg-gradient-to-br from-primary to-primary-glow rounded-3xl p-8 text-primary-foreground shadow-button transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-ring/30"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center animate-gentle-pulse">
          <Sun className="w-10 h-10" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">I'm Awake</h2>
          <p className="text-primary-foreground/80 mt-1">
            Tap to start your medication schedule
          </p>
        </div>
      </div>
    </button>
  );
};

export default WakeUpButton;
