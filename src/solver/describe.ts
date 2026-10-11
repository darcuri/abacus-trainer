import { rodName } from '../model/frame';
import type { BeadMove } from '../model/moves';
import type { DigitOp } from './addsub';

export function describeMove(m: BeadMove): string {
  const n = Math.abs(m.to - m.from);
  if (m.deck === 'upper') {
    const what = n === 1 ? 'the heaven bead' : `${n} heaven beads`;
    return m.to > m.from ? `lower ${what} to the bar` : `raise ${what} off the bar`;
  }
  const what = n === 1 ? '1 earth bead' : `${n} earth beads`;
  return m.to > m.from ? `push ${what} up` : `pull ${what} down`;
}

export function describeOp(op: DigitOp, unitRod: number): string {
  const rod = rodName(op.rod, unitRod);
  const c = 10 - op.digit;
  if (op.cause === 'carry') return `Carry 1 into the ${rod} rod`;
  if (op.cause === 'borrow') return `Borrow 1 from the ${rod} rod`;
  const head = `${capitalize(rod)} rod: ${op.op}${op.digit}`;
  switch (op.technique) {
    case 'direct':
      return `${head}, directly`;
    case 'five':
      return op.op === '+' ? `${head} as +5 −${5 - op.digit}` : `${head} as −5 +${5 - op.digit}`;
    case 'ten':
      return op.op === '+' ? `${head} as −${c} here, +10 on the left` : `${head} as −10 on the left, +${c} here`;
    case 'fiveTen':
      return op.op === '+'
        ? `${head} as −${c} here (−5 +${5 - c}), +10 on the left`
        : `${head} as −10 on the left, +${c} here (+5 −${5 - c})`;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
