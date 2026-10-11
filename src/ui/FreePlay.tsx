import { useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { type FrameSpec, SOROBAN, SUANPAN, isCanonicalDecimal, valueOf } from '../model/frame';
import { Abacus } from './Abacus';
import { useAbacus } from './useAbacus';

const FRAMES: FrameSpec[] = [SOROBAN, SUANPAN];

export function FreePlay(): JSX.Element {
  const [specId, setSpecId] = useState(SOROBAN.id);
  const spec = FRAMES.find((f) => f.id === specId)!;
  return (
    <section>
      <h2>Free play</h2>
      <p class="muted">
        Move beads freely. Select a rod with the arrow keys and type a digit to set it. The suanpan frame is here to show the model
        handles other layouts; lessons use the soroban.
      </p>
      <div class="segmented">
        {FRAMES.map((f) => (
          <button key={f.id} class={f.id === specId ? 'active' : ''} onClick={() => setSpecId(f.id)}>
            {f.name}
          </button>
        ))}
      </div>
      <Board key={spec.id} spec={spec} />
    </section>
  );
}

function Board({ spec }: { spec: FrameSpec }): JSX.Element {
  const ab = useAbacus(spec);
  const [showValues, setShowValues] = useState(true);
  const value = valueOf(spec, ab.state);
  return (
    <div class="card">
      <Abacus spec={spec} state={ab.state} onMove={ab.move} digitKeys showValues={showValues} />
      <div class="controls">
        <span class="number">{value.toLocaleString()}</span>
        {!isCanonicalDecimal(spec, ab.state) && <span class="muted">(some rods hold more than 9 or use a non-standard layout)</span>}
        <label class="check">
          <input type="checkbox" checked={showValues} onChange={(e) => setShowValues((e.target as HTMLInputElement).checked)} /> Rod values
        </label>
        <button onClick={() => ab.reset()}>Clear</button>
        <span class="muted">{ab.log.length} moves</span>
      </div>
    </div>
  );
}
