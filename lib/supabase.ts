import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-side PostgREST client pointed at this app's own schema
// (app_<appId>), seeded into .env as NEXT_PUBLIC_SUPABASE_SCHEMA at scaffold
// time. Auth does NOT go through Supabase's auth service — users live in the
// app's own `users` table and are handled by the API routes in app/api/auth/*
// (see lib/auth.ts). This client is here for reading and writing app data.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || "public" },
});
