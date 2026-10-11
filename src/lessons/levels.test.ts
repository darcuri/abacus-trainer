import { describe, expect, it } from 'vitest';
import { SOROBAN, emptyState } from '../model/frame';
import { TECHNIQUES, solveAddSub } from '../solver/addsub';
import { generateAddSub, seededRng } from '../solver/generate';
import { LEVELS } from './levels';

describe('lesson content', () => {
  it('has unique practice set ids', () => {
    const ids = LEVELS.flatMap((l) => l.practice.map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('demos are solvable and stay within the techniques the level practises', () => {
    for (const level of LEVELS) {
      const allowed = new Set(level.practice.flatMap((p) => (p.spec.kind === 'addsub' ? p.spec.allowed : [])));
      for (const block of level.learn) {
        if (block.type !== 'demo') continue;
        const spec = { ...SOROBAN, rods: block.rods ?? SOROBAN.rods };
        const sol = solveAddSub(spec, emptyState(spec), block.terms);
        for (const t of sol.techniques) expect(allowed.size ? allowed.has(t) : TECHNIQUES.includes(t)).toBe(true);
      }
    }
  });

  it('demos in a level with a target technique actually use it', () => {
    for (const level of LEVELS) {
      const required = new Set(level.practice.flatMap((p) => (p.spec.kind === 'addsub' ? p.spec.require ?? [] : [])));
      if (required.size === 0) continue;
      for (const block of level.learn) {
        if (block.type !== 'demo') continue;
        const spec = { ...SOROBAN, rods: block.rods ?? SOROBAN.rods };
        const used = [...solveAddSub(spec, emptyState(spec), block.terms).techniques];
        expect(used.some((t) => required.has(t)), `${level.id}: ${block.title}`).toBe(true);
      }
    }
  });

  it('every add/sub practice set can generate problems that fit its frame', () => {
    const rng = seededRng(3);
    for (const level of LEVELS) {
      for (const set of level.practice) {
        if (set.spec.kind !== 'addsub') continue;
        const spec = { ...SOROBAN, rods: set.rods ?? SOROBAN.rods };
        for (let i = 0; i < 50; i++) generateAddSub(spec, set.spec, rng);
      }
    }
  });
});
