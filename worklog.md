---
Task ID: 1
Agent: Super Z (Main)
Task: Connect Supabase Postgres backend database to the academic department management system

Work Log:
- Analyzed existing codebase: found Supabase infrastructure already existed (client, server, database.types, supabase-store, API routes) but components still used in-memory store
- Fixed supabase-store.ts mappers: enrolled_students.name→student_name, professor_courses.code→course_code
- Added graceful Supabase client initialization with env var guards (getSupabase() function with null checks)
- Replaced all direct `supabase.` references with `getSupabase()` pattern (20+ action functions)
- Fixed HODDashboard: replaced sync `getStats()` + `useMemo` with `useStats()` hook
- Switched all 8 component imports from `@/lib/store` to `@/lib/supabase-store`
- Updated database.types.ts: added name/hours columns to professor_courses table
- Created SQL migration file (supabase/migrations/001_initial_schema.sql) with 7 tables, RLS policies, indexes, constraints, and seed data
- Created .env.local.example with Supabase configuration template
- Build succeeded, pushed to GitHub (commit 687a5cc)

Stage Summary:
- All components now use Supabase-backed store with realtime subscriptions
- Database schema includes: announcements, members, student_requests, courses, professor_courses, enrolled_students, professor_requests
- Graceful fallback when Supabase env vars are not configured (no crash during build)
- User needs to: create Supabase project, run SQL migration, set env vars on Vercel
