'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { FrameworkId } from '@/lib/learning/types';

const LANG: Record<FrameworkId, string> = { 'us-ccss': 'en-US', 'ca-on': 'en-CA', 'uk-eng': 'en-GB', 'au-ac9': 'en-AU' };

// The Web Speech API is not in the standard DOM typings.
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};
const getCtor = () =>
  typeof window === 'undefined'
    ? undefined
    : ((window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition);

/**
 * Speech-to-text into the draft. Uses the browser's own speech service (in Chrome and Edge this
 * sends audio to the browser vendor). The piece is then marked as dictated, so spelling isn't
 * counted as the student's.
 */
export default function DictationButton({ curriculum, onText }: { curriculum: FrameworkId; onText: (text: string) => void }) {
  const supported = useSyncExternalStore(
    () => () => {},
    () => !!getCtor(),
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<Recognition | null>(null);

  useEffect(() => () => rec.current?.stop(), []);

  if (!supported) {
    return <p className="lw-small lw-muted">Dictation isn’t available in this browser. Try Chrome or Edge, or your device’s built-in dictation.</p>;
  }

  function toggle() {
    if (listening) {
      rec.current?.stop();
      return;
    }
    const Ctor = getCtor()!;
    const r = new Ctor();
    r.lang = LANG[curriculum];
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) onText(e.results[i][0].transcript.trim());
      }
    };
    r.onerror = (e) => setError(e.error === 'not-allowed' ? 'Allow microphone access to use dictation.' : 'Dictation stopped. Try again.');
    r.onend = () => setListening(false);
    rec.current = r;
    setError(null);
    r.start();
    setListening(true);
  }

  return (
    <div className="lw-btn-row" style={{ margin: '8px 0' }}>
      <button type="button" className={`lw-btn ${listening ? 'lw-btn-primary' : 'lw-btn-secondary'} lw-btn-small`} onClick={toggle} aria-pressed={listening}>
        <span aria-hidden="true">{listening ? '■' : '🎤'}</span> {listening ? 'Stop dictation' : 'Dictate'}
      </button>
      <span className="lw-small lw-muted" role="status">
        {listening ? 'Listening… speak, then press Stop. Add punctuation by typing.' : error ?? ''}
      </span>
    </div>
  );
}
