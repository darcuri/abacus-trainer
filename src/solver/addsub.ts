// Reference solver for soroban addition and subtraction.
//
// Works digit by digit, most significant first, the way the soroban is taught,
// and records which technique each digit needs. Lessons use the steps for demos
// and hints; generators use the technique sets to pick problems that exercise
// exactly the skill being taught.

import { type AbacusState, type FrameSpec, defaultUnitRod, valueOf } from '../model/frame';
import type { BeadMove } from '../model/moves';

export type Technique =
  /** Beads pushed straight on or off. */
  | 'direct'
  /** +d as +5 −(5−d), or −d as −5 +(5−d). */
  | 'five'
  /** +d as −(10−d) and carry 1, or −d as borrow 1 and +(10−d), done directly. */
  | 'ten'
  /** A ten-complement whose own −(10−d) or +(10−d) needs a five-complement. */
  | 'fiveTen';

export const TECHNIQUES: readonly Technique[] = ['direct', 'five', 'ten', 'fiveTen'];

export interface DigitOp {
  rod: number;
  op: '+' | '-';
  digit: number;
  technique: Technique;
  /** Bead moves on this rod only. Carries and borrows are their own ops. */
  moves: BeadMove[];
  /** Set when this op is the carry or borrow of an op on the rod to its right. */
  cause?: 'carry' | 'borrow';
}

export interface Step {
  /** The signed term this step adds. */
  term: number;
  /** Ops in the order a trained user performs them. */
  ops: DigitOp[];
  stateAfter: AbacusState;
}

export interface Solution {
  steps: Step[];
  final: AbacusState;
  techniques: Set<Technique>;
}

export class SolverError extends Error {}

function assertSoroban(spec: FrameSpec): void {
  if (spec.upper.beads !== 1 || spec.upper.beadValue !== 5 || spec.lower.beads !== 4 || spec.lower.beadValue !== 1) {
    // Suanpan technique differs (rods may temporarily hold more than 9); it needs its own solver.
    throw new SolverError(`The add/sub solver supports soroban layouts only, not ${spec.name}`);
  }
}

interface Rod {
  upper: number;
  lower: number;
}

/** Direct moves for ±d on a rod, or null if beads can't be pushed directly. */
function directMoves(rodIndex: number, r: Rod, sign: 1 | -1, d: number): BeadMove[] | null {
  const fives = d >= 5 ? 1 : 0;
  const ones = d - 5 * fives;
  const upper = r.upper + sign * fives;
  const lower = r.lower + sign * ones;
  if (upper < 0 || upper > 1 || lower < 0 || lower > 4) return null;
  const moves: BeadMove[] = [];
  if (upper !== r.upper) moves.push({ rod: rodIndex, deck: 'upper', from: r.upper, to: upper });
  if (lower !== r.lower) moves.push({ rod: rodIndex, deck: 'lower', from: r.lower, to: lower });
  return moves;
}

/** Five-complement moves for ±d (d < 5), or null if not applicable. */
function fiveMoves(rodIndex: number, r: Rod, sign: 1 | -1, d: number): BeadMove[] | null {
  if (d >= 5) return null;
  const upper = r.upper + sign;
  const lower = r.lower - sign * (5 - d);
  if (upper < 0 || upper > 1 || lower < 0 || lower > 4) return null;
  return [
    { rod: rodIndex, deck: 'upper', from: r.upper, to: upper },
    { rod: rodIndex, deck: 'lower', from: r.lower, to: lower },
  ];
}

/** Moves for ±d within one rod without carry or borrow. */
function inRod(rodIndex: number, r: Rod, sign: 1 | -1, d: number): { moves: BeadMove[]; technique: 'direct' | 'five' } | null {
  const direct = directMoves(rodIndex, r, sign, d);
  if (direct) return { moves: direct, technique: 'direct' };
  const five = fiveMoves(rodIndex, r, sign, d);
  if (five) return { moves: five, technique: 'five' };
  return null;
}

/**
 * Adds or subtracts one digit on one rod, appending ops (including any carry or
 * borrow chain to the left) to `ops` and mutating `state`.
 */
function digitOp(state: Rod[], rodIndex: number, sign: 1 | -1, d: number, ops: DigitOp[], cause?: 'carry' | 'borrow'): void {
  if (rodIndex < 0) throw new SolverError(sign > 0 ? 'Result overflows the frame' : 'Result would be negative');
  const r = state[rodIndex];
  const op: '+' | '-' = sign > 0 ? '+' : '-';

  const simple = inRod(rodIndex, r, sign, d);
  if (simple) {
    ops.push({ rod: rodIndex, op, digit: d, technique: simple.technique, moves: simple.moves, cause });
    apply(state, simple.moves);
    return;
  }

  // Needs the next rod: +d = −(10−d) here then carry 1; −d = borrow 1 then +(10−d) here.
  const c = 10 - d;
  const opposite = (-sign) as 1 | -1;
  const here = inRod(rodIndex, r, opposite, c);
  if (!here) throw new SolverError(`No technique for ${op}${d} on a rod showing ${r.upper * 5 + r.lower}`);
  const technique: Technique = here.technique === 'direct' ? 'ten' : 'fiveTen';
  const self: DigitOp = { rod: rodIndex, op, digit: d, technique, moves: here.moves, cause };

  if (sign > 0) {
    // Common teaching order: take the complement off this rod, then carry.
    ops.push(self);
    apply(state, here.moves);
    digitOp(state, rodIndex - 1, 1, 1, ops, 'carry');
  } else {
    // Borrow first, then give the complement back to this rod.
    digitOp(state, rodIndex - 1, -1, 1, ops, 'borrow');
    ops.push(self);
    apply(state, here.moves);
  }
}

function apply(state: Rod[], moves: BeadMove[]): void {
  for (const m of moves) state[m.rod][m.deck] = m.to;
}

function digitsOf(n: number): number[] {
  return String(n).split('').map(Number);
}

/**
 * Solves a chain of signed integer terms starting from `start`, with each
 * term's ones digit aligned on `unitRod`.
 */
export function solveAddSub(
  spec: FrameSpec,
  start: AbacusState,
  terms: readonly number[],
  unitRod = defaultUnitRod(spec),
): Solution {
  assertSoroban(spec);
  const state: Rod[] = start.map((r) => ({ ...r }));
  const steps: Step[] = [];
  const techniques = new Set<Technique>();

  for (const term of terms) {
    if (!Number.isInteger(term)) throw new SolverError(`Only integer terms are supported: ${term}`);
    const sign: 1 | -1 = term < 0 ? -1 : 1;
    const digits = digitsOf(Math.abs(term));
    const ops: DigitOp[] = [];
    digits.forEach((d, i) => {
      if (d === 0) return;
      const rod = unitRod - (digits.length - 1 - i);
      digitOp(state, rod, sign, d, ops);
    });
    ops.forEach((o) => techniques.add(o.technique));
    steps.push({ term, ops, stateAfter: state.map((r) => ({ ...r })) });
  }

  return { steps, final: state.map((r) => ({ ...r })), techniques };
}

/** All bead moves of a solution in order, for demos and replay checks. */
export function allMoves(solution: Solution): BeadMove[] {
  return solution.steps.flatMap((s) => s.ops.flatMap((o) => o.moves));
}

/** Sanity helper: the value the frame should show after the whole chain. */
export function expectedValue(spec: FrameSpec, start: AbacusState, terms: readonly number[], unitRod = defaultUnitRod(spec)): number {
  return valueOf(spec, start, unitRod) + terms.reduce((a, b) => a + b, 0);
}
