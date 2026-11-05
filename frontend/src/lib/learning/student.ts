import type { Learner } from './types';

const KEY = 'nq-student-session';

export interface StudentSession {
  token: string;
  expiresAt: string;
  learner: Learner;
}

/**
 * A student's code sign-in. The token only opens that student's own profile and expires after
 * 12 hours. It is kept on this device until it expires or the student signs out.
 */
export function readStudentSession(): StudentSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StudentSession;
    if (new Date(s.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function writeStudentSession(s: StudentSession | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the session lasts for this page only */
  }
  window.dispatchEvent(new Event('nq-student-session'));
}
