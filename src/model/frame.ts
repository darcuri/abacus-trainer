// Core abacus model. Pure data, no rendering.
//
// Beads on a deck always move as one contiguous block toward the reckoning bar,
// so a rod is fully described by how many beads on each deck touch the bar.
// Nothing here assumes a soroban's 1/4 layout; a suanpan is just another spec.

export type Deck = 'upper' | 'lower';

export interface DeckSpec {
  beads: number;
  beadValue: number;
}

export interface FrameSpec {
  id: string;
  name: string;
  upper: DeckSpec;
  lower: DeckSpec;
  rods: number;
  /** Draw a unit dot every N rods counting left from the unit rod; 0 for none. */
  unitMarkEvery: number;
}

export interface RodState {
  upper: number;
  lower: number;
}

/** Index 0 is the leftmost rod. */
export type AbacusState = readonly RodState[];

export const SOROBAN: FrameSpec = {
  id: 'soroban',
  name: 'Soroban',
  upper: { beads: 1, beadValue: 5 },
  lower: { beads: 4, beadValue: 1 },
  rods: 13,
  unitMarkEvery: 3,
};

export const SUANPAN: FrameSpec = {
  id: 'suanpan',
  name: 'Suanpan',
  upper: { beads: 2, beadValue: 5 },
  lower: { beads: 5, beadValue: 1 },
  rods: 13,
  unitMarkEvery: 0,
};

export function emptyState(spec: FrameSpec): AbacusState {
  return Array.from({ length: spec.rods }, () => ({ upper: 0, lower: 0 }));
}

export function defaultUnitRod(spec: FrameSpec): number {
  return spec.rods - 1;
}

export function rodValue(spec: FrameSpec, rod: RodState): number {
  return rod.upper * spec.upper.beadValue + rod.lower * spec.lower.beadValue;
}

export function maxRodValue(spec: FrameSpec): number {
  return spec.upper.beads * spec.upper.beadValue + spec.lower.beads * spec.lower.beadValue;
}

export function isValidRod(spec: FrameSpec, rod: RodState): boolean {
  return (
    Number.isInteger(rod.upper) &&
    Number.isInteger(rod.lower) &&
    rod.upper >= 0 &&
    rod.upper <= spec.upper.beads &&
    rod.lower >= 0 &&
    rod.lower <= spec.lower.beads
  );
}

export function isValidState(spec: FrameSpec, state: AbacusState): boolean {
  return state.length === spec.rods && state.every((r) => isValidRod(spec, r));
}

/** Every bead layout that shows `value` on one rod. */
export function layouts(spec: FrameSpec, value: number): RodState[] {
  const out: RodState[] = [];
  for (let upper = spec.upper.beads; upper >= 0; upper--) {
    const rest = value - upper * spec.upper.beadValue;
    if (rest < 0 || rest % spec.lower.beadValue !== 0) continue;
    const lower = rest / spec.lower.beadValue;
    if (lower <= spec.lower.beads) out.push({ upper, lower });
  }
  return out;
}

/**
 * The preferred layout for a value: as many upper beads as fit, which is the
 * fewest beads in total. On a soroban this is the only layout for 0 to 9.
 */
export function canonical(spec: FrameSpec, value: number): RodState | null {
  return layouts(spec, value)[0] ?? null;
}

export function isCanonicalRod(spec: FrameSpec, rod: RodState): boolean {
  const c = canonical(spec, rodValue(spec, rod));
  return c !== null && c.upper === rod.upper && c.lower === rod.lower;
}

/** True when every rod holds a single decimal digit in its preferred layout. */
export function isCanonicalDecimal(spec: FrameSpec, state: AbacusState): boolean {
  return state.every((r) => rodValue(spec, r) <= 9 && isCanonicalRod(spec, r));
}

/** Decimal value of the frame, reading `unitRod` as the ones place. */
export function valueOf(spec: FrameSpec, state: AbacusState, unitRod = defaultUnitRod(spec)): number {
  let total = 0;
  for (let i = 0; i < state.length; i++) {
    total += rodValue(spec, state[i]) * 10 ** (unitRod - i);
  }
  return total;
}

/** Sets a non-negative integer with its ones digit on `unitRod`. */
export function setNumber(spec: FrameSpec, n: number, unitRod = defaultUnitRod(spec)): AbacusState {
  if (!Number.isInteger(n) || n < 0) throw new Error(`Only non-negative integers can be set: ${n}`);
  const state = emptyState(spec).map((r) => ({ ...r }));
  let rest = n;
  let rod = unitRod;
  while (rest > 0) {
    if (rod < 0) throw new Error(`${n} does not fit on ${spec.rods} rods`);
    state[rod] = canonical(spec, rest % 10)!;
    rest = Math.floor(rest / 10);
    rod--;
  }
  return state;
}

export function statesEqual(a: AbacusState, b: AbacusState): boolean {
  return a.length === b.length && a.every((r, i) => r.upper === b[i].upper && r.lower === b[i].lower);
}

/** Human name for a rod relative to the unit rod. */
export function rodName(rod: number, unitRod: number): string {
  const place = unitRod - rod;
  const names = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands', 'millions'];
  if (place >= 0 && place < names.length) return names[place];
  if (place < 0) return `${-place}${ordinalSuffix(-place)} decimal place`;
  return `10^${place} place`;
}

function ordinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
}
