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

export interface DemoPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  weeklyData: DemoWeeklyData[];
}

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
};

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
  return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
}
