import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import { LEVELS } from '../lessons/levels';
import type { Level, PracticeSet } from '../lessons/types';
import { type Progress, exportProgress, importProgress, loadProgress, summarize } from '../progress';
import { Demo } from './Demo';
import { FreePlay } from './FreePlay';
import { Practice } from './Practice';
import { RichText } from './RichText';
import { TryIt } from './TryIt';

type Route = { page: 'level'; id: string; tab: 'learn' | 'practice'; set?: string } | { page: 'play' };

function parseHash(): Route {
  const [page, id, tab, set] = location.hash.replace(/^#\/?/, '').split('/');
  if (page === 'play') return { page: 'play' };
  const level = LEVELS.find((l) => l.id === id) ?? LEVELS[0];
  return { page: 'level', id: level.id, tab: tab === 'practice' ? 'practice' : 'learn', set };
}

function go(route: Route) {
  location.hash = route.page === 'play' ? '#/play' : `#/${route.page}/${route.id}/${route.tab}${route.set ? `/${route.set}` : ''}`;
}

export function App(): JSX.Element {
  const [route, setRoute] = useState(parseHash);
  const [progress, setProgress] = useState<Progress>(loadProgress);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <div class="layout">
      <nav class="sidebar">
        <h1>Abacus Trainer</h1>
        <ol class="levels">
          {LEVELS.map((l) => {
            const mastered = l.practice.every((p) => summarize(progress.sets[p.id]).mastered);
            return (
              <li key={l.id}>
                <a class={route.page === 'level' && route.id === l.id ? 'active' : ''} href={`#/level/${l.id}/learn`}>
                  <span class="level-num">{l.number}</span> {l.title} {mastered && <span class="badge ok">✓</span>}
                </a>
              </li>
            );
          })}
          <li class="muted soon">4 to 9: ten-complements, multiplication, division (coming)</li>
        </ol>
        <a class={`play-link ${route.page === 'play' ? 'active' : ''}`} href="#/play">Free play</a>
        <ProgressTools onImport={setProgress} />
      </nav>
      <main>
        {route.page === 'play' ? (
          <FreePlay />
        ) : (
          <LevelPage key={route.id} level={LEVELS.find((l) => l.id === route.id)!} route={route} progress={progress} onProgress={setProgress} />
        )}
      </main>
    </div>
  );
}

function LevelPage(props: { level: Level; route: Extract<Route, { page: 'level' }>; progress: Progress; onProgress: (p: Progress) => void }): JSX.Element {
  const { level, route } = props;
  const active = route.set ? level.practice.find((p) => p.id === route.set) : undefined;
  return (
    <section>
      <h2>
        Level {level.number}: {level.title}
      </h2>
      <p class="muted">{level.summary}</p>
      <div class="segmented">
        <button class={route.tab === 'learn' ? 'active' : ''} onClick={() => go({ page: 'level', id: level.id, tab: 'learn' })}>Learn</button>
        <button class={route.tab === 'practice' ? 'active' : ''} onClick={() => go({ page: 'level', id: level.id, tab: 'practice' })}>Practice</button>
      </div>
      {route.tab === 'learn' && (
        <div class="lesson">
          {level.learn.map((b, i) =>
            b.type === 'text' ? (
              <div key={i}>{b.paragraphs.map((p, j) => <RichText key={j} text={p} />)}</div>
            ) : b.type === 'try' ? (
              <TryIt key={i} block={b} />
            ) : (
              <Demo key={i} block={b} />
            ),
          )}
          <button class="primary" onClick={() => go({ page: 'level', id: level.id, tab: 'practice' })}>Go to practice</button>
        </div>
      )}
      {route.tab === 'practice' &&
        (active ? (
          <Practice
            key={active.id}
            set={active}
            progress={props.progress}
            onProgress={props.onProgress}
            onExit={() => go({ page: 'level', id: level.id, tab: 'practice' })}
          />
        ) : (
          <SetList level={level} progress={props.progress} />
        ))}
    </section>
  );
}

function SetList({ level, progress }: { level: Level; progress: Progress }): JSX.Element {
  return (
    <ul class="sets">
      {level.practice.map((p: PracticeSet) => {
        const s = summarize(progress.sets[p.id]);
        return (
          <li key={p.id} class="card set-row">
            <div>
              <strong>{p.title}</strong>
              <div class="muted">
                {s.attempts === 0
                  ? `${p.problems} problems`
                  : `Last ${s.attempts}: ${Math.round(s.accuracy * 100)}% clean${s.medianMs !== null ? `, median ${(s.medianMs / 1000).toFixed(1)}s` : ''}`}
              </div>
            </div>
            <div class="set-actions">
              {s.mastered && <span class="badge ok">Mastered</span>}
              <a class="button primary" href={`#/level/${level.id}/practice/${p.id}`}>Start</a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ProgressTools({ onImport }: { onImport: (p: Progress) => void }): JSX.Element {
  function doExport() {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'abacus-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function doImport(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    file.text().then((t) => {
      try {
        onImport(importProgress(t));
      } catch (err) {
        alert((err as Error).message);
      }
    });
  }
  return (
    <div class="progress-tools muted">
      <button class="link" onClick={doExport}>Export progress</button>
      <label class="link">
        Import
        <input type="file" accept="application/json" hidden onChange={doImport} />
      </label>
    </div>
  );
}
