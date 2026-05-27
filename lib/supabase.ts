import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase clients for MBG Clicker.
 *
 * - `getSupabaseClient()` — anon/browser-safe client (uses the public anon key).
 * - `getSupabaseAdmin()`  — service-role client. SERVER ONLY. Never import this
 *   into a Client Component or anything that ships to the browser, or you leak
 *   the service key.
 *
 * Both are created lazily + memoized so the app still builds when env vars are
 * absent (Milestone 0 ships before the live Supabase project exists). They only
 * throw when actually called without configuration.
 *
 * See `.env.example` / `supabase/schema.sql` for setup.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let browserClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase tidak terkonfigurasi: set NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local (lihat .env.example).",
    );
  }
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

export function getSupabaseAdmin(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase admin tidak terkonfigurasi: set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY (server-only) di .env.local.",
    );
  }
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

/** True when the public Supabase env vars are present (safe to call client-side). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
