import { supabase } from '@/lib/supabase';
import { API } from './public';
import { readStudentSession, writeStudentSession, type StudentSession } from './student';
import type {
  ClassDetail,
  ClassSummary,
  CoachResult,
  Dashboard,
  Draft,
  FrameworkId,
  JobStatus,
  Learner,
  PlanView,
  QualitySummary,
  AuditEntry,
  Report,
  RosterResult,
  SchoolDetail,
  SchoolSummary,
  Supports,
  ReviewItem,
  SubmissionView, OperatorMetrics, PortfolioView, ContentQueue, GuestFeedbackResult } from './types';

export class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly body: unknown) {
    super(message);
  }
}

/** Authenticated call with the signed-in adult's Supabase access token. */
async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  // An adult session wins; otherwise a student's code session.
  const token = data.session?.access_token ?? readStudentSession()?.token;
  if (!token) throw new ApiError(401, 'Sign in to continue.', null);
  const res = await fetch(`${API}/v1/learning${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  if (res.status === 401 && !data.session) writeStudentSession(null);
  if (!res.ok) {
    const message = Array.isArray(json?.message) ? json.message.join(' ') : json?.message;
    throw new ApiError(res.status, message || 'Something went wrong. Please try again.', json);
  }
  return json as T;
}

/** Feedback without an account: no token, nothing stored. */
async function guestFeedback(body: { promptId: string; text: string; curriculum: FrameworkId; grade?: string; scribed?: boolean }) {
  const res = await fetch(`${API}/v1/learning/guest/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = Array.isArray(json?.message) ? json.message.join(' ') : json?.message;
    throw new ApiError(res.status, message || 'Feedback is not available right now. Your writing is still on this page.', json);
  }
  return json as GuestFeedbackResult;
}

