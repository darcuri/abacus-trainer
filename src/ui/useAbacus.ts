import { useCallback, useState } from 'preact/hooks';
import { type AbacusState, type FrameSpec, emptyState } from '../model/frame';
import { type BeadMove, type LoggedMove, applyMove } from '../model/moves';

export interface AbacusController {
  state: AbacusState;
  /** Every move since the last reset, for timing and (later) technique grading. */
  log: readonly LoggedMove[];
  move: (m: BeadMove) => void;
  reset: (s?: AbacusState) => void;
}

export function useAbacus(spec: FrameSpec, initial?: AbacusState): AbacusController {
  const [{ state, log }, set] = useState(() => ({ state: initial ?? emptyState(spec), log: [] as LoggedMove[] }));

  const move = useCallback((m: BeadMove) => {
    set((cur) => {
      if (m.from === m.to) return cur;
      return { state: applyMove(cur.state, m), log: [...cur.log, { ...m, t: performance.now() }] };
    });
  }, []);

  const reset = useCallback((s?: AbacusState) => set({ state: s ?? emptyState(spec), log: [] }), [spec]);

  return { state, log, move, reset };
}
