---
Task ID: 10
Agent: Main Agent
Task: Create comprehensive Supabase PostgreSQL database migration SQL file

Work Log:
- Created `/home/z/my-project/supabase/` directory
- Created `/home/z/my-project/supabase/schema.sql` (315 lines) with complete database migration
- Defined 8 ENUM types: announcement_priority, target_role, member_role, request_status, professor_request_category, professor_request_target, professor_request_status, student_enrollment_status
- Created 7 tables: announcements, members, professor_requests, student_requests, courses, professor_courses, enrolled_students
- Added 14 performance indexes across all tables
- Created updated_at trigger function and applied it to professor_requests table
- Enabled Row Level Security (RLS) on all 7 tables with public read policies and service_role full access policies (14 policies total)
- Seeded exact data matching the in-memory store (src/lib/store.ts):
  - 4 announcements with exact Arabic content, priorities, and target roles
  - 8 department members with exact permissions arrays, positions, avatars, join dates, and active status
  - 5 professor requests with exact categories, targets, descriptions, statuses, and timestamps
  - 13 courses (8 from course catalog + 5 additional courses referenced by professor_courses/enrolled_students)
  - 8 professor course assignments with exact semester and enrolled counts
  - 31 enrolled students across 8 courses and 3 semesters with exact grades, marks, attendance, and statuses
- Used deterministic UUIDs for seed data to ensure reproducible inserts

Stage Summary:
- Complete production-ready Supabase migration SQL file created at supabase/schema.sql
- All data exactly matches the in-memory store in src/lib/store.ts
- RLS enabled with appropriate policies for public read and service_role full access
- Trigger ensures updated_at is auto-set on professor_requests UPDATE
