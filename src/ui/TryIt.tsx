import type { JSX } from 'preact';
import { SOROBAN, isCanonicalDecimal, valueOf } from '../model/frame';
import type { TryBlock } from '../lessons/types';
import { Abacus } from './Abacus';
import { useAbacus } from './useAbacus';

export function TryIt({ block }: { block: TryBlock }): JSX.Element {
  const spec = { ...SOROBAN, rods: block.rods ?? 5 };
  const ab = useAbacus(spec);
  const done = valueOf(spec, ab.state) === block.value && isCanonicalDecimal(spec, ab.state);
  return (
    <div class={`card try ${done ? 'try-done' : ''}`}>
      <div class="try-head">
        <span>{block.prompt}</span>
        {done ? <span class="badge ok">Done</span> : <button class="link" onClick={() => ab.reset()}>Clear</button>}
      </div>
      <Abacus spec={spec} state={ab.state} onMove={ab.move} showValues />
    </div>
  );
}
