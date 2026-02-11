/**
 * Demo data for Kanishka — a fake Parkinson's patient.
 * Structured so it can be swapped with real Firebase data later.
 */

export interface DemoWeeklyData {
  patient: string;
  week: number;
  weekLabel: string;
  tapping_score: number;
  spiral_score: number;
  speech_score: number;
}

export interface DemoSleepRecord {
  date: string;
  sleepHours: number;
  bedTime: string;
  wakeTime: string;
}

export interface DemoNMSRecord {
  week: number;
  weekLabel: string;
  fatigue: number;      // 0-4
  mood: number;         // 0-4
  sleepProblems: number; // 0-4
  urinaryIssues: number; // 0-4
  digestive: number;     // 0-4
  pain: number;          // 0-4
  total: number;         // sum of all
}

export interface DemoPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  weeklyData: DemoWeeklyData[];
  sleepRecords: DemoSleepRecord[];
  nmsRecords: DemoNMSRecord[];
}

const nmsRecords: DemoNMSRecord[] = [
  { week: 1, weekLabel: 'Week 1', fatigue: 3, mood: 2, sleepProblems: 3, urinaryIssues: 1, digestive: 1, pain: 2, total: 12 },
  { week: 2, weekLabel: 'Week 2', fatigue: 2, mood: 2, sleepProblems: 2, urinaryIssues: 1, digestive: 2, pain: 1, total: 10 },
  { week: 3, weekLabel: 'Week 3', fatigue: 3, mood: 1, sleepProblems: 1, urinaryIssues: 2, digestive: 1, pain: 2, total: 10 },
  { week: 4, weekLabel: 'Week 4', fatigue: 2, mood: 3, sleepProblems: 2, urinaryIssues: 0, digestive: 1, pain: 1, total: 9 },
  { week: 5, weekLabel: 'Week 5', fatigue: 1, mood: 1, sleepProblems: 2, urinaryIssues: 1, digestive: 0, pain: 1, total: 6 },
  { week: 6, weekLabel: 'Week 6', fatigue: 1, mood: 1, sleepProblems: 1, urinaryIssues: 0, digestive: 1, pain: 1, total: 5 },
];

const sleepRecords: DemoSleepRecord[] = [
  { date: '2026-01-26', sleepHours: 6.5, bedTime: '23:00', wakeTime: '05:30' },
  { date: '2026-01-27', sleepHours: 7.0, bedTime: '22:30', wakeTime: '05:30' },
  { date: '2026-01-28', sleepHours: 5.5, bedTime: '00:00', wakeTime: '05:30' },
  { date: '2026-01-29', sleepHours: 7.5, bedTime: '22:00', wakeTime: '05:30' },
  { date: '2026-01-30', sleepHours: 6.0, bedTime: '23:30', wakeTime: '05:30' },
  { date: '2026-01-31', sleepHours: 8.0, bedTime: '21:30', wakeTime: '05:30' },
  { date: '2026-02-01', sleepHours: 7.5, bedTime: '22:00', wakeTime: '05:30' },
  { date: '2026-02-02', sleepHours: 6.0, bedTime: '23:00', wakeTime: '05:00' },
  { date: '2026-02-03', sleepHours: 8.0, bedTime: '21:30', wakeTime: '05:30' },
  { date: '2026-02-04', sleepHours: 5.5, bedTime: '00:00', wakeTime: '05:30' },
  { date: '2026-02-05', sleepHours: 7.0, bedTime: '22:30', wakeTime: '05:30' },
  { date: '2026-02-06', sleepHours: 6.5, bedTime: '23:00', wakeTime: '05:30' },
  { date: '2026-02-07', sleepHours: 7.5, bedTime: '22:00', wakeTime: '05:30' },
  { date: '2026-02-08', sleepHours: 8.0, bedTime: '21:30', wakeTime: '05:30' },
  { date: '2026-02-09', sleepHours: 6.0, bedTime: '23:30', wakeTime: '05:30' },
  { date: '2026-02-10', sleepHours: 7.0, bedTime: '22:30', wakeTime: '05:30' },
  { date: '2026-02-11', sleepHours: 7.5, bedTime: '22:00', wakeTime: '05:30' },
];

export const DEMO_PATIENT: DemoPatient = {
  id: 'demo-kanishka',
  name: 'Kanishka',
  email: 'kanishka@demo.parkisense.app',
  phone: '+91 98765 43210',
  age: 62,
  gender: 'Male',
  weeklyData: [
    { patient: 'Kanishka', week: 1, weekLabel: 'Week 1', tapping_score: 72, spiral_score: 68, speech_score: 75 },
    { patient: 'Kanishka', week: 2, weekLabel: 'Week 2', tapping_score: 74, spiral_score: 70, speech_score: 73 },
    { patient: 'Kanishka', week: 3, weekLabel: 'Week 3', tapping_score: 78, spiral_score: 74, speech_score: 77 },
    { patient: 'Kanishka', week: 4, weekLabel: 'Week 4', tapping_score: 76, spiral_score: 72, speech_score: 80 },
    { patient: 'Kanishka', week: 5, weekLabel: 'Week 5', tapping_score: 80, spiral_score: 76, speech_score: 78 },
    { patient: 'Kanishka', week: 6, weekLabel: 'Week 6', tapping_score: 82, spiral_score: 79, speech_score: 82 },
  ],
  sleepRecords,
  nmsRecords,
};

/** NMS question labels for display */
export const NMS_CATEGORIES = [
  { key: 'fatigue', label: 'Fatigue', color: 'hsl(var(--destructive))' },
  { key: 'mood', label: 'Mood (Anxiety/Depression)', color: 'hsl(var(--warning))' },
  { key: 'sleepProblems', label: 'Sleep Problems', color: 'hsl(var(--primary))' },
  { key: 'urinaryIssues', label: 'Urinary Issues', color: 'hsl(var(--success))' },
  { key: 'digestive', label: 'Digestive Issues', color: 'hsl(210, 70%, 55%)' },
  { key: 'pain', label: 'Pain', color: 'hsl(330, 70%, 55%)' },
] as const;

/** NMS severity labels */
export const NMS_SEVERITY = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'] as const;

/** Derive trend label from first vs last week scores */
export function getTrendLabel(scores: number[]): 'Improving' | 'Stable' | 'Deteriorating' {
  if (scores.length < 2) return 'Stable';
  const first = scores[0];
  const last = scores[scores.length - 1];
  const change = ((last - first) / first) * 100;
  if (change > 5) return 'Improving';
  if (change < -5) return 'Deteriorating';
  return 'Stable';
}

/** Average of an array */
export function avg(arr: number[]): number {
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : 0;
}
