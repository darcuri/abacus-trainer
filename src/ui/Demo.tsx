import { useEffect, useMemo, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { type AbacusState, SOROBAN, defaultUnitRod, emptyState } from '../model/frame';
import { applyMove } from '../model/moves';
import { solveAddSub } from '../solver/addsub';
import { describeMove, describeOp } from '../solver/describe';
import type { DemoBlock } from '../lessons/types';
import { Abacus } from './Abacus';

interface Frame {
  state: AbacusState;
  caption: string;
  detail: string;
  rod: number | null;
  termIndex: number;
}

/** Steps through the solver's bead moves for a chain of terms. */
export function Demo({ block }: { block: DemoBlock }): JSX.Element {
  const spec = useMemo(() => ({ ...SOROBAN, rods: block.rods ?? 5 }), [block.rods]);
  const unitRod = defaultUnitRod(spec);

  const frames = useMemo(() => {
    const out: Frame[] = [{ state: emptyState(spec), caption: 'Start with a clear frame.', detail: '', rod: null, termIndex: -1 }];
    let s = emptyState(spec);
    const sol = solveAddSub(spec, s, block.terms);
    sol.steps.forEach((step, ti) => {
      for (const op of step.ops) {
        for (const m of op.moves) {
          s = applyMove(s, m);
          out.push({ state: s, caption: describeOp(op, unitRod), detail: describeMove(m), rod: op.rod, termIndex: ti });
        }
      }
    });
    return out;
  }, [spec, block.terms, unitRod]);

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (i >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => x + 1), 1100);
    return () => clearTimeout(t);
  }, [playing, i, frames.length]);

  const f = frames[i];
  return (
    <div class="card demo">
      <div class="demo-head">
        <strong>Demo: {block.title}</strong>
        <span class="muted">
          {i}/{frames.length - 1}
        </span>
      </div>
      <TermList terms={block.terms} current={f.termIndex} doneThrough={i === frames.length - 1 ? block.terms.length - 1 : f.termIndex - 1} />
      <Abacus spec={spec} state={f.state} showValues highlightRods={f.rod === null ? [] : [f.rod]} />
      <p class="caption">
        {f.caption}
        {f.detail && <span class="muted">: {f.detail}</span>}
      </p>
      <div class="controls">
        <button onClick={() => { setPlaying(false); setI(0); }} disabled={i === 0}>Restart</button>
        <button onClick={() => { setPlaying(false); setI((x) => Math.max(0, x - 1)); }} disabled={i === 0}>Back</button>
        <button onClick={() => { setPlaying(false); setI((x) => Math.min(frames.length - 1, x + 1)); }} disabled={i === frames.length - 1}>Next</button>
        <button class="primary" onClick={() => { if (i === frames.length - 1) setI(0); setPlaying((p) => !p); }}>
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}

export function TermList({ terms, current, doneThrough }: { terms: readonly number[]; current: number; doneThrough: number }): JSX.Element {
  return (
    <ol class="terms">
      {terms.map((t, k) => (
        <li key={k} class={k <= doneThrough ? 'term-done' : k === current ? 'term-current' : ''}>
          {k === 0 ? '' : t < 0 ? '− ' : '+ '}
          {Math.abs(t).toLocaleString()}
        </li>
      ))}
    </ol>
  );
}
