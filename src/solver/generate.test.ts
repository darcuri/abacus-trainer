import { describe, expect, it } from 'vitest';
import { SOROBAN, emptyState } from '../model/frame';
import { solveAddSub } from './addsub';
import { generateAddSub, seededRng } from './generate';

describe('generateAddSub', () => {
  it('only produces problems inside the allowed techniques', () => {
    const rng = seededRng(1);
    for (let i = 0; i < 200; i++) {
      const p = generateAddSub(SOROBAN, { digits: [1, 3], terms: 4, subtractChance: 0.4, allowed: ['direct'] }, rng);
      const sol = solveAddSub(SOROBAN, emptyState(SOROBAN), p.terms);
      expect([...sol.techniques]).toEqual(['direct']);
      expect(p.answer).toBe(p.terms.reduce((a, b) => a + b, 0));
      expect(p.answer).toBeGreaterThanOrEqual(0);
    }
  });

  it('honours required techniques', () => {
    const rng = seededRng(2);
    for (let i = 0; i < 100; i++) {
      const p = generateAddSub(SOROBAN, { digits: [1, 1], terms: 2, subtractChance: 0, allowed: ['direct', 'five'], require: ['five'] }, rng);
      expect(p.techniques).toContain('five');
      expect(p.techniques).not.toContain('ten');
    }
  });

  it('is deterministic for a seed', () => {
    const params = { digits: [2, 2] as [number, number], terms: 3, subtractChance: 0.5, allowed: ['direct' as const] };
    expect(generateAddSub(SOROBAN, params, seededRng(7))).toEqual(generateAddSub(SOROBAN, params, seededRng(7)));
  });

  it('subtracts every later term when subtractChance is 1', () => {
    const rng = seededRng(4);
    for (let i = 0; i < 100; i++) {
      const p = generateAddSub(SOROBAN, { digits: [1, 1], terms: 3, subtractChance: 1, allowed: ['direct', 'five'], require: ['five'] }, rng);
      expect(p.terms[0]).toBeGreaterThan(0);
      expect(p.terms.slice(1).every((t) => t < 0)).toBe(true);
    }
  });
});
