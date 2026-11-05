import type { Catalog, CurriculumView, Drill, ExampleView, GradeView, Lesson, ReviewStatus, RubricView, WritingPrompt } from './types';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/** Public curriculum, cached on the server for an hour. Returns null if the API is unreachable. */
export async function fetchPublic<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}/v1/learning${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const getCatalog = () => fetchPublic<Catalog>('/catalog');
export const getLesson = (id: string) => fetchPublic<Lesson>(`/lessons/${encodeURIComponent(id)}`);
export const getPromptPublic = (id: string) => fetchPublic<WritingPrompt>(`/prompts/${encodeURIComponent(id)}`);
export const getDrillPublic = (id: string) => fetchPublic<Drill>(`/drills/${encodeURIComponent(id)}`);
export const getCurriculum = (id: string) => fetchPublic<CurriculumView>(`/curriculum/${encodeURIComponent(id)}`);

export const SITE_URL = 'https://naturalquill.one';
export const FRAMEWORK_SLUGS = ['us-ccss', 'ca-on', 'uk-eng', 'au-ac9'] as const;
export const getReviewStatus = (id: string) => fetchPublic<ReviewStatus>(`/content/${encodeURIComponent(id)}/review-status`);
export const getExamplePublic = (id: string) => fetchPublic<ExampleView>(`/examples/${encodeURIComponent(id)}`);
export const getGrade = (grade: string) => fetchPublic<GradeView>(`/grades/${encodeURIComponent(grade)}`);
export const getRubricPublic = (id: string) => fetchPublic<RubricView>(`/rubrics/${encodeURIComponent(id)}`);

/** Public URL slugs for grades (US-equivalent numbering, which the API uses). */
export const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;
export const gradeSlug = (grade: string) => (grade === 'K' ? 'kindergarten' : `grade-${grade}`);
export const gradeFromSlug = (slug: string) => {
  if (slug === 'kindergarten') return 'K';
  const m = /^grade-(\d{1,2})$/.exec(slug);
  return m && (GRADES as readonly string[]).includes(m[1]) ? m[1] : null;
};
export const usGradeName = (grade: string) => (grade === 'K' ? 'Kindergarten' : `Grade ${grade}`);

/** How each framework names a US-equivalent grade, e.g. grade "5" → England "Year 6". */
export function localNames(frameworks: { id: string; country: string; localToGrade: Record<string, string>; localGradeLabels: Record<string, string> }[], grade: string) {
  return frameworks.flatMap((f) => {
    const local = Object.keys(f.localToGrade).find((y) => f.localToGrade[y] === grade);
    return local ? [{ id: f.id, country: f.country, label: f.localGradeLabels[local] }] : [];
  });
}
