import { supabase } from './supabase';

/**
 * Authorization header for the signed-in user's Supabase session, or nothing for a
 * signed-out visitor. The API identifies users only from this token, never from an email
 * sent in the request.
 */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
