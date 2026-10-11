// Per-learner progress, kept in localStorage. Storage can be unavailable
// (private windows, blocked site data), so every access is guarded and the app
// works without it.

const KEY = 'abacus-trainer:progress:v1';
const KEEP = 20;

export interface Attempt {
  ok: boolean;
  ms: number;
  /** Hints were used, so the attempt doesn't count toward mastery. */
  hinted?: boolean;
}

export interface Progress {
  sets: Record<string, Attempt[]>;
}

export interface SetSummary {
  attempts: number;
  accuracy: number;
  medianMs: number | null;
  mastered: boolean;
}

export const MASTERY_ATTEMPTS = KEEP;
export const MASTERY_ACCURACY = 0.9;

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Progress;
      if (parsed && typeof parsed.sets === 'object') return parsed;
    }
  } catch {
    // Fall through to empty progress.
  }
  return { sets: {} };
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Progress just won't persist.
  }
}

export function recordAttempts(p: Progress, setId: string, attempts: Attempt[]): Progress {
  const prev = p.sets[setId] ?? [];
  return { ...p, sets: { ...p.sets, [setId]: [...prev, ...attempts].slice(-KEEP) } };
}

export function summarize(attempts: readonly Attempt[] = []): SetSummary {
  const clean = attempts.filter((a) => a.ok && !a.hinted);
  const times = attempts.filter((a) => a.ok).map((a) => a.ms).sort((a, b) => a - b);
  const accuracy = attempts.length ? clean.length / attempts.length : 0;
  return {
    attempts: attempts.length,
    accuracy,
    medianMs: times.length ? times[Math.floor(times.length / 2)] : null,
    mastered: attempts.length >= MASTERY_ATTEMPTS && accuracy >= MASTERY_ACCURACY,
  };
}

export function exportProgress(): string {
  return JSON.stringify(loadProgress(), null, 2);
}

export function importProgress(json: string): Progress {
  const parsed = JSON.parse(json) as Progress;
  if (!parsed || typeof parsed.sets !== 'object') throw new Error('Not an abacus-trainer progress file');
  saveProgress(parsed);
  return parsed;
}
