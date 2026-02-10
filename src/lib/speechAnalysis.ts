/**
 * Speech Analysis Module
 * 
 * Client-side audio feature extraction for Parkinson's speech screening.
 * Uses Web Audio API to extract clinically relevant acoustic features.
 * 
 * Each function is exported individually for modularity — future tests
 * can mix and match extractors as needed.
 */

export interface PitchResult {
  mean: number;
  std: number;
  min: number;
  max: number;
  contour: number[]; // per-frame F0 values
}

export interface SpeechFeatures {
  sentenceText: string;
  duration: number;
  pitch: Omit<PitchResult, 'contour'>;
  jitter: number;
  shimmer: number;
  speechRate: number;
  pauseDuration: number;
  tremorIndex: number;
}

// ─── Utility helpers ────────────────────────────────────────────────

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[], avg?: number): number {
  if (arr.length < 2) return 0;
  const m = avg ?? mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

// ─── Pitch (F0) via autocorrelation ─────────────────────────────────

const MIN_F0 = 50;  // Hz
const MAX_F0 = 500; // Hz

function autocorrelationPitch(frame: Float32Array, sampleRate: number): number {
  const minLag = Math.floor(sampleRate / MAX_F0);
  const maxLag = Math.floor(sampleRate / MIN_F0);

  let bestCorr = -1;
  let bestLag = minLag;

  for (let lag = minLag; lag <= Math.min(maxLag, frame.length - 1); lag++) {
    let corr = 0;
    let norm1 = 0;
    let norm2 = 0;
    for (let i = 0; i < frame.length - lag; i++) {
      corr += frame[i] * frame[i + lag];
      norm1 += frame[i] * frame[i];
      norm2 += frame[i + lag] * frame[i + lag];
    }
    const normFactor = Math.sqrt(norm1 * norm2);
    if (normFactor > 0) corr /= normFactor;

    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  // Only trust the result if correlation is strong enough
  if (bestCorr < 0.3) return 0;
  return sampleRate / bestLag;
}

/**
 * Extract pitch contour from raw PCM samples.
 * Returns per-frame F0 values (0 = unvoiced).
 */
export function extractPitch(samples: Float32Array, sampleRate: number): PitchResult {
  const frameSize = Math.floor(sampleRate * 0.03); // 30 ms frames
  const hopSize = Math.floor(sampleRate * 0.01);   // 10 ms hop
  const contour: number[] = [];

  for (let start = 0; start + frameSize <= samples.length; start += hopSize) {
    const frame = samples.subarray(start, start + frameSize);
    contour.push(autocorrelationPitch(frame, sampleRate));
  }

  const voiced = contour.filter((f) => f > 0);
  if (voiced.length === 0) {
    return { mean: 0, std: 0, min: 0, max: 0, contour };
  }

  const m = mean(voiced);
  return {
    mean: Math.round(m * 10) / 10,
    std: Math.round(std(voiced, m) * 10) / 10,
    min: Math.round(Math.min(...voiced) * 10) / 10,
    max: Math.round(Math.max(...voiced) * 10) / 10,
    contour,
  };
}

// ─── Jitter (pitch period variation) ────────────────────────────────

/**
 * Compute relative jitter — average absolute difference between
 * consecutive pitch periods divided by the mean period.
 */
export function computeJitter(pitchContour: number[]): number {
  const voiced = pitchContour.filter((f) => f > 0);
  if (voiced.length < 2) return 0;

  const periods = voiced.map((f) => 1 / f);
  let diffSum = 0;
  for (let i = 1; i < periods.length; i++) {
    diffSum += Math.abs(periods[i] - periods[i - 1]);
  }
  const avgDiff = diffSum / (periods.length - 1);
  const avgPeriod = mean(periods);

  return avgPeriod > 0 ? Math.round((avgDiff / avgPeriod) * 10000) / 10000 : 0;
}

// ─── Shimmer (amplitude variation) ──────────────────────────────────

/**
 * Compute shimmer — average absolute difference between consecutive
 * frame peak amplitudes divided by the mean amplitude.
 */
export function computeShimmer(samples: Float32Array, sampleRate: number): number {
  const frameSize = Math.floor(sampleRate * 0.03);
  const hopSize = Math.floor(sampleRate * 0.01);
  const peaks: number[] = [];

  for (let start = 0; start + frameSize <= samples.length; start += hopSize) {
    let peak = 0;
    for (let i = start; i < start + frameSize; i++) {
      const abs = Math.abs(samples[i]);
      if (abs > peak) peak = abs;
    }
    if (peak > 0.01) peaks.push(peak); // skip silence frames
  }

  if (peaks.length < 2) return 0;

  let diffSum = 0;
  for (let i = 1; i < peaks.length; i++) {
    diffSum += Math.abs(peaks[i] - peaks[i - 1]);
  }
  const avgDiff = diffSum / (peaks.length - 1);
  const avgPeak = mean(peaks);

  return avgPeak > 0 ? Math.round((avgDiff / avgPeak) * 10000) / 10000 : 0;
}

// ─── Pause detection ────────────────────────────────────────────────

const SILENCE_THRESHOLD = 0.02; // amplitude threshold
const MIN_PAUSE_MS = 150;       // minimum pause length in ms

/**
 * Detect total pause duration (seconds) within the recording.
 */
export function detectPauses(samples: Float32Array, sampleRate: number): number {
  const frameSize = Math.floor(sampleRate * 0.02); // 20 ms frames
  let silentFrames = 0;
  let totalPauseSamples = 0;
  const minPauseFrames = Math.ceil((MIN_PAUSE_MS / 1000) * sampleRate / frameSize);

  for (let start = 0; start + frameSize <= samples.length; start += frameSize) {
    let rms = 0;
    for (let i = start; i < start + frameSize; i++) {
      rms += samples[i] * samples[i];
    }
    rms = Math.sqrt(rms / frameSize);

    if (rms < SILENCE_THRESHOLD) {
      silentFrames++;
    } else {
      if (silentFrames >= minPauseFrames) {
        totalPauseSamples += silentFrames * frameSize;
      }
      silentFrames = 0;
    }
  }
  // Trailing silence
  if (silentFrames >= minPauseFrames) {
    totalPauseSamples += silentFrames * frameSize;
  }

  return Math.round((totalPauseSamples / sampleRate) * 100) / 100;
}

// ─── Speech rate ────────────────────────────────────────────────────

/**
 * Estimate syllable rate (syllables per second) from amplitude envelope peaks.
 */
export function estimateSpeechRate(samples: Float32Array, sampleRate: number): number {
  // Create smoothed amplitude envelope
  const envFrameSize = Math.floor(sampleRate * 0.04); // 40 ms
  const envelope: number[] = [];

  for (let start = 0; start + envFrameSize <= samples.length; start += envFrameSize) {
    let sum = 0;
    for (let i = start; i < start + envFrameSize; i++) {
      sum += Math.abs(samples[i]);
    }
    envelope.push(sum / envFrameSize);
  }

  // Count peaks in envelope (local maxima above threshold)
  const threshold = mean(envelope) * 0.4;
  let syllables = 0;
  for (let i = 1; i < envelope.length - 1; i++) {
    if (
      envelope[i] > threshold &&
      envelope[i] > envelope[i - 1] &&
      envelope[i] > envelope[i + 1]
    ) {
      syllables++;
    }
  }

  const durationSec = samples.length / sampleRate;
  return durationSec > 0 ? Math.round((syllables / durationSec) * 10) / 10 : 0;
}

// ─── Tremor index ───────────────────────────────────────────────────

/**
 * Estimate vocal tremor by looking for 4–8 Hz modulation in the pitch contour.
 * Returns a 0–1 index where higher = more tremor-like modulation.
 */
export function computeTremorIndex(pitchContour: number[], frameRateHz: number): number {
  const voiced = pitchContour.filter((f) => f > 0);
  if (voiced.length < 16) return 0;

  // Simple DFT at tremor frequencies (4–8 Hz)
  const N = voiced.length;
  const meanF0 = mean(voiced);
  const detrended = voiced.map((v) => v - meanF0);

  let tremorPower = 0;
  let totalPower = 0;

  for (let k = 0; k < Math.floor(N / 2); k++) {
    const freq = (k * frameRateHz) / N;
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      re += detrended[n] * Math.cos(angle);
      im -= detrended[n] * Math.sin(angle);
    }
    const power = re * re + im * im;
    totalPower += power;
    if (freq >= 4 && freq <= 8) {
      tremorPower += power;
    }
  }

  return totalPower > 0 ? Math.round((tremorPower / totalPower) * 1000) / 1000 : 0;
}

// ─── Main analysis pipeline ─────────────────────────────────────────

/**
 * Run the full speech analysis pipeline on an audio Blob.
 * Returns structured SpeechFeatures ready for Firestore storage.
 */
export async function analyzeSpeech(
  audioBlob: Blob,
  sentenceText: string
): Promise<SpeechFeatures> {
  const audioContext = new AudioContext();
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const samples = audioBuffer.getChannelData(0); // mono
  const sampleRate = audioBuffer.sampleRate;
  const duration = Math.round(audioBuffer.duration * 100) / 100;

  const pitch = extractPitch(samples, sampleRate);
  const jitter = computeJitter(pitch.contour);
  const shimmer = computeShimmer(samples, sampleRate);
  const speechRate = estimateSpeechRate(samples, sampleRate);
  const pauseDuration = detectPauses(samples, sampleRate);

  // Frame rate for tremor = 1 / hop time (10 ms hop → 100 Hz)
  const tremorIndex = computeTremorIndex(pitch.contour, 100);

  await audioContext.close();

  return {
    sentenceText,
    duration,
    pitch: { mean: pitch.mean, std: pitch.std, min: pitch.min, max: pitch.max },
    jitter,
    shimmer,
    speechRate,
    pauseDuration,
    tremorIndex,
  };
}

/**
 * Compute a 0–100 score from extracted features.
 * Higher = healthier speech patterns.
 */
export function computeSpeechScore(features: SpeechFeatures): number {
  // Weighted scoring based on clinical thresholds
  let score = 100;

  // Jitter penalty (healthy < 0.01, concerning > 0.03)
  if (features.jitter > 0.01) score -= Math.min(20, (features.jitter - 0.01) * 1000);

  // Shimmer penalty (healthy < 0.03, concerning > 0.06)
  if (features.shimmer > 0.03) score -= Math.min(20, (features.shimmer - 0.03) * 500);

  // Pitch variability — too low suggests monotone (PD indicator)
  if (features.pitch.std < 10) score -= Math.min(15, (10 - features.pitch.std) * 1.5);

  // Speech rate — very slow is concerning
  if (features.speechRate < 2) score -= Math.min(15, (2 - features.speechRate) * 10);

  // Excessive pauses
  const pauseRatio = features.pauseDuration / Math.max(features.duration, 1);
  if (pauseRatio > 0.3) score -= Math.min(15, (pauseRatio - 0.3) * 50);

  // Tremor
  if (features.tremorIndex > 0.1) score -= Math.min(15, (features.tremorIndex - 0.1) * 50);

  return Math.max(0, Math.min(100, Math.round(score)));
}
