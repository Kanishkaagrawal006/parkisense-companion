

# Speech Test Enhancement Plan

## Overview
Upgrade the existing Speech Test from a UI-only recording demo to a fully functional diagnostic tool that captures real audio, extracts Parkinson's-relevant speech features, and stores structured results in Firestore.

## Current State
- The Speech Test page (`SpeechTest.tsx`) has a nice UI with intro/recording/done phases
- It uses a timer to track recording duration but does NOT actually capture audio (no MediaRecorder usage)
- Test results are never saved to Firestore (unlike the pattern available via `saveTestResult` in `firestore.ts`)

## What Changes

### 1. Actual Audio Recording (SpeechTest.tsx)
- Add `MediaRecorder` API to capture real audio from the microphone
- Request microphone permission on test start
- Collect audio chunks into a single `Blob` when recording stops
- Limit to one sentence per session (already the case in current UI)

### 2. Client-Side Audio Feature Extraction (New File)
Create `src/lib/speechAnalysis.ts` -- a modular audio analysis utility that uses the **Web Audio API** to extract:
- **Pitch (F0)**: via autocorrelation on the decoded audio buffer
- **Jitter**: pitch period-to-period variation
- **Shimmer**: amplitude period-to-period variation
- **Speech rate**: estimated syllables per second based on amplitude envelope
- **Pause duration**: total silence detected within the recording
- **Tremor indicators**: frequency modulation patterns in the pitch contour

This approach works entirely in the browser without needing external audio processing libraries.

### 3. Add an "Analyzing" Phase to the UI
After recording stops, show a brief "Analyzing your speech..." state while features are being extracted, then display results before saving.

### 4. Firestore Integration
- Use the existing `saveTestResult` function with `testType: 'speech'`
- The `details` field will contain the full extracted features JSON:
  ```
  {
    sentenceText: "The quick brown fox...",
    duration: 4.2,
    pitch: { mean: 120.5, std: 15.3, min: 95, max: 155 },
    jitter: 0.012,
    shimmer: 0.045,
    speechRate: 3.2,
    pauseDuration: 0.8,
    tremorIndex: 0.03
  }
  ```
- Score computed from a weighted combination of the features
- Authenticated user's ID attached automatically via `useFirebaseAuth`

### 5. Modularity for Future Tests
- `speechAnalysis.ts` exports individual functions (`extractPitch`, `detectPauses`, `computeJitter`, etc.) so future speech tests can mix and match
- The `SpeechTest` component accepts the sentence list as a prop-ready constant, making it easy to add new test variants

## Files to Create
- `src/lib/speechAnalysis.ts` -- all audio feature extraction logic

## Files to Modify
- `src/pages/patient/tests/SpeechTest.tsx` -- add MediaRecorder, analysis phase, Firestore save, results display
- `src/lib/firestore.ts` -- add a `SpeechFeatures` type interface for documentation (optional, since `details` is already `Record<string, any>`)

## Technical Details

### Audio Pipeline
```text
Microphone --> MediaRecorder (webm/opus) --> AudioContext.decodeAudioData
  --> Float32Array (raw PCM samples)
    --> extractPitch (autocorrelation)
    --> computeJitter (pitch period variance)
    --> computeShimmer (amplitude variance)
    --> detectPauses (energy thresholding)
    --> estimateSpeechRate (amplitude peaks)
```

### Feature Definitions
| Feature | Method | Clinical Relevance |
|---------|--------|--------------------|
| Pitch (F0) | Autocorrelation | Monotone speech in PD |
| Jitter | Period-to-period F0 variation | Voice instability |
| Shimmer | Period-to-period amplitude variation | Breathiness |
| Speech Rate | Syllable-rate estimation | Bradykinesia |
| Pause Duration | Energy threshold detection | Hesitation patterns |
| Tremor Index | F0 modulation at 4-8 Hz | Vocal tremor |

### UI Flow After Changes
```text
Intro --> [Begin Test] --> Recording --> [Stop] --> Analyzing... --> Results (with features) --> Save to Firestore --> Done
```

