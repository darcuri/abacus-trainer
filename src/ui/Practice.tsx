import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { type AbacusState, SOROBAN, defaultUnitRod, isCanonicalDecimal, setNumber, statesEqual, valueOf } from '../model/frame';
import { solveAddSub } from '../solver/addsub';
import { describeOp } from '../solver/describe';
import { type Rng, generateAddSub, randInt, randomNumber, seededRng } from '../solver/generate';
import type { PracticeSet } from '../lessons/types';
import { type Attempt, type Progress, recordAttempts, saveProgress, summarize } from '../progress';
import { Abacus } from './Abacus';
import { Demo, TermList } from './Demo';
import { useAbacus } from './useAbacus';

type Problem =
  | { kind: 'set'; n: number; showValues: boolean }
  | { kind: 'read'; n: number; state: AbacusState }
  | { kind: 'addsub'; terms: number[]; answer: number; checkpoints: AbacusState[]; hints: string[][] };

function makeProblem(set: PracticeSet, rng: Rng): Problem {
  const spec = { ...SOROBAN, rods: set.rods ?? SOROBAN.rods };
  const s = set.spec;
  switch (s.kind) {
    case 'set':
      return { kind: 'set', n: randomNumber(rng, randInt(rng, s.digits[0], s.digits[1])), showValues: s.showValues };
    case 'read': {
      const n = randomNumber(rng, randInt(rng, s.digits[0], s.digits[1]));
      return { kind: 'read', n, state: setNumber(spec, n) };
    }
    case 'addsub': {
      const p = generateAddSub(spec, s, rng);
      const sol = solveAddSub(spec, setNumber(spec, 0), p.terms);
      return {
        kind: 'addsub',
        terms: p.terms,
        answer: p.answer,
        checkpoints: sol.steps.map((st) => st.stateAfter),
        hints: sol.steps.map((st) => st.ops.map((op) => describeOp(op, defaultUnitRod(spec)))),
      };
    }
  }
}

type Feedback = { ok: boolean; slow: boolean; expected: string } | null;

