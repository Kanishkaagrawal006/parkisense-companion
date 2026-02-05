import { useMedication } from '@/contexts/MedicationContext';
import MedicationCard from './MedicationCard';
import { CalendarClock, CheckCircle2, Clock } from 'lucide-react';
import { isPast } from 'date-fns';

const MedicationSchedule = () => {
  const { scheduledDoses, markDoseTaken, isAwake } = useMedication();

  if (!isAwake) {
    return null;
  }

  const takenCount = scheduledDoses.filter(d => d.taken).length;
  const totalCount = scheduledDoses.length;
  const progressPercent = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  // Sort doses: due and not taken first, then upcoming, then taken
  const sortedDoses = [...scheduledDoses].sort((a, b) => {
    const aDue = isPast(a.scheduledTime) && !a.taken;
    const bDue = isPast(b.scheduledTime) && !b.taken;
    
    if (a.taken !== b.taken) return a.taken ? 1 : -1;
    if (aDue !== bDue) return aDue ? -1 : 1;
    return a.scheduledTime.getTime() - b.scheduledTime.getTime();
  });

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-card rounded-3xl p-5 shadow-card border border-border/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
            <CalendarClock className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-foreground">Today's Medications</h2>
            <p className="text-muted-foreground text-sm">
              {takenCount} of {totalCount} doses taken
            </p>
          </div>
          {takenCount === totalCount && totalCount > 0 && (
            <CheckCircle2 className="w-8 h-8 text-success" />
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 progress-calm">
          <div 
            className="progress-calm-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {takenCount === totalCount && totalCount > 0 && (
          <p className="mt-3 text-center text-success font-semibold">
            🎉 All medications taken! Great job!
          </p>
        )}
      </div>

      {/* Medication Cards */}
      <div className="space-y-4">
        {sortedDoses.map((dose, index) => (
          <div
            key={dose.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <MedicationCard dose={dose} onMarkTaken={markDoseTaken} />
          </div>
        ))}
      </div>

      {/* Upcoming Reminder */}
      {scheduledDoses.some(d => !d.taken && !isPast(d.scheduledTime)) && (
        <div className="bg-muted/50 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            Upcoming doses will appear when it's time to take them
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicationSchedule;
