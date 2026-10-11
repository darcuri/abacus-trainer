import type { AbacusState, Deck, FrameSpec } from './frame';

/** One push of a contiguous block of beads on one deck of one rod. */
export interface BeadMove {
  rod: number;
  deck: Deck;
  /** Beads touching the bar before the move. */
  from: number;
  /** Beads touching the bar after the move. */
  to: number;
}

/** A move as recorded from the learner, with a timestamp in ms. */
export interface LoggedMove extends BeadMove {
  t: number;
}

export function applyMove(state: AbacusState, move: BeadMove): AbacusState {
  const rod = state[move.rod];
  if (!rod) throw new Error(`No rod ${move.rod}`);
  if (rod[move.deck] !== move.from) {
    throw new Error(`Rod ${move.rod} ${move.deck} has ${rod[move.deck]} beads at the bar, expected ${move.from}`);
  }
  return state.map((r, i) => (i === move.rod ? { ...r, [move.deck]: move.to } : r));
}

export function applyMoves(state: AbacusState, moves: readonly BeadMove[]): AbacusState {
  return moves.reduce(applyMove, state);
}

/**
 * What tapping a bead does, as on the real instrument: the tapped bead moves
 * and pushes every bead between it and where it is going.
 *
 * `index` counts from the bar: 0 is the bead nearest the bar.
 */
export function tapBead(spec: FrameSpec, state: AbacusState, rod: number, deck: Deck, index: number): BeadMove {
  const beads = spec[deck].beads;
  if (index < 0 || index >= beads) throw new Error(`No bead ${index} on the ${deck} deck`);
  const from = state[rod][deck];
  const to = index < from ? index : index + 1;
  return { rod, deck, from, to };
}

/** Moves that take `rod` from its current layout to `target`, upper deck first. */
export function movesToLayout(state: AbacusState, rod: number, target: { upper: number; lower: number }): BeadMove[] {
  const cur = state[rod];
  const out: BeadMove[] = [];
  if (cur.upper !== target.upper) out.push({ rod, deck: 'upper', from: cur.upper, to: target.upper });
  if (cur.lower !== target.lower) out.push({ rod, deck: 'lower', from: cur.lower, to: target.lower });
  return out;
}
