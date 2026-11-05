'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { localize } from '@/lib/learning/localize';
import { useRegion } from '@/lib/learning/region';

const LANG: Record<string, string> = { 'us-ccss': 'en-US', 'ca-on': 'en-CA', 'uk-eng': 'en-GB', 'au-ac9': 'en-AU' };

/** Reads text aloud with the browser's built-in voice. Nothing is sent to a server. */
export default function ReadAloud({ text, label = 'Read aloud' }: { text: string; label?: string }) {
  const region = useRegion();
  const [speaking, setSpeaking] = useState(false);
  // False during server rendering and hydration, then true where the browser has speech.
  const supported = useSyncExternalStore(
    () => () => {},
    () => 'speechSynthesis' in window,
    () => false,
  );

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(localize(text, region));
    const lang = LANG[region ?? 'us-ccss'];
    utterance.lang = lang;
    utterance.voice = synth.getVoices().find((v) => v.lang === lang) ?? null;
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  }

  return (
    <button type="button" className="lw-btn lw-btn-quiet lw-small" onClick={toggle} aria-pressed={speaking}>
      <span aria-hidden="true">{speaking ? '■' : '▶'}</span> {speaking ? 'Stop reading' : label}
    </button>
  );
}