export const learningApi = {
  guestFeedback,
  listLearners: () => call<Learner[]>('GET', '/learners'),
  createLearner: (body: {
    displayName: string;
    curriculum: FrameworkId;
    localGrade: string;
    relationship: string;
    agreeToNotice: boolean;
    noticeVersion: string;
    organizationId?: string;
    supports?: Supports;
    confirmedAge13?: boolean;
  }) => call<Learner>('POST', '/learners', body),
  updateSupports: (learnerId: string, body: Supports) => call<Learner>('PATCH', `/learners/${learnerId}/supports`, body),
  schools: () => call<SchoolSummary>('GET', '/orgs'),
  createSchool: (name: string, curriculum: FrameworkId) => call<SchoolDetail>('POST', '/orgs', { name, curriculum }),
  school: (id: string) => call<SchoolDetail>('GET', `/orgs/${id}`),
  inviteMember: (id: string, email: string, role: 'admin' | 'teacher') => call<SchoolDetail>('POST', `/orgs/${id}/members`, { email, role }),
  acceptInvite: (id: string) => call<SchoolDetail>('POST', `/orgs/${id}/accept`),
  removeSchoolMember: (id: string, memberId: string) => call<SchoolDetail>('DELETE', `/orgs/${id}/members/${memberId}`),
  importRoster: (
    id: string,
    body: { classId?: string; students: { displayName: string; localGrade: string }[]; agreeToNotice: boolean; noticeVersion: string },
  ) => call<RosterResult>('POST', `/orgs/${id}/roster`, body),
  schoolAudit: (id: string) => call<AuditEntry[]>('GET', `/orgs/${id}/audit`),
  createAccessCode: (learnerId: string) => call<{ code: string }>('POST', `/learners/${learnerId}/access-code`),
  revokeAccessCode: (learnerId: string) => call<{ revoked: true }>('DELETE', `/learners/${learnerId}/access-code`),
  report: (learnerId: string) => call<Report>('GET', `/learners/${learnerId}/report`),
  exportData: (learnerId: string) => call<unknown>('GET', `/learners/${learnerId}/export`),
  coach: (draftId: string) => call<CoachResult>('POST', `/drafts/${draftId}/coach`),
  override: (submissionId: string, body: { skillId: string; rating?: number | null; comment: string }) =>
    call<{ saved: true }>('POST', `/submissions/${submissionId}/overrides`, body),
  classes: () => call<ClassSummary[]>('GET', '/classes'),
  createClass: (name: string, organizationId?: string) => call<ClassSummary>('POST', '/classes', { name, ...(organizationId ? { organizationId } : {}) }),
  classDetail: (id: string) => call<ClassDetail>('GET', `/classes/${id}`),
  deleteClass: (id: string) => call<{ deleted: true }>('DELETE', `/classes/${id}`),
  addMember: (classId: string, learnerId: string) => call<{ added: true }>('POST', `/classes/${classId}/members/${learnerId}`),
  removeMember: (classId: string, learnerId: string) => call<{ removed: true }>('DELETE', `/classes/${classId}/members/${learnerId}`),
  createAssignment: (classId: string, body: { promptId: string; lessonId?: string; note?: string; dueDate?: string }) =>
    call<{ id: string }>('POST', `/classes/${classId}/assignments`, body),
  deleteAssignment: (id: string) => call<{ deleted: true }>('DELETE', `/assignments/${id}`),
  review: (classId?: string) => call<ReviewItem[]>('GET', `/review${classId ? `?classId=${classId}` : ''}`),
  plan: (learnerId: string) => call<PlanView>('GET', `/learners/${learnerId}/plan`),
  updatePreferences: (learnerId: string, body: { sessionsPerWeek?: number; interests?: string[] }) =>
    call<PlanView>('PATCH', `/learners/${learnerId}/preferences`, body),
  setFocus: (learnerId: string, skillId: string | null) => call<PlanView>('PATCH', `/learners/${learnerId}/focus`, { skillId }),
  restartPlan: (learnerId: string) => call<PlanView>('POST', `/learners/${learnerId}/plan/restart`),
  completeDrill: (learnerId: string, drillId: string) => call<{ recorded: true }>('POST', `/learners/${learnerId}/drills/${drillId}/complete`),
  confirmRatings: (submissionId: string) => call<{ confirmed: number }>('POST', `/submissions/${submissionId}/confirm`),
  resolveFlag: (flagId: string, note: string) => call<{ resolved: true }>('POST', `/safety-flags/${flagId}/resolve`, { note }),
  quality: () => call<QualitySummary>('GET', '/quality'),
  metrics: () => call<OperatorMetrics>('GET', '/admin/metrics'),
  contentQueue: () => call<ContentQueue>('GET', '/content/reviews'),
  addContentReview: (body: { itemType: string; itemId: string; decision: 'approve' | 'changes' | 'comment'; notes: string; reviewerName: string; reviewerRole: string }) =>
    call<{ id: string; itemVersion: number }>('POST', '/content/reviews', body),
  portfolio: (learnerId: string) => call<PortfolioView>('GET', `/learners/${learnerId}/portfolio`),
  setPortfolio: (submissionId: string, include: boolean) =>
    call<{ inPortfolio: boolean }>('POST', `/submissions/${submissionId}/portfolio`, { include }),
  setHelpfulness: (submissionId: string, value: 'yes' | 'somewhat' | 'no') =>
    call<{ helpfulness: string }>('POST', `/submissions/${submissionId}/helpfulness`, { value }),
  deleteLearner: (id: string) => call<{ deleted: true }>('DELETE', `/learners/${id}`),
  dashboard: (learnerId: string) => call<Dashboard>('GET', `/learners/${learnerId}/dashboard`),
  openDraft: (learnerId: string, promptId: string) => call<Draft>('POST', '/drafts', { learnerId, promptId }),
  saveDraft: (id: string, body: { content: string; planning?: Record<string, string>; expectedRevision: number; usedDictation?: boolean }) =>
    call<{ id: string; revision: number; savedAt: string }>('PATCH', `/drafts/${id}`, body),
  submit: (body: { draftId: string; expectedRevision: number; idempotencyKey: string; scribed?: boolean }) => call<JobStatus>('POST', '/submissions', body),
  processJob: (jobId: string) => call<JobStatus>('POST', `/evaluation-jobs/${jobId}/process`),
  retryJob: (jobId: string) => call<JobStatus>('POST', `/evaluation-jobs/${jobId}/retry`),
  submission: (id: string) => call<SubmissionView>('GET', `/submissions/${id}`),
  saveReflection: (id: string, text: string) => call<{ saved: true }>('POST', `/submissions/${id}/reflection`, { text }),
  reportFeedback: (id: string, reason: string) => call<{ reported: true }>('POST', `/submissions/${id}/feedback-report`, { reason }),
};

/**
 * Drives an evaluation job to a final state. Each call runs the job inside that request;
 * while the free AI tier is busy, it waits the server-suggested delay and tries again.
 */
export async function runUntilSettled(jobId: string, onUpdate: (s: JobStatus) => void, signal?: AbortSignal): Promise<JobStatus> {
  let status = await learningApi.processJob(jobId);
  onUpdate(status);
  while ((status.state === 'queued' || status.state === 'running') && !signal?.aborted) {
    const waitMs = Math.min(Math.max((status.retryInSeconds ?? 3) * 1000, 2000), 60000);
    await new Promise((r) => setTimeout(r, waitMs));
    if (signal?.aborted) break;
    status = await learningApi.processJob(jobId);
    onUpdate(status);
  }
  return status;
}

/** Exchanges a student's code for a session limited to their own profile. */
export async function startStudentSession(code: string): Promise<StudentSession> {
  const res = await fetch(`${API}/v1/learning/student-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, json?.message || 'That code didn’t work.', json);
  const session = json as StudentSession;
  writeStudentSession(session);
  return session;
}
