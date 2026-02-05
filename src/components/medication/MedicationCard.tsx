import { Check, Clock, Bell, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScheduledDose } from '@/contexts/MedicationContext';
import { format, isPast, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';

interface MedicationCardProps {
  dose: ScheduledDose;
  onMarkTaken: (doseId: string) => void;
}

const MedicationCard = ({ dose, onMarkTaken }: MedicationCardProps) => {
  const { medication, scheduledTime, taken, takenAt } = dose;
  const now = new Date();
  const isDue = isPast(scheduledTime) && !taken;
  const isUpcoming = !isPast(scheduledTime);
  const minutesOverdue = isDue ? differenceInMinutes(now, scheduledTime) : 0;
  const needsReminder = isDue && minutesOverdue >= 15;

  const getStatusColor = () => {
    if (taken) return 'border-success/30 bg-success-light';
    if (needsReminder) return 'border-destructive/30 bg-destructive/5';
    if (isDue) return 'border-warning/30 bg-warning-light';
    return 'border-border bg-card';
  };

  const getTimeDisplay = () => {
    if (taken && takenAt) {
      return `Taken at ${format(takenAt, 'h:mm a')}`;
    }
    return format(scheduledTime, 'h:mm a');
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-5 border-2 transition-all duration-300',
        getStatusColor()
      )}
    >
      <div className="flex items-start gap-4">
        {/* Medication Icon */}
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
            taken ? 'bg-success/20' : 'bg-primary-light'
          )}
        >
          {taken ? (
            <Check className="w-7 h-7 text-success" />
          ) : (
            <Pill className="w-7 h-7 text-primary" />
          )}
        </div>

        {/* Medication Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-foreground">{medication.name}</h3>
            <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {medication.dosage}
            </span>
          </div>

          {medication.instructions && (
            <p className="text-muted-foreground text-sm mt-1">
              {medication.instructions}
            </p>
          )}

          {/* Time Display */}
          <div className="flex items-center gap-2 mt-2">
            <Clock className={cn(
              'w-4 h-4',
              taken ? 'text-success' : isDue ? 'text-warning' : 'text-muted-foreground'
            )} />
            <span
              className={cn(
                'text-sm font-medium',
                taken ? 'text-success' : isDue ? 'text-warning' : 'text-muted-foreground'
              )}
            >
              {getTimeDisplay()}
            </span>
            {needsReminder && (
              <span className="flex items-center gap-1 text-destructive text-sm font-medium">
                <Bell className="w-4 h-4" />
                Reminder
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      {!taken && (
        <Button
          onClick={() => onMarkTaken(dose.id)}
          variant={isDue ? 'default' : 'calm'}
          size="lg"
          className="w-full mt-4"
        >
          <Check className="w-5 h-5 mr-2" />
          {isDue ? "I've Taken This" : 'Mark as Taken'}
        </Button>
      )}

      {taken && (
        <div className="mt-4 flex items-center justify-center gap-2 text-success font-semibold">
          <Check className="w-5 h-5" />
          <span>Medication taken ✓</span>
        </div>
      )}
    </div>
  );
};

export default MedicationCard;