export function Practice(props: { set: PracticeSet; progress: Progress; onProgress: (p: Progress) => void; onExit: () => void }): JSX.Element {
  const { set } = props;
  const spec = useMemo(() => ({ ...SOROBAN, rods: set.rods ?? SOROBAN.rods }), [set.rods]);
  const rng = useMemo(() => seededRng(Date.now() & 0xffffffff), []);

  const [index, setIndex] = useState(0);
  const [problem, setProblem] = useState(() => makeProblem(set, rng));
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [answerText, setAnswerText] = useState('');
  const [hinted, setHinted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const started = useRef(performance.now());
  const ab = useAbacus(spec);
  const inputRef = useRef<HTMLInputElement>(null);

  const finished = index >= set.problems;

  // How many terms of an add/sub chain the frame has worked through so far.
  const [reached, setReached] = useState(-1);
  useEffect(() => {
    if (problem.kind !== 'addsub') return;
    for (let k = problem.checkpoints.length - 1; k > reached; k--) {
      if (statesEqual(ab.state, problem.checkpoints[k])) {
        setReached(k);
        setShowHint(false);
        break;
      }
    }
  }, [ab.state, problem, reached]);

  useEffect(() => {
    if (problem.kind === 'read') inputRef.current?.focus();
  }, [problem]);

  function check() {
    if (feedback) return;
    let ok: boolean;
    let expected: string;
    if (problem.kind === 'set') {
      ok = valueOf(spec, ab.state) === problem.n && isCanonicalDecimal(spec, ab.state);
      expected = problem.n.toLocaleString();
    } else if (problem.kind === 'read') {
      ok = Number(answerText.replace(/[,\s_]/g, '')) === problem.n && answerText.trim() !== '';
      expected = problem.n.toLocaleString();
    } else {
      ok = valueOf(spec, ab.state) === problem.answer;
      expected = problem.answer.toLocaleString();
    }
    const ms = Math.round(performance.now() - started.current);
    const slow = set.targetSec !== undefined && ms > set.targetSec * 1000;
    setFeedback({ ok, slow, expected });
    setAttempts((a) => [...a, { ok, ms, hinted: hinted || undefined, slow: slow || undefined }]);
  }

  function next() {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setFeedback(null);
    setAnswerText('');
    setHinted(false);
    setShowHint(false);
    setShowSolution(false);
    setReached(-1);
    ab.reset();
    if (nextIndex < set.problems) {
      setProblem(makeProblem(set, rng));
      started.current = performance.now();
    } else {
      props.onProgress(saveAnd(recordAttempts(props.progress, set.id, attemptsRef.current)));
    }
  }

  // `next` runs after the last check's state update, so read attempts via a ref.
  const attemptsRef = useRef(attempts);
  attemptsRef.current = attempts;

  // Enter checks or advances. The listener is registered once and reads the
  // latest render's handlers through a ref, so it never acts on stale state.
  const enterRef = useRef<() => void>(() => {});
  enterRef.current = () => {
    if (finished) return;
    if (feedback) next();
    else check();
  };
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      enterRef.current();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (finished) {
    const session = summarize(attempts);
    const overall = summarize(props.progress.sets[set.id]);
    return (
      <div class="card">
        <h3>{set.title}: done</h3>
        <p>
          {attempts.filter((a) => a.ok).length} of {attempts.length} correct
          {session.medianMs !== null && `, median ${(session.medianMs / 1000).toFixed(1)}s`}.
        </p>
        <p class="muted">
          Last {overall.attempts} attempts: {Math.round(overall.accuracy * 100)}% clean.
          {overall.mastered
            ? ' Mastered.'
            : ` Mastery is 90% clean over the last 20, without hints${set.targetSec ? ` and within ${set.targetSec}s each` : ''}.`}
        </p>
        <div class="controls">
          <button onClick={props.onExit}>Back to level</button>
          <button class="primary" onClick={() => restart()}>Go again</button>
        </div>
      </div>
    );
  }

  function restart() {
    setIndex(0);
    setAttempts([]);
    setFeedback(null);
    setReached(-1);
    ab.reset();
    setProblem(makeProblem(set, rng));
    started.current = performance.now();
  }

  return (
    <div class="card practice">
      <div class="practice-head">
        <strong>{set.title}</strong>
        <span class="muted">
          {set.targetSec !== undefined && <Timer key={index} startedAt={started.current} targetSec={set.targetSec} stopped={!!feedback} />}
          {index + 1} / {set.problems}
        </span>
      </div>

      {problem.kind === 'set' && (
        <>
          <p class="prompt">
            Set <span class="number">{problem.n.toLocaleString()}</span>
          </p>
          <Abacus spec={spec} state={ab.state} onMove={feedback ? undefined : ab.move} showValues={problem.showValues || !!feedback} />
        </>
      )}

      {problem.kind === 'read' && (
        <>
          <p class="prompt">What number is this?</p>
          <Abacus spec={spec} state={problem.state} />
          <input
            ref={inputRef}
            class="answer"
            inputMode="numeric"
            value={answerText}
            disabled={!!feedback}
            onInput={(e) => setAnswerText((e.target as HTMLInputElement).value)}
            placeholder="Type the number"
          />
        </>
      )}

      {problem.kind === 'addsub' && (
        <div class="addsub-layout">
          <TermList terms={problem.terms} current={reached + 1} doneThrough={reached} />
          <div class="addsub-board">
            <Abacus
              spec={spec}
              state={ab.state}
              onMove={feedback ? undefined : ab.move}
              ghost={showHint ? problem.checkpoints[Math.min(reached + 1, problem.checkpoints.length - 1)] : undefined}
              showValues={!!feedback}
            />
            {showHint && !feedback && (
              <ul class="hint">
                {problem.hints[Math.min(reached + 1, problem.hints.length - 1)].map((h, k) => (
                  <li key={k}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {feedback ? (
        <div class={`feedback ${!feedback.ok ? 'bad' : feedback.slow ? 'warn' : 'ok'}`}>
          {!feedback.ok
            ? `Not quite. The answer is ${feedback.expected}.`
            : feedback.slow
              ? `Correct, but over the ${set.targetSec}s target.`
              : 'Correct.'}
        </div>
      ) : null}

      <div class="controls">
        {!feedback && problem.kind !== 'read' && <button onClick={() => ab.reset()}>Clear</button>}
        {!feedback && problem.kind === 'addsub' && (
          <button onClick={() => { setHinted(true); setShowHint(true); }}>Hint</button>
        )}
        {feedback && problem.kind === 'addsub' && !feedback.ok && (
          <button onClick={() => setShowSolution((v) => !v)}>{showSolution ? 'Hide' : 'Show'} worked solution</button>
        )}
        {feedback ? (
          <button class="primary" onClick={next}>Next (Enter)</button>
        ) : (
          <button class="primary" onClick={check}>Check (Enter)</button>
        )}
        <button class="link" onClick={props.onExit}>Quit</button>
      </div>

      {showSolution && problem.kind === 'addsub' && (
        <Demo block={{ type: 'demo', title: 'worked solution', terms: problem.terms, rods: spec.rods }} />
      )}
    </div>
  );
}

/** Elapsed time against the target; freezes once the answer is checked. */
function Timer({ startedAt, targetSec, stopped }: { startedAt: number; targetSec: number; stopped: boolean }): JSX.Element {
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (stopped) return;
    const id = setInterval(() => setNow(performance.now()), 250);
    return () => clearInterval(id);
  }, [stopped]);
  const sec = Math.max(0, (now - startedAt) / 1000);
  return (
    <span class={`timer ${sec > targetSec ? 'timer-over' : ''}`}>
      {sec.toFixed(0)}s / {targetSec}s
    </span>
  );
}

function saveAnd(p: Progress): Progress {
  saveProgress(p);
  return p;
}
