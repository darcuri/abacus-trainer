import { describe, expect, it } from 'vitest';
import { SOROBAN, setNumber } from '../model/frame';
import { solveAddSub } from './addsub';
import { describeMove, describeOp } from './describe';

const spec = { ...SOROBAN, rods: 3 };
const opsFor = (start: number, term: number) => solveAddSub(spec, setNumber(spec, start), [term]).steps[0].ops;

describe('describeOp', () => {
  it('names each technique with its complement', () => {
    expect(describeOp(opsFor(2, 2)[0], 2)).toBe('Ones rod: +2, directly');
    expect(describeOp(opsFor(3, 4)[0], 2)).toBe('Ones rod: +4 as +5 −1');
    expect(describeOp(opsFor(6, -3)[0], 2)).toBe('Ones rod: −3 as −5 +2');
    const carry = opsFor(8, 5);
    expect(describeOp(carry[0], 2)).toBe('Ones rod: +5 as −5 here, +10 on the left');
    expect(describeOp(carry[1], 2)).toBe('Carry 1 into the tens rod');
    expect(describeOp(opsFor(5, 6)[0], 2)).toBe('Ones rod: +6 as −4 here (−5 +1), +10 on the left');
    expect(describeOp(opsFor(13, -8)[1], 2)).toBe('Ones rod: −8 as −10 on the left, +2 here (+5 −3)');
  });

  it('describes bead moves', () => {
    expect(describeMove({ rod: 0, deck: 'upper', from: 0, to: 1 })).toBe('lower the heaven bead to the bar');
    expect(describeMove({ rod: 0, deck: 'lower', from: 3, to: 1 })).toBe('pull 2 earth beads down');
  });
});
