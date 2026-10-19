import { describe, expect, it } from 'vitest';
import { recordAttempts, summarize } from './progress';

describe('summarize', () => {
  it('counts only correct attempts without hints and within time as clean', () => {
    const s = summarize([{ ok: true, ms: 1000 }, { ok: true, ms: 1000, hinted: true }, { ok: true, ms: 9000, slow: true }, { ok: false, ms: 500 }]);
    expect(s.accuracy).toBe(0.25);
    expect(s.medianMs).toBe(1000);
    expect(s.mastered).toBe(false);
  });

  it('needs 20 attempts at 90% clean for mastery', () => {
    const good = Array.from({ length: 18 }, () => ({ ok: true, ms: 1000 }));
    expect(summarize(good).mastered).toBe(false);
    const p = recordAttempts({ sets: {} }, 'x', [...good, { ok: true, ms: 1000 }, { ok: false, ms: 1000 }]);
    expect(summarize(p.sets.x).mastered).toBe(true);
  });

  it('keeps only the last 20 attempts', () => {
    const p = recordAttempts({ sets: {} }, 'x', Array.from({ length: 25 }, (_, i) => ({ ok: i >= 5, ms: 1 })));
    expect(p.sets.x).toHaveLength(20);
    expect(summarize(p.sets.x).accuracy).toBe(1);
  });
});
