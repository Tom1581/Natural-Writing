'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { learningApi } from './api';
import { readStudentSession, writeStudentSession, type StudentSession } from './student';
import type { Learner } from './types';

const LEARNER_KEY = 'nq-learn-active-learner';

/** Only the learner's id is kept on the device; their writing lives on the server. */
function readStoredLearner(): string | null {
  try {
    return localStorage.getItem(LEARNER_KEY);
  } catch {
    return null;
  }
}

export function storeActiveLearner(id: string | null) {
  try {
    if (id) localStorage.setItem(LEARNER_KEY, id);
    else localStorage.removeItem(LEARNER_KEY);
  } catch {
    /* storage unavailable (private mode); the picker still works for this visit */
  }
}

/**
 * Who is using this device: an adult (Supabase session), a student (code session), or nobody.
 * `session` is the adult session; `student` is the student session.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncStudent = () => setStudent(readStudentSession());
    syncStudent();
    window.addEventListener('nq-student-session', syncStudent);
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener('nq-student-session', syncStudent);
    };
  }, []);

  const kind: 'adult' | 'student' | null = session ? 'adult' : student ? 'student' : null;
  return { session, student, kind, signedIn: kind !== null, ready };
}

/** Signed-in adult's student profiles plus the one currently practicing on this device. */
export function useLearners(enabled: boolean) {
  const [learners, setLearners] = useState<Learner[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    learningApi
      .listLearners()
      .then((list) => {
        if (cancelled) return;
        setLearners(list);
        const stored = readStoredLearner();
        const next = list.find((l) => l.id === stored)?.id ?? list[0]?.id ?? null;
        setActiveId(next);
        storeActiveLearner(next);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load student profiles.');
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, version]);

  /** Refetches the list; a learner chosen with select() beforehand stays active. */
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const select = useCallback((id: string) => {
    setActiveId(id);
    storeActiveLearner(id);
  }, []);

  return { learners, activeId, active: learners?.find((l) => l.id === activeId) ?? null, select, reload, error };
}

export async function signOutEverywhereOnDevice() {
  storeActiveLearner(null);
  writeStudentSession(null);
  await supabase.auth.signOut();
}
