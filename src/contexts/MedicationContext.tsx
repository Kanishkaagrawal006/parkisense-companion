import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Medication {
  id: string;
  name: string;
  offsetHours: number; // Hours after wake-up
  dosage: string;
  instructions?: string;
}

export interface ScheduledDose {
  id: string;
  medication: Medication;
  scheduledTime: Date;
  taken: boolean;
  takenAt?: Date;
  reminded: boolean;
}

interface MedicationContextType {
  wakeUpTime: Date | null;
  setWakeUpTime: (time: Date) => void;
  medications: Medication[];
  scheduledDoses: ScheduledDose[];
  markDoseTaken: (doseId: string) => void;
  isAwake: boolean;
  resetDay: () => void;
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

// Default medications with offsets from wake-up time
const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Levodopa',
    offsetHours: 0.5,
    dosage: '100mg',
    instructions: 'Take with breakfast',
  },
  {
    id: 'med-2',
    name: 'Carbidopa',
    offsetHours: 3,
    dosage: '25mg',
    instructions: 'Take with water',
  },
  {
    id: 'med-3',
    name: 'Pramipexole',
    offsetHours: 6,
    dosage: '0.5mg',
    instructions: 'Take with lunch',
  },
  {
    id: 'med-4',
    name: 'Amantadine',
    offsetHours: 9,
    dosage: '100mg',
    instructions: 'Take in evening',
  },
  {
    id: 'med-5',
    name: 'Levodopa',
    offsetHours: 12,
    dosage: '100mg',
    instructions: 'Take before bed',
  },
];

export const MedicationProvider = ({ children }: { children: ReactNode }) => {
  const [wakeUpTime, setWakeUpTimeState] = useState<Date | null>(() => {
    // Check localStorage for today's wake-up time
    const stored = localStorage.getItem('parkisense_wakeup');
    if (stored) {
      const parsed = JSON.parse(stored);
      const storedDate = new Date(parsed.date);
      const today = new Date();
      // Only use if it's from today
      if (storedDate.toDateString() === today.toDateString()) {
        return new Date(parsed.time);
      }
    }
    return null;
  });

  const [medications] = useState<Medication[]>(DEFAULT_MEDICATIONS);
  const [scheduledDoses, setScheduledDoses] = useState<ScheduledDose[]>([]);

  // Calculate scheduled doses when wake-up time changes
  useEffect(() => {
    if (wakeUpTime) {
      const doses = medications.map((med) => {
        const scheduledTime = new Date(wakeUpTime);
        scheduledTime.setMinutes(scheduledTime.getMinutes() + med.offsetHours * 60);
        
        // Check if this dose was already marked as taken
        const existingDose = scheduledDoses.find(d => d.medication.id === med.id);
        
        return {
          id: `dose-${med.id}-${wakeUpTime.toISOString()}`,
          medication: med,
          scheduledTime,
          taken: existingDose?.taken || false,
          takenAt: existingDose?.takenAt,
          reminded: existingDose?.reminded || false,
        };
      });
      
      setScheduledDoses(doses);
    }
  }, [wakeUpTime, medications]);

  const setWakeUpTime = (time: Date) => {
    setWakeUpTimeState(time);
    // Store in localStorage
    localStorage.setItem('parkisense_wakeup', JSON.stringify({
      date: new Date().toISOString(),
      time: time.toISOString(),
    }));
  };

  const markDoseTaken = (doseId: string) => {
    setScheduledDoses(prev => 
      prev.map(dose => 
        dose.id === doseId 
          ? { ...dose, taken: true, takenAt: new Date() }
          : dose
      )
    );
    
    // Store taken doses in localStorage
    const takenDoses = JSON.parse(localStorage.getItem('parkisense_taken_doses') || '[]');
    takenDoses.push({ doseId, takenAt: new Date().toISOString() });
    localStorage.setItem('parkisense_taken_doses', JSON.stringify(takenDoses));
  };

  const resetDay = () => {
    setWakeUpTimeState(null);
    setScheduledDoses([]);
    localStorage.removeItem('parkisense_wakeup');
    localStorage.removeItem('parkisense_taken_doses');
  };

  return (
    <MedicationContext.Provider
      value={{
        wakeUpTime,
        setWakeUpTime,
        medications,
        scheduledDoses,
        markDoseTaken,
        isAwake: wakeUpTime !== null,
        resetDay,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedication = () => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedication must be used within a MedicationProvider');
  }
  return context;
};
