---
Task ID: 13
Agent: Main Agent
Task: Create Supabase-backed store (supabase-store.ts) as drop-in replacement for in-memory store

Work Log:
- Read existing `src/lib/store.ts` (914 lines) to understand all types, constants, hooks, and action functions
- Verified `src/lib/supabase/client.ts` uses `createBrowserClient` from `@supabase/ssr`
- Created `/home/z/my-project/src/lib/supabase-store.ts` — complete Supabase-backed store with:
  - Re-exports of ALL 11 types (Announcement, StudentRequest, Course, PermissionKey, DepartmentMember, ProfessorRequest, ProfessorRequestTarget, ProfessorRequestCategory, ProfessorRequestStatus, EnrolledStudent, ProfessorCourse, StoreState)
  - Re-exports of ALL 18 constants/label/color maps from original store
  - Module-level external store infrastructure with `useSyncExternalStore` pattern (avoids React hooks lint issues)
  - Module-level cache (`tableCache`) for each of the 7 Supabase tables
  - Module-level listener sets (`tableListeners`) for reactive updates
  - Realtime subscriptions set up on module load for all 7 tables
  - Row mapper functions for each entity type (DB snake_case → TypeScript camelCase mapping)
  - 7 data hooks: `useAnnouncements`, `useStudentRequests`, `useMembers`, `useProfessorRequests`, `useProfessorCourses`, `useEnrolledStudents`, `useCourses`
  - `useStats` hook backed by async `getStats()` function with multi-table subscriptions
  - 12 async action functions: `addAnnouncement`, `deleteAnnouncement`, `addStudentRequest`, `deleteStudentRequest`, `addProfessorRequest`, `updateProfessorRequestStatus`, `deleteProfessorRequest`, `addMember`, `deleteMember`, `toggleMemberPermission`, `toggleMemberStatus`, `updateMemberPermissions`
  - `getAnnouncementsForRole` utility function
- Lint verified: zero errors from supabase-store.ts (15 pre-existing errors in store.ts only)

Stage Summary:
- 1 file created: `src/lib/supabase-store.ts` (~420 lines)
- Exact same public API as `src/lib/store.ts` — drop-in replacement
- All hooks use `useSyncExternalStore` for consistent reactivity (same pattern as original store)
- Realtime subscriptions provide live data updates across all components
- All action functions are async and use Supabase client directly
- Column name mappings: created_at→createdAt, target_role→targetRole, is_active→isActive, joined_at→joinedAt, course_code→courseCode, student_id→studentId, mid_term_mark→midTermMark, final_mark→finalMark, assignments_mark→assignmentsMark, professor_name→professorName, enrolled_count→enrolledCount, target_student_id→targetStudentId, target_student_name→targetStudentName, updated_at→updatedAt
