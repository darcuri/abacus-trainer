import { describe, expect, it } from 'vitest';
import { type AbacusState, SOROBAN, SUANPAN, emptyState, isCanonicalDecimal, isValidRod, setNumber, valueOf } from '../model/frame';
import { applyMove } from '../model/moves';
import { type Technique, allMoves, solveAddSub } from './addsub';

const spec = { ...SOROBAN, rods: 4 };

function replay(start: AbacusState, terms: number[]) {
  const sol = solveAddSub(spec, start, terms);
  let s = start;
  for (const step of sol.steps) {
    for (const op of step.ops) {
      for (const m of op.moves) {
        expect(m.rod).toBe(op.rod);
        s = applyMove(s, m);
        expect(isValidRod(spec, s[m.rod])).toBe(true);
      }
    }
    expect(s).toEqual(step.stateAfter);
  }
  expect(isCanonicalDecimal(spec, s)).toBe(true);
  return { sol, final: s };
}

/** Technique for the ones-rod op when adding/subtracting d to v (tens rod holding 1-8 so carries are direct-ish). */
function onesTechnique(v: number, signedD: number): Technique {
  const start = setNumber(spec, 10 + v);
  const sol = solveAddSub(spec, start, [signedD]);
  return sol.steps[0].ops.find((o) => o.rod === 3 && !o.cause)!.technique;
}

describe('solveAddSub', () => {
  it('gets every single-digit add and subtract right on every rod state, with valid moves', () => {
    for (let tens = 0; tens <= 9; tens++) {
      for (let v = 0; v <= 9; v++) {
        for (let d = 1; d <= 9; d++) {
          const startN = 100 + tens * 10 + v;
          const start = setNumber(spec, startN);
          expect(valueOf(spec, replay(start, [d]).final)).toBe(startN + d);
          expect(valueOf(spec, replay(start, [-d]).final)).toBe(startN - d);
        }
      }
    }
  });

  it('classifies techniques like the textbook', () => {
    expect(onesTechnique(2, 2)).toBe('direct');
    expect(onesTechnique(6, 3)).toBe('direct');
    expect(onesTechnique(3, 4)).toBe('five'); // +4 = +5 −1
    expect(onesTechnique(6, -3)).toBe('five'); // −3 = −5 +2
    expect(onesTechnique(7, 5)).toBe('ten'); // +5 = −5 +10
    expect(onesTechnique(9, 9)).toBe('ten'); // +9 = −1 +10
    expect(onesTechnique(5, 6)).toBe('fiveTen'); // +6 = −4 +10, and −4 from 5 = −5 +1
    expect(onesTechnique(2, -3)).toBe('ten'); // −3 = −10 +7
    expect(onesTechnique(1, -4)).toBe('ten'); // −4 = −10 +6, and +6 onto 1 is direct
    expect(onesTechnique(3, -8)).toBe('fiveTen'); // −8 = −10 +2, and +2 onto 3 = +5 −3
  });

  it('orders a carry after the complement and a borrow before it', () => {
    const add = solveAddSub(spec, setNumber(spec, 8), [5]).steps[0].ops;
    expect(add.map((o) => [o.rod, o.cause ?? null])).toEqual([[3, null], [2, 'carry']]);
    const sub = solveAddSub(spec, setNumber(spec, 12), [-5]).steps[0].ops;
    expect(sub.map((o) => [o.rod, o.cause ?? null])).toEqual([[2, 'borrow'], [3, null]]);
  });

  it('ripples carries and borrows through 9s and 0s', () => {
    const add = solveAddSub(spec, setNumber(spec, 999), [1]);
    expect(valueOf(spec, add.final)).toBe(1000);
    expect(add.steps[0].ops.filter((o) => o.cause === 'carry')).toHaveLength(3);
    const sub = solveAddSub(spec, setNumber(spec, 1000), [-1]);
    expect(valueOf(spec, sub.final)).toBe(999);
  });

  it('handles multi-digit chains', () => {
    const sol = solveAddSub(spec, emptyState(spec), [21, 13, -4, 987, -999]);
    expect(valueOf(spec, sol.final)).toBe(18);
    expect(allMoves(sol).length).toBeGreaterThan(0);
  });

  it('refuses overflow, negative results and suanpan frames', () => {
    expect(() => solveAddSub(spec, setNumber(spec, 9999), [1])).toThrow();
    expect(() => solveAddSub(spec, setNumber(spec, 3), [-4])).toThrow();
    expect(() => solveAddSub(SUANPAN, emptyState(SUANPAN), [1])).toThrow();
  });
});
