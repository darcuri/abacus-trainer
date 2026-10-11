import { describe, expect, it } from 'vitest';
import {
  SOROBAN, SUANPAN, canonical, emptyState, isCanonicalDecimal, isValidState, layouts,
  maxRodValue, rodName, setNumber, valueOf,
} from './frame';
import { applyMove, tapBead } from './moves';

describe('frame specs', () => {
  it('soroban rods hold 0-9 with exactly one layout each', () => {
    expect(maxRodValue(SOROBAN)).toBe(9);
    for (let v = 0; v <= 9; v++) expect(layouts(SOROBAN, v)).toHaveLength(1);
    expect(layouts(SOROBAN, 10)).toHaveLength(0);
  });

  it('suanpan rods hold 0-15 and some values have two layouts', () => {
    expect(maxRodValue(SUANPAN)).toBe(15);
    for (let v = 0; v <= 15; v++) expect(layouts(SUANPAN, v).length).toBeGreaterThan(0);
    expect(layouts(SUANPAN, 5)).toEqual([{ upper: 1, lower: 0 }, { upper: 0, lower: 5 }]);
    expect(canonical(SUANPAN, 5)).toEqual({ upper: 1, lower: 0 });
    expect(canonical(SUANPAN, 15)).toEqual({ upper: 2, lower: 5 });
  });
});

describe('setNumber / valueOf', () => {
  it('round-trips integers on both frames', () => {
    for (const spec of [SOROBAN, SUANPAN]) {
      for (const n of [0, 7, 10, 305, 9999, 1234567890123]) {
        const s = setNumber(spec, n);
        expect(isValidState(spec, s)).toBe(true);
        expect(isCanonicalDecimal(spec, s)).toBe(true);
        expect(valueOf(spec, s)).toBe(n);
      }
    }
  });

  it('respects a custom unit rod', () => {
    const s = setNumber(SOROBAN, 42, 6);
    expect(valueOf(SOROBAN, s, 6)).toBe(42);
    expect(valueOf(SOROBAN, s)).toBe(42_000_000);
  });

  it('rejects numbers that do not fit', () => {
    expect(() => setNumber(SOROBAN, 10 ** 13)).toThrow();
  });

  it('values suanpan rods above 9 by place', () => {
    const s = emptyState(SUANPAN).map((r) => ({ ...r }));
    s[12] = { upper: 2, lower: 2 }; // 12 on the ones rod
    expect(valueOf(SUANPAN, s)).toBe(12);
    expect(isCanonicalDecimal(SUANPAN, s)).toBe(false);
  });
});

describe('tapBead', () => {
  it('pushes the tapped bead and those between it and the bar', () => {
    let s = emptyState(SOROBAN);
    const m1 = tapBead(SOROBAN, s, 12, 'lower', 2);
    expect(m1).toEqual({ rod: 12, deck: 'lower', from: 0, to: 3 });
    s = applyMove(s, m1);
    // Tapping a bead already at the bar pulls it and those beyond it away.
    expect(tapBead(SOROBAN, s, 12, 'lower', 1)).toEqual({ rod: 12, deck: 'lower', from: 3, to: 1 });
    expect(tapBead(SOROBAN, s, 12, 'lower', 0)).toEqual({ rod: 12, deck: 'lower', from: 3, to: 0 });
    expect(tapBead(SOROBAN, s, 12, 'upper', 0)).toEqual({ rod: 12, deck: 'upper', from: 0, to: 1 });
  });

  it('works on a two-bead upper deck', () => {
    const s = emptyState(SUANPAN);
    expect(tapBead(SUANPAN, s, 0, 'upper', 1)).toEqual({ rod: 0, deck: 'upper', from: 0, to: 2 });
  });

  it('applyMove rejects a stale move', () => {
    expect(() => applyMove(emptyState(SOROBAN), { rod: 0, deck: 'lower', from: 2, to: 3 })).toThrow();
  });
});

describe('rodName', () => {
  it('names places', () => {
    expect(rodName(12, 12)).toBe('ones');
    expect(rodName(10, 12)).toBe('hundreds');
    expect(rodName(12, 11)).toBe('1st decimal place');
  });
});
