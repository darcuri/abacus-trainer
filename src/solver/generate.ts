// Problem generators. Add/sub problems are found by rejection sampling: draw
// random terms, run the reference solver, keep the problem only if the
// techniques it needs fit the level.

import { type FrameSpec, emptyState } from '../model/frame';
import { type Technique, SolverError, solveAddSub } from './addsub';

export type Rng = () => number;

/** Small seeded PRNG (mulberry32) so tests and replays are deterministic. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** A number with exactly `digits` digits (1 digit allows 0 only if `allowZero`). */
export function randomNumber(rng: Rng, digits: number, allowZero = false): number {
  if (digits === 1) return randInt(rng, allowZero ? 0 : 1, 9);
  return randInt(rng, 10 ** (digits - 1), 10 ** digits - 1);
}

export interface AddSubParams {
  /** Digits per term, inclusive range. */
  digits: [number, number];
  /** Number of terms including the first. */
  terms: number;
  /** Chance each term after the first is a subtraction. 0 means addition only, 1 means every later term subtracts. */
  subtractChance: number;
  /** Techniques a problem may use. */
  allowed: readonly Technique[];
  /** Techniques a problem must use at least one of. Empty means no requirement. */
  require?: readonly Technique[];
}

export interface AddSubProblem {
  terms: number[];
  answer: number;
  techniques: Technique[];
}

export class GenerationError extends Error {}

export function generateAddSub(spec: FrameSpec, params: AddSubParams, rng: Rng, maxTries = 20000): AddSubProblem {
  const allowed = new Set(params.allowed);
  const require = params.require ?? [];
  attempts: for (let attempt = 0; attempt < maxTries; attempt++) {
    const terms: number[] = [];
    let total = 0;
    for (let i = 0; i < params.terms; i++) {
      let n = randomNumber(rng, randInt(rng, params.digits[0], params.digits[1]));
      if (i > 0 && rng() < params.subtractChance) {
        // Reject rather than flip to addition, so the subtraction rate is what was asked for.
        if (n > total) continue attempts;
        n = -n;
      }
      terms.push(n);
      total += n;
    }
    let solution;
    try {
      solution = solveAddSub(spec, emptyState(spec), terms);
    } catch (e) {
      if (e instanceof SolverError) continue;
      throw e;
    }
    const used = [...solution.techniques];
    if (!used.every((t) => allowed.has(t))) continue;
    if (require.length > 0 && !require.some((t) => solution.techniques.has(t))) continue;
    return { terms, answer: total, techniques: used };
  }
  throw new GenerationError(`No problem found for ${JSON.stringify(params)} after ${maxTries} tries`);
}
