'use client';

import { useEffect, useSyncExternalStore } from 'react';

const KEY = 'nq-reading-prefs';
type Prefs = { size: 'm' | 'l' | 'xl'; spacing: 'normal' | 'wide' };
const SIZES = { m: '18px', l: '21px', xl: '24px' };

function apply(p: Prefs) {
  const root = document.documentElement;
  root.style.setProperty('--lw-writing-size', SIZES[p.size]);
  root.style.setProperty('--lw-body-size', p.size === 'm' ? '16px' : p.size === 'l' ? '18px' : '20px');
  root.dataset.spacing = p.spacing;
}

const DEFAULT = '{"size":"m","spacing":"normal"}';
const subscribe = (cb: () => void) => {
  window.addEventListener('nq-reading-prefs', cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener('nq-reading-prefs', cb);
    window.removeEventListener('storage', cb);
  };
};
const readRaw = () => {
  try {
    return localStorage.getItem(KEY) || DEFAULT;
  } catch {
    return DEFAULT;
  }
};

/** Text size and spacing for the writing area and lessons, remembered on this device. */
export default function ReadingPrefs() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => DEFAULT);
  let prefs: Prefs;
  try {
    prefs = JSON.parse(raw) as Prefs;
  } catch {
    prefs = JSON.parse(DEFAULT) as Prefs;
  }

  useEffect(() => apply(prefs), [prefs.size, prefs.spacing]); // eslint-disable-line react-hooks/exhaustive-deps

  function update(next: Prefs) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* not remembered */
    }
    window.dispatchEvent(new Event('nq-reading-prefs'));
    apply(next);
  }

  return (
    <details className="lw-prefs">
      <summary className="lw-btn lw-btn-quiet lw-small" aria-label="Reading settings">
        <span aria-hidden="true">Aa</span>
      </summary>
      <div className="lw-prefs-panel" role="group" aria-label="Reading settings">
        <p className="lw-label">Text size</p>
        <div className="lw-seg">
          {(['m', 'l', 'xl'] as const).map((s) => (
            <button key={s} type="button" aria-pressed={prefs.size === s} onClick={() => update({ ...prefs, size: s })}>
              {s === 'm' ? 'A' : s === 'l' ? 'A+' : 'A++'}
            </button>
          ))}
        </div>
        <p className="lw-label" style={{ marginTop: 10 }}>Line spacing</p>
        <div className="lw-seg">
          {(['normal', 'wide'] as const).map((s) => (
            <button key={s} type="button" aria-pressed={prefs.spacing === s} onClick={() => update({ ...prefs, spacing: s })}>
              {s === 'normal' ? 'Normal' : 'Wide'}
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
