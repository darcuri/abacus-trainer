import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { type AbacusState, type Deck, type FrameSpec, canonical, defaultUnitRod, rodValue, valueOf } from '../model/frame';
import { type BeadMove, movesToLayout, tapBead } from '../model/moves';

const ROD_GAP = 44;
const BEAD_W = 38;
const BEAD_H = 22;
const BEAM = 14;
const BAR = 8;
const LABEL_H = 24;

export interface AbacusProps {
  spec: FrameSpec;
  state: AbacusState;
  unitRod?: number;
  /** Called for each bead move the learner makes. Omit for a read-only frame. */
  onMove?: (move: BeadMove) => void;
  /** Allow typing a digit to set the selected rod (setting drills only). */
  digitKeys?: boolean;
  /** Show each rod's value below it. */
  showValues?: boolean;
  /** Outline target bead positions on rods that differ from this state. */
  ghost?: AbacusState;
  highlightRods?: readonly number[];
  label?: string;
}

export function Abacus(props: AbacusProps): JSX.Element {
  const { spec, state, onMove, ghost, showValues } = props;
  const unitRod = props.unitRod ?? defaultUnitRod(spec);
  const [selected, setSelected] = useState(unitRod);
  const interactive = !!onMove;

  const upperDeckH = (spec.upper.beads + 1) * BEAD_H + 4;
  const lowerDeckH = (spec.lower.beads + 1) * BEAD_H + 4;
  const width = spec.rods * ROD_GAP + 2 * BEAM;
  const barTop = BEAM + upperDeckH;
  const barBottom = barTop + BAR;
  const lowerBottom = barBottom + lowerDeckH;
  const frameH = lowerBottom + BEAM;
  const height = frameH + (showValues ? LABEL_H : 0);

  const rodX = (i: number) => BEAM + ROD_GAP * i + ROD_GAP / 2;

  function beadY(deck: Deck, i: number, atBar: boolean): number {
    const n = spec[deck].beads;
    if (deck === 'upper') return atBar ? barTop - (i + 1) * BEAD_H : BEAM + 2 + (n - 1 - i) * BEAD_H;
    return atBar ? barBottom + i * BEAD_H : lowerBottom - 2 - (n - i) * BEAD_H;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!interactive) return;
    if (e.key === 'ArrowLeft') setSelected((s) => Math.max(0, s - 1));
    else if (e.key === 'ArrowRight') setSelected((s) => Math.min(spec.rods - 1, s + 1));
    else if (props.digitKeys && /^[0-9]$/.test(e.key)) {
      const target = canonical(spec, Number(e.key));
      if (target) movesToLayout(state, selected, target).forEach((m) => onMove!(m));
      setSelected((s) => Math.min(spec.rods - 1, s + 1));
    } else return;
    e.preventDefault();
  }

  const beads: JSX.Element[] = [];
  const ghosts: JSX.Element[] = [];
  state.forEach((rod, r) => {
    const cx = rodX(r);
    (['upper', 'lower'] as const).forEach((deck) => {
      for (let i = 0; i < spec[deck].beads; i++) {
        const atBar = i < rod[deck];
        const y = beadY(deck, i, atBar);
        beads.push(
          <g
            key={`${r}-${deck}-${i}`}
            class={`bead ${atBar ? 'bead-active' : ''}`}
            style={{ transform: `translate(${cx}px, ${y}px)` }}
            onClick={interactive ? () => onMove!(tapBead(spec, state, r, deck, i)) : undefined}
          >
            <polygon points={beadPoints()} />
          </g>,
        );
        const target = ghost?.[r];
        if (target && (target.upper !== rod.upper || target.lower !== rod.lower)) {
          const gy = beadY(deck, i, i < target[deck]);
          if (gy !== y) {
            ghosts.push(
              <g key={`g-${r}-${deck}-${i}`} class="bead-ghost" style={{ transform: `translate(${cx}px, ${gy}px)` }}>
                <polygon points={beadPoints()} />
              </g>,
            );
          }
        }
      }
    });
  });

  const dots: JSX.Element[] = [];
  if (spec.unitMarkEvery > 0) {
    for (let r = 0; r < spec.rods; r++) {
      if ((unitRod - r) % spec.unitMarkEvery === 0) {
        dots.push(<circle key={`dot-${r}`} class="unit-dot" cx={rodX(r)} cy={barTop + BAR / 2} r={2.5} />);
      }
    }
  }

  return (
    <svg
      class={`abacus ${interactive ? 'abacus-interactive' : ''}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={props.label ?? `${spec.name} showing ${valueOf(spec, state, unitRod)}`}
      tabindex={interactive ? 0 : undefined}
      onKeyDown={onKeyDown}
    >
      <rect class="frame" x={0} y={0} width={width} height={frameH} rx={6} />
      <rect class="frame-inner" x={BEAM} y={BEAM} width={width - 2 * BEAM} height={frameH - 2 * BEAM} />
      {props.highlightRods?.map((r) => (
        <rect key={`hl-${r}`} class="rod-highlight" x={rodX(r) - ROD_GAP / 2 + 1} y={BEAM} width={ROD_GAP - 2} height={frameH - 2 * BEAM} />
      ))}
      {interactive && (
        <rect class="rod-selected" x={rodX(selected) - ROD_GAP / 2 + 1} y={BEAM} width={ROD_GAP - 2} height={frameH - 2 * BEAM} />
      )}
      {state.map((_, r) => (
        <line key={`rod-${r}`} class="rod" x1={rodX(r)} x2={rodX(r)} y1={BEAM} y2={lowerBottom} />
      ))}
      <rect class="bar" x={BEAM} y={barTop} width={width - 2 * BEAM} height={BAR} />
      {dots}
      {ghosts}
      {beads}
      {showValues &&
        state.map((rod, r) => (
          <text key={`v-${r}`} class={`rod-value ${r === unitRod ? 'rod-value-unit' : ''}`} x={rodX(r)} y={frameH + LABEL_H - 7}>
            {rodValue(spec, rod)}
          </text>
        ))}
    </svg>
  );
}

function beadPoints(): string {
  const w = BEAD_W / 2;
  const h = BEAD_H;
  return [
    [-w, h / 2],
    [-w / 2 + 1, 1],
    [w / 2 - 1, 1],
    [w, h / 2],
    [w / 2 - 1, h - 1],
    [-w / 2 + 1, h - 1],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}
