import { createClient } from "@supabase/supabase-js";

// Server-side PostgREST client pointed at this app's own schema (app_<appId>).
//
// Auth does NOT go through Supabase's auth service — the app's users live in its
// own `users` table, seeded by extra.sql at provision time, and are handled by
// the API routes in app/api/auth/*. At provision time the platform grants the
// anon key USAGE + SELECT/INSERT/UPDATE/DELETE on the schema's tables and adds
// the schema to PostgREST's exposed list, so these routes can read and write
// users without a service-role key — the same way project-mongo talks to its own
// database.
export function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || "public";
  return createClient(url, key, {
    db: { schema },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
